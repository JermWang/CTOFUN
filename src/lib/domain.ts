// ============================================================================
// CTO.fun domain model — enum types, labels, and scoring helpers.
// Mirrors supabase/migrations/0001_init.sql.
// ============================================================================

export type DeadCoinStatus =
  | "newly_submitted"
  | "under_review"
  | "candidate"
  | "up_for_vote"
  | "selected_for_revival"
  | "active_revival"
  | "graduated"
  | "failed_revival"
  | "blacklisted";

export const DEAD_COIN_STATUS_LABELS: Record<DeadCoinStatus, string> = {
  newly_submitted: "Newly Submitted",
  under_review: "Under Review",
  candidate: "Candidate",
  up_for_vote: "Up For Vote",
  selected_for_revival: "Selected For Revival",
  active_revival: "Active Revival",
  graduated: "Graduated",
  failed_revival: "Failed Revival",
  blacklisted: "Blacklisted",
};

export type RevivalPhase =
  | "discovery"
  | "review"
  | "vote"
  | "setup"
  | "rebuild"
  | "relaunch"
  | "growth"
  | "graduation"
  | "archive";

export const REVIVAL_PHASES: { key: RevivalPhase; index: number; label: string }[] = [
  { key: "discovery", index: 0, label: "Discovery" },
  { key: "review", index: 1, label: "Review" },
  { key: "vote", index: 2, label: "Vote" },
  { key: "setup", index: 3, label: "Setup" },
  { key: "rebuild", index: 4, label: "Rebuild" },
  { key: "relaunch", index: 5, label: "Relaunch" },
  { key: "growth", index: 6, label: "Growth" },
  { key: "graduation", index: 7, label: "Graduation" },
  { key: "archive", index: 8, label: "Archive / Failure" },
];

export type BountyCategory =
  | "scout"
  | "meme"
  | "lore"
  | "design"
  | "website"
  | "social"
  | "video"
  | "moderation"
  | "community_ops"
  | "dashboard"
  | "research"
  | "holder_outreach"
  | "revival_audit";

export const BOUNTY_CATEGORY_LABELS: Record<BountyCategory, string> = {
  scout: "Scout",
  meme: "Meme",
  lore: "Lore",
  design: "Design",
  website: "Website",
  social: "Social",
  video: "Video",
  moderation: "Moderation",
  community_ops: "Community Ops",
  dashboard: "Dashboard",
  research: "Research",
  holder_outreach: "Holder Outreach",
  revival_audit: "Revival Audit",
};

/** Categories live at MVP launch; the rest come later. */
export const MVP_BOUNTY_CATEGORIES: BountyCategory[] = [
  "scout",
  "meme",
  "lore",
  "design",
  "community_ops",
];

export type BountyStatus = "open" | "in_review" | "completed" | "cancelled" | "expired";

export const BOUNTY_STATUS_LABELS: Record<BountyStatus, string> = {
  open: "Open",
  in_review: "In Review",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
};

export type SubmissionStatus = "pending" | "approved" | "rejected" | "paid" | "disputed";

export type VoteChoice =
  | "revive"
  | "skip"
  | "needs_research"
  | "blacklist"
  | "watchlist"
  | "yes"
  | "no";

// ----------------------------------------------------------------------------
// Meme categories — the origin/theme of a dead coin. A coin can have several.
// Used to organize and filter the Graveyard. Extend freely.
// ----------------------------------------------------------------------------
export interface MemeCategoryMeta {
  slug: string;
  label: string;
  emoji: string;
}

export const MEME_CATEGORIES: MemeCategoryMeta[] = [
  { slug: "og", label: "4chan / OG", emoji: "🗿" },
  { slug: "classic", label: "Classic", emoji: "📜" },
  { slug: "animals", label: "Animals", emoji: "🐾" },
  { slug: "dogs", label: "Dogs", emoji: "🐕" },
  { slug: "cats", label: "Cats", emoji: "🐈" },
  { slug: "frogs", label: "Frogs", emoji: "🐸" },
  { slug: "tiktok", label: "TikTok", emoji: "🎵" },
  { slug: "y2024", label: "2024 Meta", emoji: "📅" },
  { slug: "ai", label: "AI", emoji: "🤖" },
  { slug: "politics", label: "Politics", emoji: "🗳️" },
  { slug: "anime", label: "Anime", emoji: "🌸" },
  { slug: "gaming", label: "Gaming", emoji: "🎮" },
  { slug: "celebs", label: "Celebrities", emoji: "⭐" },
  { slug: "absurd", label: "Absurdist", emoji: "🤡" },
];

