"use server";

import { revalidatePath } from "next/cache";
import { Connection, PublicKey } from "@solana/web3.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getOrCreateUser, isAdmin } from "@/lib/auth";
import { getApplicationsForReview } from "@/lib/data";
import { MEME_CATEGORIES } from "@/lib/domain";
import {
  collectPumpCreatorFees,
  creatorFeeAutomationStatus,
  type CollectCreatorFeesResult,
  type CreatorFeeAutomationStatus,
} from "@/lib/pumpportal";
import type { RevivalApplication } from "@/lib/types";

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

const MEME_CATEGORY_SLUGS = new Set(MEME_CATEGORIES.map((c) => c.slug));
const ALLOWED_CHAINS = new Set(["solana", "ethereum", "base", "bsc"]);
const VOTE_CHOICES = new Set(["revive", "skip", "needs_research"]);
const VOTABLE_STATUSES = new Set(["newly_submitted", "under_review", "candidate", "up_for_vote"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown, maxLength = 2_000): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanTicker(value: unknown): string {
  return cleanText(value, 24).toUpperCase().replace(/^\$/, "");
}

function cleanOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function cleanChain(value: unknown): string {
  const chain = cleanText(value, 40).toLowerCase();
  return ALLOWED_CHAINS.has(chain) ? chain : "solana";
}

function cleanUrl(value: unknown, maxLength = 500): string | null {
  const text = cleanText(value, maxLength);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/** Returns the canonical base58 Solana address, or null if invalid. */
function cleanSolanaAddress(value: unknown): string | null {
  const text = cleanText(value, 64);
  if (!text) return null;
  try {
    return new PublicKey(text).toBase58();
  } catch {
    return null;
  }
}

function cleanLinks(value: unknown, max = 5): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => cleanUrl(v)).filter((v): v is string => Boolean(v)).slice(0, max);
}

function cleanPositiveNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function cleanVoteChoice(value: unknown): VoteChoiceInput | null {
  return typeof value === "string" && VOTE_CHOICES.has(value) ? (value as VoteChoiceInput) : null;
}

function cleanCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) return [];
  return categories
    .filter((c): c is string => typeof c === "string" && MEME_CATEGORY_SLUGS.has(c))
    .slice(0, 8);
}

function submissionTokenMint(): string {
  return cleanText(process.env.REVIVAL_REQUEST_TOKEN_MINT || process.env.NEXT_PUBLIC_TOKEN_MINT, 90);
}

function solanaRpcUrl(): string {
  return cleanText(process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL, 500);
}

