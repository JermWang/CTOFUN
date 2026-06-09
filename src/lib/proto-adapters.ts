// ============================================================================
// Adapters that map the live data model (mock-data.ts / dead-token-sweeper.ts)
// onto the shapes the faithful "Liquid" prototype components expect. Keeps the
// design pixel-faithful while staying driven by real getters.
// ============================================================================

import type { Bounty, DeadCoin, RevivalCampaign } from "@/lib/mock-data";
import type { DiscoveredDeadToken } from "@/lib/dead-token-sweeper";
import { BOUNTY_CATEGORY_LABELS, REVIVAL_PHASES, type RevivalPhase } from "@/lib/domain";
import type { ProtoBounty, ProtoCandidate } from "@/components/protocol-blocks";
import type { SweepCandidate } from "@/components/protocol-ui";

export const PHASE_LABELS = REVIVAL_PHASES.map((p) => p.label);

export function riskLevel(score: number): "Low" | "Med" | "High" {
  return score >= 8 ? "Low" : score >= 5 ? "Med" : "High";
}

/** Static CTO workflow stages → bounty categories (design content). */
export const WORKFLOW: { k: string; d: string; open: number }[] = [
  { k: "Scout", d: "Find dormant tokens", open: 4 },
  { k: "Research", d: "What happened & why", open: 2 },
  { k: "Audit", d: "Contract & safety", open: 1 },
  { k: "Lore", d: "Manifesto & narrative", open: 3 },
  { k: "Design", d: "Identity & assets", open: 5 },
  { k: "Website", d: "Build or repair", open: 1 },
  { k: "Social", d: "Channels & campaigns", open: 6 },
  { k: "Moderation", d: "Telegram & Discord", open: 2 },
  { k: "Outreach", d: "Ethical holder contact", open: 1 },
  { k: "Proof", d: "Public revival record", open: 2 },
];

export function daysUntil(deadline: string): string {
  if (!deadline) return "open";
  const ms = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(ms / 86_400_000);
  if (days <= 0) return "ending";
  return `${days}d left`;
}

export function daysSince(date: string): number {
  if (!date) return 0;
  const ms = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** Deterministic 9-point sparkline seeded from a string + score. */
export function sparkFromSeed(seed: string, score: number): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  for (let i = 0; i < 9; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const wave = Math.sin(i * 0.9 + (score / 20)) * 18;
    out.push(Math.round(30 + (h % 50) + wave));
  }
  return out;
}

function sweepStatus(score: number): string {
  return score >= 80 ? "vote" : score >= 70 ? "candidate" : "review";
}

export function toProtoBounty(b: Bounty): ProtoBounty {
  return {
    id: b.id,
    sym: b.coinTicker || "—",
    title: b.title,
    cat: BOUNTY_CATEGORY_LABELS[b.category] ?? b.category,
    reward: b.rewardAmount,
    subs: b.submissionsCount,
    max: b.maxWinners,
    status: b.status === "open" ? "open" : "in review",
    deadline: daysUntil(b.deadline),
    desc: b.description,
  };
}

export function toProtoCandidate(t: DiscoveredDeadToken): ProtoCandidate {
  const qual = t.qualificationScore;
  return {
    id: t.mint,
    sym: t.symbol,
    name: t.name,
    qual,
    migrated: t.migrated,
    risk: qual >= 76 ? "Low" : qual >= 60 ? "Med" : "High",
    blurb: t.description || "Dormant Pump.fun-origin launch with surviving holders.",
    dormant: t.dormantDays,
    replies: t.replyCount,
    ath: t.athMarketCapUsd,
    mcap: t.marketCapUsd,
    imageUrl: t.imageUrl,
    chartUrl: t.chartUrl,
    websiteUrl: t.websiteUrl,
    twitterUrl: t.twitterUrl,
    telegramUrl: t.telegramUrl,
    createdAt: t.createdAt,
    liquidityUsd: t.liquidityUsd,
    volume24hUsd: t.volume24hUsd,
    historicalVolumeUsd: t.historicalVolumeUsd,
    categories: t.categories,
    categoryConfidence: t.categoryConfidence,
    discoverySignals: t.discoverySignals,
    reasons: (t.qualificationReasons ?? []).slice(0, 3),
    pumpUrl: t.pumpUrl,
  };
}

