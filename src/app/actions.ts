"use server";

import { revalidatePath } from "next/cache";
import { Connection, PublicKey } from "@solana/web3.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getOrCreateUser } from "@/lib/auth";
import { MEME_CATEGORIES } from "@/lib/domain";

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
