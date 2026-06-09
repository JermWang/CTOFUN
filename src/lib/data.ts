// ============================================================================
// Live data-access layer. Queries Supabase (public RLS read) and maps rows to
// the UI types in mock-data.ts. Falls back to the mock arrays if Supabase isn't
// configured or a query fails, so the app never hard-crashes on data.
// ============================================================================

import "server-only";
import { createSupabaseReadClient } from "@/lib/supabase/server";
import {
  findDeadTokenCandidates,
  type DiscoveredDeadToken,
} from "@/lib/dead-token-sweeper";
import {
  deadCoins as mockDeadCoins,
  campaigns as mockCampaigns,
  graduatedCampaigns as mockGraduated,
  bounties as mockBounties,
  contributors as mockContributors,
  buybacks as mockBuybacks,
  guildStats as mockGuildStats,
  globalMetrics as mockGlobalMetrics,
  type DeadCoin,
  type RevivalCampaign,
  type Bounty,
  type Contributor,
  type Buyback,
} from "@/lib/mock-data";
import type { BountyCategory, BountyStatus, DeadCoinStatus, RevivalPhase } from "@/lib/domain";

const AVATAR_PALETTE = ["#2dd47e", "#9b7bff", "#f5b54a", "#ff5d6c", "#4ab5f5"];
function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function isConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function splitLines(text: string | null): string[] {
  return (text ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
}

// ----------------------------------------------------------------------------
// Mappers
// ----------------------------------------------------------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapDeadCoin(row: any, submitter?: string): DeadCoin {
  return {
    id: row.id,
    name: row.name,
    ticker: row.ticker,
    contractAddress: row.contract_address ?? "",
    chain: row.chain,
    chartUrl: row.chart_url ?? "",
    marketCap: Number(row.market_cap ?? 0),
    liquidity: Number(row.liquidity ?? 0),
    holderCount: row.holder_count ?? 0,
    launchDate: row.launch_date ?? "",
    status: row.status as DeadCoinStatus,
    telegramStatus: row.telegram_status ?? "",
    websiteStatus: row.website_status ?? "",
    lastDevActivity: row.last_dev_activity ?? "",
    memeScore: row.meme_score ?? 0,
    communityScore: row.community_score ?? 0,
    safetyScore: row.safety_score ?? 0,
    liquidityScore: row.liquidity_score ?? 0,
    loreScore: row.lore_score ?? 0,
    tickerScore: row.ticker_score ?? 0,
    contributorInterest: row.contributor_interest ?? 0,
    revivalScore: row.revival_score ?? 0,
    reasonDied: row.reason_died ?? "",
    reasonRevive: row.reason_revive ?? "",
    riskNotes: row.risk_notes ?? "",
    categories: row.categories ?? [],
    submittedBy: submitter ?? "—",
    submittedAt: row.submitted_at,
    votes: {
      revive: row.votes_revive ?? 0,
      skip: row.votes_skip ?? 0,
      research: row.votes_research ?? 0,
    },
  };
}

function mapCampaign(row: any): RevivalCampaign {
  const coin = row.dead_coins ?? {};
  const guilds: string[] = (row.revival_campaign_guilds ?? [])
    .map((g: any) => g.guilds?.slug)
    .filter(Boolean);
  const before = row.before_metrics ?? {};
  const after = row.after_metrics ?? {};
  return {
    id: row.id,
    slug: row.slug,
    coinName: coin.name ?? row.slug,
    ticker: coin.ticker ?? "",
    contractAddress: coin.contract_address ?? "",
    phase: row.phase as RevivalPhase,
    revivalScore: coin.revival_score ?? 0,
    status: row.status,
    startDate: row.start_date,
    graduationDate: row.graduation_date ?? undefined,
    totalBountySpend: Number(row.total_bounty_spend ?? 0),
    activeBounties: row.active_bounties ?? 0,
    completedBounties: row.completed_bounties ?? 0,
    contributorsCount: row.contributors_count ?? 0,
    newWebsite: row.new_website ?? undefined,
    newTelegram: row.new_telegram ?? undefined,
    newX: row.new_x ?? undefined,
    manifesto: row.manifesto ?? "",
    roadmap: splitLines(row.roadmap),
    guilds,
    before: { holders: before.holders ?? 0, telegram: before.telegram ?? 0, website: before.website ?? "—" },
    after: { holders: after.holders ?? 0, telegram: after.telegram ?? 0, website: after.website ?? "—" },
  };
}