export function toSweepCandidate(t: DiscoveredDeadToken): SweepCandidate {
  return {
    sym: t.symbol,
    name: t.name,
    dormant: t.dormantDays,
    ath: t.athMarketCapUsd ?? t.marketCapUsd,
    replies: t.replyCount,
    qual: t.qualificationScore,
    status: sweepStatus(t.qualificationScore),
    spark: sparkFromSeed(t.mint || t.symbol, t.qualificationScore),
  };
}

/** Map the DB dead-coin status enum onto the prototype's status hierarchy. */
export function graveStatus(status: DeadCoin["status"]): string {
  const map: Record<string, string> = {
    newly_submitted: "newly",
    under_review: "review",
    candidate: "candidate",
    up_for_vote: "vote",
    selected_for_revival: "selected",
    active_revival: "active",
    graduated: "graduated",
    failed_revival: "review",
    blacklisted: "review",
  };
  return map[status] ?? "review";
}

export interface ProtoGrave {
  id: string;
  sym: string;
  name: string;
  status: string;
  score: number;
  risk: "Low" | "Med" | "High";
  holders: number;
  dormant: number;
  ath: number;
}

export function toProtoGrave(c: DeadCoin): ProtoGrave {
  return {
    id: c.id,
    sym: c.ticker,
    name: c.name,
    status: graveStatus(c.status),
    score: c.revivalScore,
    risk: riskLevel(c.safetyScore),
    holders: c.holderCount,
    dormant: daysSince(c.lastDevActivity || c.launchDate),
    ath: c.marketCap,
  };
}

export interface ProtoRevival {
  id: string;
  sym: string;
  name: string;
  score: number;
  phase: string;
  contract: string;
  manifesto: string;
  risk: { level: "Low" | "Med" | "High"; note: string };
  breakdown: { k: string; v: number }[];
  votes: { revive: number; research: number; skip: number };
  spend: number;
  active: number;
  done: number;
  contributors: number;
  roadmap: string[];
}

const DEFAULT_ROADMAP = [
  "Rebuild visual identity",
  "Relaunch Telegram w/ moderation rota",
  "Ship landing page + risk disclosure",
  "Release lore thread + meme pack",
  "30-day content calendar",
  "Graduate to Hall of Revival",
];

export function toProtoRevival(c: DeadCoin, campaign?: RevivalCampaign): ProtoRevival {
  const phaseKey: RevivalPhase = campaign?.phase ?? "review";
  const phaseMeta = REVIVAL_PHASES.find((p) => p.key === phaseKey);
  return {
    id: c.id,
    sym: c.ticker,
    name: c.name,
    score: c.revivalScore,
    phase: phaseMeta?.label ?? "Review",
    contract: shortContract(c.contractAddress),
    manifesto: campaign?.manifesto || c.reasonRevive,
    risk: { level: riskLevel(c.safetyScore), note: c.riskNotes },
    breakdown: [
      { k: "Meme", v: c.memeScore },
      { k: "Community", v: c.communityScore },
      { k: "Safety", v: c.safetyScore },
      { k: "Liquidity", v: c.liquidityScore },
      { k: "Lore", v: c.loreScore },
      { k: "Ticker", v: c.tickerScore },
    ],
    votes: { revive: c.votes.revive, research: c.votes.research, skip: c.votes.skip },
    spend: campaign?.totalBountySpend ?? 0,
    active: campaign?.activeBounties ?? 0,
    done: campaign?.completedBounties ?? 0,
    contributors: campaign?.contributorsCount ?? 0,
    roadmap: campaign?.roadmap?.length ? campaign.roadmap : DEFAULT_ROADMAP,
  };
}

function shortContract(addr: string): string {
  if (!addr) return "—";
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}