export const MEME_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  MEME_CATEGORIES.map((c) => [c.slug, c.label]),
);

export function memeCategoryLabel(slug: string): string {
  return MEME_CATEGORY_LABELS[slug] ?? slug;
}

export function memeCategoryEmoji(slug: string): string {
  return MEME_CATEGORIES.find((c) => c.slug === slug)?.emoji ?? "";
}

// ----------------------------------------------------------------------------
// Guilds
// ----------------------------------------------------------------------------
export interface GuildMeta {
  slug: string;
  name: string;
  category: BountyCategory;
  description: string;
}

export const CORE_GUILDS: GuildMeta[] = [
  { slug: "grave-scouts", name: "Grave Scouts", category: "scout", description: "Find dead coins with potential." },
  { slug: "meme-medics", name: "Meme Medics", category: "meme", description: "Create memes and reaction content." },
  { slug: "lore-priests", name: "Lore Priests", category: "lore", description: "Write narratives, manifestos, and lore." },
  { slug: "design-doctors", name: "Design Doctors", category: "design", description: "Visuals, mascots, banners, stickers." },
  { slug: "website-surgeons", name: "Website Surgeons", category: "website", description: "Build or repair websites." },
  { slug: "chart-coroners", name: "Chart Coroners", category: "research", description: "Analyze what happened to dead coins." },
  { slug: "mod-squad", name: "Mod Squad", category: "moderation", description: "Moderate Telegram and Discord." },
  { slug: "holder-hunters", name: "Holder Hunters", category: "holder_outreach", description: "Ethical outreach to old communities." },
  { slug: "video-shamans", name: "Video Shamans", category: "video", description: "Create short-form video content." },
  { slug: "dashboard-keepers", name: "Dashboard Keepers", category: "dashboard", description: "Track data, metrics, and progress." },
  { slug: "raid-captains", name: "Raid Captains", category: "social", description: "Coordinate safe public posting campaigns." },
  { slug: "revival-council", name: "Revival Council", category: "revival_audit", description: "Reviews candidates, disputes, safety." },
];

// ----------------------------------------------------------------------------
// Revival scoring — weighted score out of 100.
// ----------------------------------------------------------------------------
export interface RevivalScoreInput {
  meme: number; // 0-10
  community: number; // 0-10
  safety: number; // 0-10
  liquidity: number; // 0-10
  lore: number; // 0-10
  ticker: number; // 0-10
  contributorInterest: number; // 0-10
}

export const REVIVAL_SCORE_WEIGHTS = {
  meme: 0.25,
  community: 0.2,
  safety: 0.2,
  liquidity: 0.1,
  lore: 0.1,
  ticker: 0.1,
  contributorInterest: 0.05,
} as const;

/** Returns an overall revival score out of 100. */
export function computeRevivalScore(i: RevivalScoreInput): number {
  const w = REVIVAL_SCORE_WEIGHTS;
  const weighted =
    i.meme * w.meme +
    i.community * w.community +
    i.safety * w.safety +
    i.liquidity * w.liquidity +
    i.lore * w.lore +
    i.ticker * w.ticker +
    i.contributorInterest * w.contributorInterest;
  // weighted is out of 10 → scale to 100
  return Math.round(weighted * 10);
}

/** 5% standard platform fee on completed bounties (funds token buybacks). */
export const PLATFORM_FEE_RATE = 0.05;

export function bountyFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
}

export const CTO_DISCLAIMER =
  "This is a community takeover. We are not the original developer. " +
  "We are organizing a public, community-led revival. This is not financial " +
  "advice and not a promise of price recovery.";