function mapBounty(row: any): Bounty {
  return {
    id: row.id,
    campaignId: row.revival_campaign_id ?? null,
    coinTicker: row.revival_campaigns?.dead_coins?.ticker ?? "—",
    title: row.title,
    description: row.description,
    category: row.category as BountyCategory,
    rewardAmount: Number(row.reward_amount ?? 0),
    rewardToken: row.reward_token,
    maxWinners: row.max_winners ?? 1,
    deadline: row.deadline ?? "",
    status: row.status as BountyStatus,
    proofRequirements: row.proof_requirements ?? "",
    judgingCriteria: splitLines(row.judging_criteria),
    submissionsCount: row.submissions?.[0]?.count ?? 0,
  };
}

function mapContributor(row: any): Contributor {
  const guilds: string[] = (row.guild_members ?? []).map((m: any) => m.guilds?.slug).filter(Boolean);
  const badges: string[] = (row.user_badges ?? []).map((b: any) => b.badges?.slug).filter(Boolean);
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name ?? row.username,
    avatarColor: avatarColor(row.username ?? row.id),
    bio: row.bio ?? "",
    guilds,
    completedBounties: row.total_bounties_completed ?? 0,
    totalEarned: Number(row.total_rewards_earned ?? 0),
    revivalsHelped: row.revivals_helped ?? 0,
    reputation: row.reputation_score ?? 0,
    badges,
    specialties: row.specialties ?? [],
  };
}

function mapBuyback(row: any): Buyback {
  return {
    id: row.id,
    feeAmount: Number(row.fee_amount ?? 0),
    tokenAmount: Number(row.token_amount_bought ?? 0),
    tx: row.buyback_tx ?? "—",
    date: row.occurred_at,
    status: row.status,
    source: row.source ?? "—",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ----------------------------------------------------------------------------
// Dead coins
// ----------------------------------------------------------------------------
export async function getDeadCoins(): Promise<DeadCoin[]> {
  if (!isConfigured()) return mockDeadCoins;
  try {
    const sb = createSupabaseReadClient();
    const [{ data: coins, error }, { data: users }] = await Promise.all([
      sb.from("dead_coins").select("*").order("revival_score", { ascending: false }),
      sb.from("users").select("id, username"),
    ]);
    if (error || !coins) return mockDeadCoins;
    const nameById = new Map((users ?? []).map((u) => [u.id, u.username as string]));
    return coins.map((c) => mapDeadCoin(c, nameById.get(c.submitted_by) ?? "—"));
  } catch {
    return mockDeadCoins;
  }
}

export async function getDeadCoinById(id: string): Promise<DeadCoin | undefined> {
  if (!isConfigured()) return mockDeadCoins.find((c) => c.id === id);
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb.from("dead_coins").select("*").eq("id", id).maybeSingle();
    if (error || !data) return undefined;
    let submitter = "—";
    if (data.submitted_by) {
      const { data: u } = await sb.from("users").select("username").eq("id", data.submitted_by).maybeSingle();
      submitter = u?.username ?? "—";
    }
    return mapDeadCoin(data, submitter);
  } catch {
    return mockDeadCoins.find((c) => c.id === id);
  }
}

// ----------------------------------------------------------------------------
// Pump.fun-origin dead-token discovery
// ----------------------------------------------------------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapDiscoveredDeadToken(row: any): DiscoveredDeadToken {
  return {
    id: row.mint,
    source: "pump.fun",
    mint: row.mint,
    name: row.name,
    symbol: row.symbol,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    pumpUrl: row.pump_url ?? "",
    chartUrl: row.chart_url ?? "",
    websiteUrl: row.website_url ?? "",
    twitterUrl: row.twitter_url ?? "",
    telegramUrl: row.telegram_url ?? "",
    createdAt: row.source_created_at ?? "",
    lastTradeAt: row.last_trade_at ?? "",
    dormantDays: row.dormant_days ?? 0,
    replyCount: row.reply_count ?? 0,
    migrated: Boolean(row.migrated),
    raydiumPool: row.raydium_pool ?? "",
    marketCapUsd: Number(row.market_cap_usd ?? 0),
    liquidityUsd: row.liquidity_usd == null ? null : Number(row.liquidity_usd),
    volume24hUsd: row.volume_24h_usd == null ? null : Number(row.volume_24h_usd),
    historicalVolumeUsd: row.historical_volume_usd == null ? null : Number(row.historical_volume_usd),
    athMarketCapUsd: row.ath_market_cap_usd == null ? null : Number(row.ath_market_cap_usd),
    athMarketCapAt: row.ath_market_cap_at ?? "",
    qualificationScore: row.qualification_score ?? 0,
    revivalScore: row.revival_score ?? 0,
    qualificationReasons: row.qualification_reasons ?? [],
    status: row.status ?? "candidate",
    sweptAt: row.swept_at ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getDiscoveredDeadTokens(): Promise<DiscoveredDeadToken[]> {
  if (isConfigured()) {
    try {
      const sb = createSupabaseReadClient();
      const { data, error } = await sb
        .from("discovered_dead_tokens")
        .select("*")
        .in("status", ["candidate", "watchlist"])
        .order("qualification_score", { ascending: false })
        .limit(60);
      if (!error && data && data.length > 0) return data.map(mapDiscoveredDeadToken);
    } catch {
      // Fall through to live discovery. The page should still render if the DB
      // table has not been migrated yet.
    }
  }

  try {
    return await findDeadTokenCandidates(24);
  } catch {
    return [];
  }
}

// ----------------------------------------------------------------------------
// Campaigns
// ----------------------------------------------------------------------------
const CAMPAIGN_SELECT =
  "*, dead_coins(name, ticker, contract_address, revival_score), revival_campaign_guilds(guilds(slug))";

export async function getCampaigns(): Promise<RevivalCampaign[]> {
  if (!isConfigured()) return mockCampaigns;
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb
      .from("revival_campaigns")
      .select(CAMPAIGN_SELECT)
      .eq("status", "active")
      .order("start_date", { ascending: false });
    if (error || !data) return mockCampaigns;
    return data.map(mapCampaign);
  } catch {
    return mockCampaigns;
  }
}

export async function getGraduatedCampaigns(): Promise<RevivalCampaign[]> {
  if (!isConfigured()) return mockGraduated;
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb
      .from("revival_campaigns")
      .select(CAMPAIGN_SELECT)
      .eq("status", "graduated")
      .order("graduation_date", { ascending: false });
    if (error || !data) return mockGraduated;
    return data.map(mapCampaign);
  } catch {
    return mockGraduated;
  }
}