function minSubmissionTokenAmount(): number {
  const n = Number(process.env.REVIVAL_REQUEST_MIN_TOKEN_AMOUNT ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

async function verifySubmissionTokenHolding(walletAddress: string | null): Promise<ActionResult> {
  const mint = submissionTokenMint();
  if (!mint) return { ok: true };
  if (!walletAddress) {
    return { ok: false, error: "Connect a Solana wallet that holds the CTO token to request a revival." };
  }

  const rpcUrl = solanaRpcUrl();
  if (!rpcUrl) {
    return { ok: false, error: "Token-gated submissions are not configured. Set SOLANA_RPC_URL." };
  }

  try {
    const owner = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(mint);
    const connection = new Connection(rpcUrl, "confirmed");
    const accounts = await connection.getParsedTokenAccountsByOwner(owner, { mint: tokenMint });
    const required = minSubmissionTokenAmount();

    for (const account of accounts.value) {
      // Parsed SPL token shape from getParsedTokenAccountsByOwner.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenAmount = (account.account.data as any)?.parsed?.info?.tokenAmount;
      const uiAmount = Number(tokenAmount?.uiAmountString ?? tokenAmount?.uiAmount ?? 0);
      if (Number.isFinite(uiAmount) && uiAmount >= required) return { ok: true };
    }
    return { ok: false, error: "Your connected wallet does not hold enough CTO tokens to request a revival." };
  } catch (e) {
    logActionError("verifySubmissionTokenHolding", e);
    return { ok: false, error: "Could not verify your CTO token balance. Please try again." };
  }
}

async function enforceRateLimit(
  admin: SupabaseClient,
  userId: string,
  action: string,
  maxAttempts: number,
  windowSeconds: number,
): Promise<ActionResult> {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count, error: countErr } = await admin
    .from("action_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("occurred_at", since);
  if (countErr) return { ok: false, error: "Security checks are not ready. Apply the latest database migrations." };
  if ((count ?? 0) >= maxAttempts) {
    return { ok: false, error: "Too many attempts. Please try again later." };
  }

  const { error: insertErr } = await admin.from("action_events").insert({ user_id: userId, action });
  if (insertErr) return { ok: false, error: "Security checks are not ready. Apply the latest database migrations." };
  return { ok: true };
}

function logActionError(action: string, error: unknown) {
  console.error(`[${action}]`, error);
}

// ----------------------------------------------------------------------------
// Submit a dead coin to the Graveyard
// ----------------------------------------------------------------------------
export interface SubmitCoinInput {
  name: string;
  ticker: string;
  contractAddress: string;
  chain: string;
  chartUrl?: string;
  marketCap?: number;
  liquidity?: number;
  holderCount?: number;
  oldSocials?: string;
  reasonDied: string;
  reasonRevive: string;
  riskNotes?: string;
  categories: string[];
}

export async function submitDeadCoin(
  token: string | null,
  input: SubmitCoinInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getOrCreateUser(token);
    const name = cleanText(input.name, 120);
    const ticker = cleanTicker(input.ticker);
    const contractAddress = cleanText(input.contractAddress, 160);
    const reasonDied = cleanText(input.reasonDied);
    const reasonRevive = cleanText(input.reasonRevive);

    if (!name || !ticker) {
      return { ok: false, error: "Name and ticker are required." };
    }
    if (!contractAddress) {
      return { ok: false, error: "Contract address is required." };
    }
    if (!reasonDied || !reasonRevive) {
      return { ok: false, error: "Revival story fields are required." };
    }
    const holderGate = await verifySubmissionTokenHolding(user.wallet);
    if (!holderGate.ok) return { ok: false, error: holderGate.error };

    const admin = createSupabaseAdminClient();
    const limited = await enforceRateLimit(admin, user.id, "submit_dead_coin", 5, 60 * 60);
    if (!limited.ok) return { ok: false, error: limited.error };

    const { data, error } = await admin
      .from("dead_coins")
      .insert({
        name,
        ticker,
        contract_address: contractAddress,
        chain: cleanChain(input.chain),
        chart_url: cleanUrl(input.chartUrl),
        market_cap: cleanOptionalNumber(input.marketCap),
        liquidity: cleanOptionalNumber(input.liquidity),
        holder_count: cleanOptionalNumber(input.holderCount),
        old_socials: cleanText(input.oldSocials) ? { raw: cleanText(input.oldSocials) } : {},
        status: "newly_submitted",
        reason_died: reasonDied,
        reason_revive: reasonRevive,
        risk_notes: cleanText(input.riskNotes) || null,
        categories: cleanCategories(input.categories),
        submitted_by: user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      logActionError("submitDeadCoin:insert", error);
      return { ok: false, error: "Could not submit this coin. Please check the fields and try again." };
    }
    revalidatePath("/graveyard");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    logActionError("submitDeadCoin", e);
    return { ok: false, error: "Submission failed." };
  }
}

// ----------------------------------------------------------------------------
// Cast a vote on a dead coin
// ----------------------------------------------------------------------------
export type VoteChoiceInput = "revive" | "skip" | "needs_research";

export async function castVote(
  token: string | null,
  coinId: string,
  choice: VoteChoiceInput,
): Promise<ActionResult<{ revive: number; skip: number; research: number }>> {
  try {
    if (!isUuid(coinId)) return { ok: false, error: "Invalid coin id." };
    const voteChoice = cleanVoteChoice(choice);
    if (!voteChoice) return { ok: false, error: "Invalid vote." };

    const user = await getOrCreateUser(token);
    const admin = createSupabaseAdminClient();
    const limited = await enforceRateLimit(admin, user.id, "cast_vote", 30, 60 * 60);
    if (!limited.ok) return { ok: false, error: limited.error };

    const { data: coin, error: coinErr } = await admin
      .from("dead_coins")
      .select("id,status")
      .eq("id", coinId)
      .maybeSingle();
    if (coinErr) {
      logActionError("castVote:coin", coinErr);
      return { ok: false, error: "Vote failed." };
    }
    if (!coin || !VOTABLE_STATUSES.has(coin.status)) {
      return { ok: false, error: "This coin is not open for voting." };
    }

    const { error: voteErr } = await admin.from("votes").upsert(
      { voter_id: user.id, target_type: "dead_coin", target_id: coinId, vote: voteChoice },
      { onConflict: "voter_id,target_type,target_id" },
    );
    if (voteErr) {
      logActionError("castVote:upsert", voteErr);
      return { ok: false, error: "Vote failed." };
    }

    // Recompute the denormalized counters from the votes table.
    const { data: rows, error: tallyErr } = await admin
      .from("votes")
      .select("vote")
      .eq("target_type", "dead_coin")
      .eq("target_id", coinId);
    if (tallyErr) {
      logActionError("castVote:tally", tallyErr);
      return { ok: false, error: "Vote failed." };
    }

    const tally = { revive: 0, skip: 0, research: 0 };
    for (const r of rows ?? []) {
      if (r.vote === "revive") tally.revive++;
      else if (r.vote === "skip") tally.skip++;
      else if (r.vote === "needs_research") tally.research++;
    }

    const { error: updateErr } = await admin
      .from("dead_coins")
      .update({ votes_revive: tally.revive, votes_skip: tally.skip, votes_research: tally.research })
      .eq("id", coinId);
    if (updateErr) {
      logActionError("castVote:update", updateErr);
      return { ok: false, error: "Vote failed." };
    }

    revalidatePath(`/graveyard/${coinId}`);
    revalidatePath("/graveyard");
    return { ok: true, data: tally };
  } catch (e) {
    logActionError("castVote", e);
    return { ok: false, error: "Vote failed." };
  }
}

// ----------------------------------------------------------------------------
// Submit work to a bounty
// ----------------------------------------------------------------------------
export interface SubmitWorkInput {
  bountyId: string;
  submissionText: string;
  fileUrl?: string;
  linkUrl?: string;
}

export async function submitBountyWork(
  token: string | null,
  input: SubmitWorkInput,
): Promise<ActionResult> {
  try {
    if (!isUuid(input.bountyId)) return { ok: false, error: "Invalid bounty id." };
    const user = await getOrCreateUser(token);
    const admin = createSupabaseAdminClient();
    const limited = await enforceRateLimit(admin, user.id, "submit_bounty_work", 10, 60 * 60);
    if (!limited.ok) return limited;

    const submissionText = cleanText(input.submissionText, 5_000);
    if (!submissionText) return { ok: false, error: "A description is required." };

    const { data: bounty, error: bountyErr } = await admin
      .from("bounties")
      .select("id,status,deadline")
      .eq("id", input.bountyId)
      .maybeSingle();
    if (bountyErr) {
      logActionError("submitBountyWork:bounty", bountyErr);
      return { ok: false, error: "Submission failed." };
    }
    if (!bounty || bounty.status !== "open") {
      return { ok: false, error: "This bounty is not accepting submissions." };
    }
    if (bounty.deadline && new Date(bounty.deadline).getTime() < Date.now()) {
      return { ok: false, error: "This bounty deadline has passed." };
    }

    const { error } = await admin.from("submissions").insert({
      bounty_id: input.bountyId,
      contributor_id: user.id,
      submission_text: submissionText,
      file_url: cleanUrl(input.fileUrl),
      link_url: cleanUrl(input.linkUrl),
      status: "pending",
    });
    if (error) {
      logActionError("submitBountyWork:insert", error);
      return { ok: false, error: "Submission failed." };
    }
    revalidatePath(`/bounties/${input.bountyId}`);
    return { ok: true };
  } catch (e) {
    logActionError("submitBountyWork", e);
    return { ok: false, error: "Submission failed." };
  }
}

// ----------------------------------------------------------------------------
// Revival applications — a team applies to lead the takeover of a dead token.
// CTO.fun token fees fund a SOL bounty on Pump.fun; teams don't pay, they earn.
// ----------------------------------------------------------------------------
async function requireAdmin(token: string | null): Promise<{ ok: true; user: Awaited<ReturnType<typeof getOrCreateUser>> } | { ok: false; error: string }> {
  const user = await getOrCreateUser(token);
  if (!isAdmin(user)) return { ok: false, error: "Not authorized." };
  return { ok: true, user };
}

/** Admin-only: load the full application review queue. Verifies admin first. */
export async function getReviewQueue(token: string | null): Promise<ActionResult<RevivalApplication[]>> {
  try {
    const auth = await requireAdmin(token);
    if (!auth.ok) return { ok: false, error: auth.error };
    const data = await getApplicationsForReview();
    return { ok: true, data };
  } catch (e) {
    logActionError("getReviewQueue", e);
    return { ok: false, error: "Could not load the review queue." };
  }
}

export async function getCreatorFeeAutomationStatus(
  token: string | null,
): Promise<ActionResult<CreatorFeeAutomationStatus>> {
  try {
    const auth = await requireAdmin(token);
    if (!auth.ok) return { ok: false, error: auth.error };
    return { ok: true, data: creatorFeeAutomationStatus() };
  } catch (e) {
    logActionError("getCreatorFeeAutomationStatus", e);
    return { ok: false, error: "Could not load creator-fee automation status." };
  }
}

export async function collectCreatorFeesNow(
  token: string | null,
): Promise<ActionResult<CollectCreatorFeesResult>> {
  try {
    const auth = await requireAdmin(token);
    if (!auth.ok) return { ok: false, error: auth.error };

    const admin = createSupabaseAdminClient();
    const limited = await enforceRateLimit(admin, auth.user.id, "collect_creator_fees", 3, 60 * 60);
    if (!limited.ok) return { ok: false, error: limited.error };

    return { ok: true, data: await collectPumpCreatorFees() };
  } catch (e) {
    logActionError("collectCreatorFeesNow", e);
    return { ok: false, error: e instanceof Error ? e.message : "Creator-fee collection failed." };
  }
}

export interface ApplyToReviveInput {
  mint: string;
  tokenName: string;
  tokenSymbol: string;
  tokenImageUrl?: string;
  teamName: string;
  pitch: string;
  plan?: string;
  teamSize?: number;
  teamMembers?: string;
  priorWork?: string;
  payoutWallet: string;
  contact?: string;
}

export async function applyToReviveToken(
  token: string | null,
  input: ApplyToReviveInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getOrCreateUser(token);

    const mint = cleanText(input.mint, 64);
    const tokenName = cleanText(input.tokenName, 120);
    const tokenSymbol = cleanTicker(input.tokenSymbol);
    const teamName = cleanText(input.teamName, 120);
    const pitch = cleanText(input.pitch, 4_000);
    const payoutWallet = cleanSolanaAddress(input.payoutWallet);

    if (!mint || !tokenName || !tokenSymbol) {
      return { ok: false, error: "Missing token details. Apply from a discovered token." };
    }
    if (!teamName || !pitch) {
      return { ok: false, error: "Team name and pitch are required." };
    }
    if (pitch.length < 80) {
      return { ok: false, error: "Tell us more — your pitch should make the case for your team (80+ chars)." };
    }
    if (!payoutWallet) {
      return { ok: false, error: "A valid Solana payout wallet is required to receive the bounty." };
    }

    // Same token-hold gate as scouting: proves skin in the game.
    const holderGate = await verifySubmissionTokenHolding(user.wallet);
    if (!holderGate.ok) return { ok: false, error: holderGate.error };

    const admin = createSupabaseAdminClient();
    const limited = await enforceRateLimit(admin, user.id, "apply_to_revive", 5, 60 * 60);
    if (!limited.ok) return { ok: false, error: limited.error };

    const teamSize = Math.max(1, Math.min(99, Math.round(Number(input.teamSize ?? 1)) || 1));
    const { data, error } = await admin
      .from("revival_applications")
      .insert({
        mint,
        token_name: tokenName,
        token_symbol: tokenSymbol,
        token_image_url: cleanUrl(input.tokenImageUrl),
        applicant_id: user.id,
        team_name: teamName,
        pitch,
        plan: cleanText(input.plan, 4_000) || null,
        team_size: teamSize,
        team_members: cleanText(input.teamMembers, 2_000) || null,
        prior_work: cleanText(input.priorWork, 2_000) || null,
        payout_wallet: payoutWallet,
        contact: cleanText(input.contact, 200) || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !data) {
      // 23505 = unique violation: this team already has a live bid on this token.
      if (error?.code === "23505") {
        return { ok: false, error: "You already have an active application for this token." };
      }
      logActionError("applyToReviveToken:insert", error);
      return { ok: false, error: "Could not submit your application. Please try again." };
    }
    revalidatePath(`/revive/${mint}`);
    revalidatePath("/revivals");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    logActionError("applyToReviveToken", e);
    return { ok: false, error: "Application failed." };
  }
}

export type ReviewDecision = "approve" | "reject" | "fund";

export interface ReviewApplicationInput {
  applicationId: string;
  decision: ReviewDecision;
  bountyAmountSol?: number;
  bountyPumpfunUrl?: string;
  notes?: string;
}

export async function reviewRevivalApplication(
  token: string | null,
  input: ReviewApplicationInput,
): Promise<ActionResult> {
  try {
    if (!isUuid(input.applicationId)) return { ok: false, error: "Invalid application id." };
    const auth = await requireAdmin(token);
    if (!auth.ok) return { ok: false, error: auth.error };

    const admin = createSupabaseAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: cleanText(input.notes, 2_000) || null,
    };

    if (input.decision === "reject") {
      patch.status = "rejected";
    } else if (input.decision === "approve") {
      const bounty = cleanPositiveNumber(input.bountyAmountSol);
      if (!bounty) return { ok: false, error: "Set a SOL bounty amount to approve a team." };
      patch.status = "approved";
      patch.bounty_amount_sol = bounty;
    } else if (input.decision === "fund") {
      patch.status = "funded";
      const url = cleanUrl(input.bountyPumpfunUrl);
      if (url) patch.bounty_pumpfun_url = url;
      const bounty = cleanPositiveNumber(input.bountyAmountSol);
      if (bounty) patch.bounty_amount_sol = bounty;
    } else {
      return { ok: false, error: "Unknown decision." };
    }

    const { error } = await admin.from("revival_applications").update(patch).eq("id", input.applicationId);
    if (error) {
      logActionError("reviewRevivalApplication:update", error);
      return { ok: false, error: "Could not update the application." };
    }
    revalidatePath("/admin");
    revalidatePath("/revivals");
    return { ok: true };
  } catch (e) {
    logActionError("reviewRevivalApplication", e);
    return { ok: false, error: "Review failed." };
  }
}

export interface DeliverRevivalInput {
  applicationId: string;
  proof: string;
  links?: string[];
}

export async function markRevivalDelivered(
  token: string | null,
  input: DeliverRevivalInput,
): Promise<ActionResult> {
  try {
    if (!isUuid(input.applicationId)) return { ok: false, error: "Invalid application id." };
    const user = await getOrCreateUser(token);
    const proof = cleanText(input.proof, 5_000);
    if (!proof) return { ok: false, error: "Describe what your team delivered." };

    const admin = createSupabaseAdminClient();
    const { data: app, error: appErr } = await admin
      .from("revival_applications")
      .select("id, applicant_id, status")
      .eq("id", input.applicationId)
      .maybeSingle();
    if (appErr || !app) return { ok: false, error: "Application not found." };
    if (app.applicant_id !== user.id) return { ok: false, error: "Only the applying team can submit delivery." };
    if (!["approved", "funded"].includes(app.status)) {
      return { ok: false, error: "This revival isn't in a deliverable state." };
    }

    const { error } = await admin
      .from("revival_applications")
      .update({
        status: "delivered",
        delivery_proof: proof,
        delivery_links: cleanLinks(input.links),
        delivered_at: new Date().toISOString(),
      })
      .eq("id", input.applicationId);
    if (error) {
      logActionError("markRevivalDelivered:update", error);
      return { ok: false, error: "Could not submit delivery." };
    }
    revalidatePath("/revivals");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    logActionError("markRevivalDelivered", e);
    return { ok: false, error: "Delivery failed." };
  }
}

export interface RecordPayoutInput {
  applicationId: string;
  payoutTx: string;
  amountSol: number;
}

export async function recordRevivalPayout(
  token: string | null,
  input: RecordPayoutInput,
): Promise<ActionResult> {
  try {
    if (!isUuid(input.applicationId)) return { ok: false, error: "Invalid application id." };
    const auth = await requireAdmin(token);
    if (!auth.ok) return { ok: false, error: auth.error };

    const payoutTx = cleanText(input.payoutTx, 128);
    const amount = cleanPositiveNumber(input.amountSol);
    if (!payoutTx) return { ok: false, error: "Paste the payout transaction signature." };
    if (!amount) return { ok: false, error: "Enter the SOL amount paid." };

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("revival_applications")
      .update({
        status: "paid",
        payout_tx: payoutTx,
        paid_amount_sol: amount,
        paid_at: new Date().toISOString(),
      })
      .eq("id", input.applicationId);
    if (error) {
      logActionError("recordRevivalPayout:update", error);
      return { ok: false, error: "Could not record the payout." };
    }
    revalidatePath("/revivals");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    logActionError("recordRevivalPayout", e);
    return { ok: false, error: "Payout record failed." };
  }
}