export async function getCampaignBySlug(slug: string): Promise<RevivalCampaign | undefined> {
  if (!isConfigured()) return [...mockCampaigns, ...mockGraduated].find((c) => c.slug === slug);
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb.from("revival_campaigns").select(CAMPAIGN_SELECT).eq("slug", slug).maybeSingle();
    if (error || !data) return undefined;
    return mapCampaign(data);
  } catch {
    return [...mockCampaigns, ...mockGraduated].find((c) => c.slug === slug);
  }
}

// ----------------------------------------------------------------------------
// Bounties
// ----------------------------------------------------------------------------
const BOUNTY_SELECT =
  "*, revival_campaigns(dead_coins(ticker)), submissions(count)";

export async function getBounties(): Promise<Bounty[]> {
  if (!isConfigured()) return mockBounties;
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb.from("bounties").select(BOUNTY_SELECT).order("created_at", { ascending: false });
    if (error || !data) return mockBounties;
    return data.map(mapBounty);
  } catch {
    return mockBounties;
  }
}

export async function getBountyById(id: string): Promise<Bounty | undefined> {
  if (!isConfigured()) return mockBounties.find((b) => b.id === id);
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb.from("bounties").select(BOUNTY_SELECT).eq("id", id).maybeSingle();
    if (error || !data) return undefined;
    return mapBounty(data);
  } catch {
    return mockBounties.find((b) => b.id === id);
  }
}

export async function getCampaignBounties(campaignId: string): Promise<Bounty[]> {
  const all = await getBounties();
  return all.filter((b) => b.campaignId === campaignId);
}

// ----------------------------------------------------------------------------
// Contributors
// ----------------------------------------------------------------------------
const CONTRIB_SELECT = "*, guild_members(guilds(slug)), user_badges(badges(slug))";

export async function getContributors(): Promise<Contributor[]> {
  if (!isConfigured()) return mockContributors;
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb
      .from("users")
      .select(CONTRIB_SELECT)
      .order("reputation_score", { ascending: false });
    if (error || !data) return mockContributors;
    return data.map(mapContributor);
  } catch {
    return mockContributors;
  }
}

export async function getContributorByUsername(username: string): Promise<Contributor | undefined> {
  if (!isConfigured()) return mockContributors.find((c) => c.username === username);
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb.from("users").select(CONTRIB_SELECT).eq("username", username).maybeSingle();
    if (error || !data) return undefined;
    return mapContributor(data);
  } catch {
    return mockContributors.find((c) => c.username === username);
  }
}

// ----------------------------------------------------------------------------
// Buybacks
// ----------------------------------------------------------------------------
export async function getBuybacks(): Promise<Buyback[]> {
  if (!isConfigured()) return mockBuybacks;
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb.from("buybacks").select("*").order("occurred_at", { ascending: false });
    if (error || !data) return mockBuybacks;
    return data.map(mapBuyback);
  } catch {
    return mockBuybacks;
  }
}

// ----------------------------------------------------------------------------
// Guilds (DB identity + illustrative analytics overlay)
// ----------------------------------------------------------------------------
export interface GuildWithStats {
  slug: string;
  name: string;
  category: BountyCategory;
  description: string;
  members: number;
  completedBounties: number;
  totalEarned: number;
  reputation: number;
  winRate: number;
}

export async function getGuilds(): Promise<GuildWithStats[]> {
  const { CORE_GUILDS } = await import("@/lib/domain");
  const fallback = (): GuildWithStats[] =>
    CORE_GUILDS.map((g) => ({ ...g, ...(mockGuildStats[g.slug] ?? { members: 0, completedBounties: 0, totalEarned: 0, reputation: 0, winRate: 0 }) }));
  if (!isConfigured()) return fallback();
  try {
    const sb = createSupabaseReadClient();
    const { data, error } = await sb.from("guilds").select("slug, name, category, description, guild_members(count)");
    if (error || !data) return fallback();
    return data.map((g) => {
      const stats = mockGuildStats[g.slug] ?? { members: 0, completedBounties: 0, totalEarned: 0, reputation: 0, winRate: 0 };
      // Use real member count when present, illustrative analytics otherwise.
      const guildMembers = g.guild_members as { count?: number }[] | null | undefined;
      const realMembers = guildMembers?.[0]?.count ?? 0;
      return {
        slug: g.slug,
        name: g.name,
        category: g.category as BountyCategory,
        description: g.description ?? "",
        members: realMembers || stats.members,
        completedBounties: stats.completedBounties,
        totalEarned: stats.totalEarned,
        reputation: stats.reputation,
        winRate: stats.winRate,
      };
    });
  } catch {
    return fallback();
  }
}

// ----------------------------------------------------------------------------
// Global metrics (real counts where cheap; illustrative for untracked)
// ----------------------------------------------------------------------------
export async function getGlobalMetrics() {
  if (!isConfigured()) return mockGlobalMetrics;
  try {
    const sb = createSupabaseReadClient();
    const [
      submittedResult,
      activeResult,
      graduatedResult,
      failedResult,
      bountiesCreatedResult,
      bountiesCompletedResult,
      contributorsResult,
      buybackRows,
    ] =
      await Promise.all([
        sb.from("dead_coins").select("*", { count: "exact", head: true }),
        sb.from("revival_campaigns").select("*", { count: "exact", head: true }).eq("status", "active"),
        sb.from("revival_campaigns").select("*", { count: "exact", head: true }).eq("status", "graduated"),
        sb.from("revival_campaigns").select("*", { count: "exact", head: true }).eq("status", "failed"),
        sb.from("bounties").select("*", { count: "exact", head: true }),
        sb.from("bounties").select("*", { count: "exact", head: true }).eq("status", "completed"),
        sb.from("users").select("*", { count: "exact", head: true }),
        getBuybacks(),
      ]);
    const submitted = submittedResult.count ?? 0;
    const active = activeResult.count ?? 0;
    const graduated = graduatedResult.count ?? 0;
    const failed = failedResult.count ?? 0;
    const bountiesCreated = bountiesCreatedResult.count ?? 0;
    const bountiesCompleted = bountiesCompletedResult.count ?? 0;
    const contributors = contributorsResult.count ?? 0;
    const fees = buybackRows.reduce((s, b) => s + b.feeAmount, 0);
    const bought = buybackRows.reduce((s, b) => s + b.tokenAmount, 0);
    const burned = buybackRows.filter((b) => b.status === "burned").reduce((s, b) => s + b.tokenAmount, 0);
    const recycled = buybackRows.filter((b) => b.status === "recycled").reduce((s, b) => s + b.tokenAmount, 0);
    return {
      ...mockGlobalMetrics, // illustrative for untracked metrics (memes, videos, …)
      deadCoinsSubmitted: submitted,
      activeRevivals: active,
      graduatedRevivals: graduated,
      failedRevivals: failed,
      coinsRevived: graduated,
      bountiesCreated,
      bountiesCompleted,
      contributors,
      totalFeesCollected: fees || mockGlobalMetrics.totalFeesCollected,
      totalTokenBought: bought || mockGlobalMetrics.totalTokenBought,
      totalTokenBurned: burned || mockGlobalMetrics.totalTokenBurned,
      totalTokenRecycled: recycled || mockGlobalMetrics.totalTokenRecycled,
    };
  } catch {
    return mockGlobalMetrics;
  }
}
