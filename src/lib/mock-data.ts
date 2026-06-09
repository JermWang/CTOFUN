// ============================================================================
// Mock data for the CTO.fun MVP. Lets every page render with realistic content
// before a live Supabase project is connected. Replace these getters with
// Supabase queries (see src/lib/supabase) once the DB is provisioned.
// ============================================================================

import type {
  BountyCategory,
  BountyStatus,
  DeadCoinStatus,
  RevivalPhase,
} from "@/lib/domain";

export interface DeadCoin {
  id: string;
  name: string;
  ticker: string;
  contractAddress: string;
  chain: string;
  chartUrl: string;
  marketCap: number;
  liquidity: number;
  holderCount: number;
  launchDate: string;
  status: DeadCoinStatus;
  telegramStatus: string;
  websiteStatus: string;
  lastDevActivity: string;
  memeScore: number;
  communityScore: number;
  safetyScore: number;
  liquidityScore: number;
  loreScore: number;
  tickerScore: number;
  contributorInterest: number;
  revivalScore: number;
  reasonDied: string;
  reasonRevive: string;
  riskNotes: string;
  categories: string[];
  submittedBy: string;
  submittedAt: string;
  votes: { revive: number; skip: number; research: number };
}

export interface Bounty {
  id: string;
  campaignId: string | null;
  coinTicker: string;
  title: string;
  description: string;
  category: BountyCategory;
  rewardAmount: number;
  rewardToken: string;
  maxWinners: number;
  deadline: string;
  status: BountyStatus;
  proofRequirements: string;
  judgingCriteria: string[];
  submissionsCount: number;
  guildSlug?: string;
}

export interface RevivalCampaign {
  id: string;
  slug: string;
  coinName: string;
  ticker: string;
  contractAddress: string;
  phase: RevivalPhase;
  revivalScore: number;
  status: "active" | "graduated" | "failed";
  startDate: string;
  graduationDate?: string;
  totalBountySpend: number;
  activeBounties: number;
  completedBounties: number;
  contributorsCount: number;
  newWebsite?: string;
  newTelegram?: string;
  newX?: string;
  manifesto: string;
  roadmap: string[];
  guilds: string[];
  before: { holders: number; telegram: number; website: string };
  after: { holders: number; telegram: number; website: string };
}

export interface Contributor {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  bio: string;
  guilds: string[];
  completedBounties: number;
  totalEarned: number;
  revivalsHelped: number;
  reputation: number;
  badges: string[];
  specialties: string[];
}

// ----------------------------------------------------------------------------
// Dead coins (The Graveyard)
// ----------------------------------------------------------------------------
export const deadCoins: DeadCoin[] = [
  {
    id: "dc-rugzilla",
    name: "Rugzilla",
    ticker: "RUGZ",
    contractAddress: "Rugz4kP2sQh9vN1mTxWbY7cZ8dFgH3jK6LpQrStUvWx",
    chain: "solana",
    chartUrl: "https://dexscreener.com",
    marketCap: 41200,
    liquidity: 9800,
    holderCount: 2143,
    launchDate: "2025-09-12",
    status: "up_for_vote",
    telegramStatus: "Abandoned · 2,100 members, last admin post 4mo ago",
    websiteStatus: "Domain expired",
    lastDevActivity: "2025-10-02",
    memeScore: 9,
    communityScore: 7,
    safetyScore: 8,
    liquidityScore: 5,
    loreScore: 9,
    tickerScore: 8,
    contributorInterest: 8,
    revivalScore: 79,
    reasonDied: "Dev stopped posting after a failed CEX listing rumor. Telegram lost moderators and filled with scam links.",
    reasonRevive: "Strong mascot, 2k+ holders still in the group, and the 'kaiju that eats rugs' lore is highly memeable.",
    riskNotes: "Mint + freeze authority already renounced. No malicious functions found. Liquidity thin but present.",
    categories: ["absurd", "og"],
    submittedBy: "gravedigger.sol",
    submittedAt: "2026-06-01T10:00:00Z",
    votes: { revive: 312, skip: 44, research: 61 },
  },
  {
    id: "dc-ghostpepe",
    name: "Ghost Pepe",
    ticker: "GPEPE",
    contractAddress: "GPepe7yT3nQ8wVc2bX9aLmK4dRfH6jS1pUoEqWrZxYv",
    chain: "solana",
    chartUrl: "https://dexscreener.com",
    marketCap: 18700,
    liquidity: 4200,
    holderCount: 880,
    launchDate: "2025-07-30",
    status: "candidate",
    telegramStatus: "Quiet · 880 members, organic chatter weekly",
    websiteStatus: "Up but unmaintained",
    lastDevActivity: "2025-08-19",
    memeScore: 8,
    communityScore: 6,
    safetyScore: 9,
    liquidityScore: 4,
    loreScore: 7,
    tickerScore: 7,
    contributorInterest: 6,
    revivalScore: 70,
    reasonDied: "Launched into a brutal market week, never recovered initial momentum, dev moved to a new project.",
    reasonRevive: "Clean contract, loyal small community, and the 'haunted frog' angle is unused in the current cycle.",
    riskNotes: "Contract verified safe. Top holder owns 6% — acceptable. Needs liquidity strategy before relaunch.",
    categories: ["frogs", "og"],
    submittedBy: "scout_marrow",
    submittedAt: "2026-05-28T14:30:00Z",
    votes: { revive: 140, skip: 70, research: 95 },
  },
  {
    id: "dc-deadcat",
    name: "Dead Cat Bounce",
    ticker: "DCB",
    contractAddress: "DcB9xM4tR2vH7nK1qW8sLpZ3aYfG6jU5oEdQrTbWxCv",
    chain: "solana",
    chartUrl: "https://dexscreener.com",
    marketCap: 6300,
    liquidity: 1500,
    holderCount: 410,
    launchDate: "2025-11-05",
    status: "under_review",
    telegramStatus: "Dead · group deleted",
    websiteStatus: "None",
    lastDevActivity: "2025-11-21",
    memeScore: 10,
    communityScore: 3,
    safetyScore: 6,
    liquidityScore: 2,
    loreScore: 8,
    tickerScore: 9,
    contributorInterest: 7,
    revivalScore: 62,
    reasonDied: "Pure pump-and-dump pattern, dev pulled most of the liquidity, community scattered.",
    reasonRevive: "The name is the joke crypto traders already know. A self-aware 'we ARE the dead cat bounce' relaunch could rip.",
    riskNotes: "HIGH: liquidity very low and prior LP removal. Needs new LP commitment. Verify no hidden mint.",
    categories: ["cats", "absurd", "og"],
    submittedBy: "chart_coroner",
    submittedAt: "2026-06-03T09:15:00Z",
    votes: { revive: 88, skip: 120, research: 150 },
  },
  {
    id: "dc-wojaklives",
    name: "Wojak Lives",
    ticker: "WLIVE",
    contractAddress: "WLive3kR8tQ2nV7mH1xW9sLpZ4aYfG6jU5oEdBrTcWx",
    chain: "solana",
    chartUrl: "https://dexscreener.com",
    marketCap: 92000,
    liquidity: 22000,
    holderCount: 5120,
    launchDate: "2025-06-18",
    status: "newly_submitted",
    telegramStatus: "Semi-active · 5k members, no admins",
    websiteStatus: "Up, outdated",
    lastDevActivity: "2025-09-01",
    memeScore: 7,
    communityScore: 9,
    safetyScore: 8,
    liquidityScore: 7,
    loreScore: 6,
    tickerScore: 6,
    contributorInterest: 9,
    revivalScore: 75,
    reasonDied: "Founder burnout. No content engine after the first month, community ran on fumes.",
    reasonRevive: "5k holders and a still-talking Telegram. Mostly needs leadership, a content schedule, and moderation.",
    riskNotes: "Contract safe, healthy distribution. Main risk is coordination, not the token itself.",
    categories: ["og", "classic"],
    submittedBy: "holder_hunter",
    submittedAt: "2026-06-06T18:45:00Z",
    votes: { revive: 22, skip: 4, research: 9 },
  },
  {
    id: "dc-lazaroo",
    name: "Lazaroo",
    ticker: "LAZ",
    contractAddress: "Laz5kP9sQh2vN8mTxWbY1cZ4dFgH7jK3LpQrStUvZab",
    chain: "solana",
    chartUrl: "https://dexscreener.com",
    marketCap: 12400,
    liquidity: 3100,
    holderCount: 640,
    launchDate: "2025-08-08",
    status: "candidate",
    telegramStatus: "Quiet · 640 members",
    websiteStatus: "Broken",
    lastDevActivity: "2025-09-14",
    memeScore: 8,
    communityScore: 5,
    safetyScore: 9,
    liquidityScore: 4,
    loreScore: 9,
    tickerScore: 8,
    contributorInterest: 7,
    revivalScore: 72,
    reasonDied: "Good concept, no design or content follow-through. The kangaroo-back-from-the-dead bit never got art.",
    reasonRevive: "On-theme for this very protocol. Strong lore hook, clean contract, just needs a full identity rebuild.",
    riskNotes: "Safe contract. Broken site is an opportunity, not a risk. Liquidity needs reinforcement.",
    categories: ["animals", "absurd"],
    submittedBy: "lore_priest",
    submittedAt: "2026-05-30T11:20:00Z",
    votes: { revive: 175, skip: 33, research: 40 },
  },
];

// ----------------------------------------------------------------------------
// Active revival campaign (the flagship)
// ----------------------------------------------------------------------------
export const campaigns: RevivalCampaign[] = [
  {
    id: "rc-rugzilla",
    slug: "rugzilla",
    coinName: "Rugzilla",
    ticker: "RUGZ",
    contractAddress: "Rugz4kP2sQh9vN1mTxWbY7cZ8dFgH3jK6LpQrStUvWx",
    phase: "rebuild",
    revivalScore: 79,
    status: "active",
    startDate: "2026-05-20T00:00:00Z",
    totalBountySpend: 2840,
    activeBounties: 5,
    completedBounties: 11,
    contributorsCount: 27,
    newTelegram: "https://t.me/rugzilla_cto",
    newX: "https://x.com/rugzilla_cto",
    manifesto:
      "RUGZ was left behind, but the kaiju is not dead. This is a community-led revival organized by independent contributors. We are not the original developers and we are not pretending to be. The goal is to rebuild the culture, content, community, and public presence around a coin that still has meme potential. Everything will be done transparently and funded through bounties.",
    roadmap: [
      "Rebuild visual identity (mascot, banner, sticker pack)",
      "Relaunch Telegram with a real moderation rota",
      "Ship the landing page + risk disclosure",
      "Release the resurrection lore thread + meme pack",
      "Daily content calendar for 30 days",
      "Graduate to the Hall of Revival",
    ],
    guilds: ["meme-medics", "lore-priests", "design-doctors", "mod-squad"],
    before: { holders: 2143, telegram: 2100, website: "Expired" },
    after: { holders: 2390, telegram: 2640, website: "Live" },
  },
  {
    id: "rc-ghostpepe",
    slug: "ghost-pepe",
    coinName: "Ghost Pepe",
    ticker: "GPEPE",
    contractAddress: "GPepe7yT3nQ8wVc2bX9aLmK4dRfH6jS1pUoEqWrZxYv",
    phase: "setup",
    revivalScore: 70,
    status: "active",
    startDate: "2026-06-04T00:00:00Z",
    totalBountySpend: 320,
    activeBounties: 3,
    completedBounties: 2,
    contributorsCount: 8,
    newTelegram: "https://t.me/ghostpepe_cto",
    manifesto:
      "GPEPE haunts the chart for a reason. A small loyal community kept the lights on. This community takeover rebuilds the haunted-frog identity from the ground up, transparently and bounty-by-bounty.",
    roadmap: [
      "Confirm contract + publish disclaimer",
      "Stand up new Telegram + rules",
      "Commission mascot + banner",
      "Write the haunting lore arc",
    ],
    guilds: ["design-doctors", "lore-priests"],
    before: { holders: 880, telegram: 880, website: "Stale" },
    after: { holders: 905, telegram: 940, website: "Planned" },
  },
];

export const graduatedCampaigns: RevivalCampaign[] = [
  {
    id: "rc-fomofrog",
    slug: "fomo-frog",
    coinName: "Fomo Frog",
    ticker: "FOMOF",
    contractAddress: "FoMoFrog2kR8tQ9nV1mH7xW3sLpZ6aYfG4jU5oEdBrTc",
    phase: "graduation",
    revivalScore: 84,
    status: "graduated",
    startDate: "2026-03-01T00:00:00Z",
    graduationDate: "2026-04-22T00:00:00Z",
    totalBountySpend: 6120,
    activeBounties: 0,
    completedBounties: 38,
    contributorsCount: 51,
    newWebsite: "https://fomofrog.example",
    newTelegram: "https://t.me/fomofrog",
    newX: "https://x.com/fomofrog",
    manifesto:
      "FOMOF proved a dead coin can come back when the community owns the story. 38 bounties, 51 contributors, a fully rebuilt presence.",
    roadmap: ["Graduated — now community-operated."],
    guilds: ["meme-medics", "lore-priests", "design-doctors", "mod-squad", "raid-captains"],
    before: { holders: 1200, telegram: 900, website: "Dead" },
    after: { holders: 4800, telegram: 3600, website: "Live + maintained" },
  },
];

// ----------------------------------------------------------------------------
// Bounties
// ----------------------------------------------------------------------------
export const bounties: Bounty[] = [
  {
    id: "b-rugz-memes",
    campaignId: "rc-rugzilla",
    coinTicker: "RUGZ",
    title: "Create 10 memes for the RUGZ revival",
    description:
      "We are reviving RUGZ through a community-led CTO. Create 10 original memes around resurrection, comebacks, and the rug-eating kaiju. Usable on X and Telegram.",
    category: "meme",
    rewardAmount: 100,
    rewardToken: "USDC",
    maxWinners: 5,
    deadline: "2026-06-18T00:00:00Z",
    status: "open",
    proofRequirements: "10 original PNG/JPG memes, no watermarked or stolen content.",
    judgingCriteria: ["Originality", "Humor", "Relevance to RUGZ", "Shareability", "Visual clarity"],
    submissionsCount: 14,
    guildSlug: "meme-medics",
  },
  {
    id: "b-rugz-manifesto",
    campaignId: "rc-rugzilla",
    coinTicker: "RUGZ",
    title: "Write the RUGZ CTO manifesto",
    description:
      "Write the resurrection myth and community manifesto for RUGZ. Must include the required community-takeover disclaimer.",
    category: "lore",
    rewardAmount: 80,
    rewardToken: "USDC",
    maxWinners: 1,
    deadline: "2026-06-14T00:00:00Z",
    status: "in_review",
    proofRequirements: "400-700 word manifesto + a 5-tweet lore thread.",
    judgingCriteria: ["Narrative strength", "Tone", "Clarity", "Disclaimer compliance"],
    submissionsCount: 6,
    guildSlug: "lore-priests",
  },
  {
    id: "b-rugz-mascot",
    campaignId: "rc-rugzilla",
    coinTicker: "RUGZ",
    title: "Redesign the Rugzilla mascot",
    description:
      "Deliver a modern mascot for the kaiju that eats rugs. Vector + transparent PNGs in multiple poses.",
    category: "design",
    rewardAmount: 250,
    rewardToken: "USDC",
    maxWinners: 1,
    deadline: "2026-06-20T00:00:00Z",
    status: "open",
    proofRequirements: "SVG + 3 pose PNGs, 1024px min, transparent background.",
    judgingCriteria: ["Originality", "Brand fit", "Versatility", "Polish"],
    submissionsCount: 3,
    guildSlug: "design-doctors",
  },
  {
    id: "b-rugz-tg",
    campaignId: "rc-rugzilla",
    coinTicker: "RUGZ",
    title: "Set up and moderate the RUGZ Telegram",
    description:
      "Stand up the new Telegram: rules, welcome flow, anti-scam settings, and a 7-day moderation rota.",
    category: "community_ops",
    rewardAmount: 120,
    rewardToken: "USDC",
    maxWinners: 2,
    deadline: "2026-06-16T00:00:00Z",
    status: "open",
    proofRequirements: "Invite link, pinned rules, screenshot of bot/anti-spam config.",
    judgingCriteria: ["Setup quality", "Anti-scam coverage", "Responsiveness"],
    submissionsCount: 4,
    guildSlug: "mod-squad",
  },
  {
    id: "b-scout-batch",
    campaignId: null,
    coinTicker: "—",
    title: "Find 10 dead coins with revival potential",
    description:
      "Scout the graveyard. Submit 10 abandoned Solana meme coins with funny tickers, surviving holders, and clean-looking contracts. Use the scout submission template.",
    category: "scout",
    rewardAmount: 150,
    rewardToken: "USDC",
    maxWinners: 3,
    deadline: "2026-06-22T00:00:00Z",
    status: "open",
    proofRequirements: "10 completed scout submissions with chart links and risk notes.",
    judgingCriteria: ["Revival potential", "Accuracy", "Risk diligence", "Originality of finds"],
    submissionsCount: 9,
    guildSlug: "grave-scouts",
  },
  {
    id: "b-gpepe-banner",
    campaignId: "rc-ghostpepe",
    coinTicker: "GPEPE",
    title: "Design the Ghost Pepe banner + PFP set",
    description:
      "Create the haunted-frog banner and a 4-piece PFP set for the GPEPE relaunch.",
    category: "design",
    rewardAmount: 180,
    rewardToken: "USDC",
    maxWinners: 1,
    deadline: "2026-06-19T00:00:00Z",
    status: "open",
    proofRequirements: "1500x500 banner + 4 PFPs, transparent PNG.",
    judgingCriteria: ["Originality", "Brand fit", "Polish"],
    submissionsCount: 2,
    guildSlug: "design-doctors",
  },
];

// ----------------------------------------------------------------------------
// Contributors
// ----------------------------------------------------------------------------
export const contributors: Contributor[] = [
  {
    id: "u-gravedigger",
    username: "gravedigger.sol",
    displayName: "Gravedigger",
    avatarColor: "#2dd47e",
    bio: "Professional necromancer. I find coins the market gave up on.",
    guilds: ["grave-scouts", "chart-coroners"],
    completedBounties: 34,
    totalEarned: 4120,
    revivalsHelped: 7,
    reputation: 920,
    badges: ["grave-digger", "top-scout", "revival-veteran", "ten-bounties"],
    specialties: ["Scouting", "Contract triage"],
  },
  {
    id: "u-mememd",
    username: "meme_md",
    displayName: "Meme MD",
    avatarColor: "#9b7bff",
    bio: "I make charts laugh. Meme Medics lead.",
    guilds: ["meme-medics"],
    completedBounties: 58,
    totalEarned: 5230,
    revivalsHelped: 9,
    reputation: 1080,
    badges: ["meme-medic", "resurrection-artist", "hundred-bounties", "community-favorite"],
    specialties: ["Memes", "Reaction packs"],
  },
  {
    id: "u-lorepriest",
    username: "lore_priest",
    displayName: "Lore Priest",
    avatarColor: "#f5b54a",
    bio: "Every dead coin deserves a resurrection myth.",
    guilds: ["lore-priests"],
    completedBounties: 22,
    totalEarned: 2640,
    revivalsHelped: 6,
    reputation: 740,
    badges: ["lore-doctor", "first-revival", "ten-bounties"],
    specialties: ["Manifestos", "Lore threads"],
  },
  {
    id: "u-surgeon",
    username: "site_surgeon",
    displayName: "Site Surgeon",
    avatarColor: "#2dd47e",
    bio: "Broken websites are my favorite patients.",
    guilds: ["website-surgeons", "dashboard-keepers"],
    completedBounties: 19,
    totalEarned: 3380,
    revivalsHelped: 5,
    reputation: 690,
    badges: ["website-surgeon", "first-revival"],
    specialties: ["Landing pages", "Dashboards"],
  },
];

// ----------------------------------------------------------------------------
// Guild stats (overlaid on CORE_GUILDS in the UI)
// ----------------------------------------------------------------------------
export const guildStats: Record<
  string,
  { members: number; completedBounties: number; totalEarned: number; reputation: number; winRate: number }
> = {
  "grave-scouts": { members: 41, completedBounties: 96, totalEarned: 8200, reputation: 1180, winRate: 62 },
  "meme-medics": { members: 88, completedBounties: 210, totalEarned: 16400, reputation: 1640, winRate: 71 },
  "lore-priests": { members: 33, completedBounties: 74, totalEarned: 6100, reputation: 880, winRate: 68 },
  "design-doctors": { members: 52, completedBounties: 130, totalEarned: 14800, reputation: 1320, winRate: 64 },
  "website-surgeons": { members: 18, completedBounties: 41, totalEarned: 9200, reputation: 760, winRate: 70 },
  "chart-coroners": { members: 27, completedBounties: 63, totalEarned: 5400, reputation: 820, winRate: 66 },
  "mod-squad": { members: 64, completedBounties: 155, totalEarned: 7300, reputation: 1090, winRate: 73 },
  "holder-hunters": { members: 22, completedBounties: 38, totalEarned: 3100, reputation: 540, winRate: 59 },
  "video-shamans": { members: 29, completedBounties: 52, totalEarned: 9900, reputation: 910, winRate: 61 },
  "dashboard-keepers": { members: 15, completedBounties: 34, totalEarned: 4200, reputation: 600, winRate: 69 },
  "raid-captains": { members: 47, completedBounties: 88, totalEarned: 4600, reputation: 770, winRate: 58 },
  "revival-council": { members: 9, completedBounties: 0, totalEarned: 0, reputation: 1500, winRate: 0 },
};

// ----------------------------------------------------------------------------
// Buybacks + global metrics
// ----------------------------------------------------------------------------
export interface Buyback {
  id: string;
  feeAmount: number;
  tokenAmount: number;
  tx: string;
  date: string;
  status: "executed" | "burned" | "recycled";
  source: string;
}

export const buybacks: Buyback[] = [
  { id: "bb-1", feeAmount: 142, tokenAmount: 121340, tx: "5xQ...8aF", date: "2026-06-07T00:00:00Z", status: "burned", source: "Bounty fees" },
  { id: "bb-2", feeAmount: 98, tokenAmount: 83110, tx: "3kR...2nV", date: "2026-06-06T00:00:00Z", status: "burned", source: "Bounty fees" },
  { id: "bb-3", feeAmount: 210, tokenAmount: 179800, tx: "9mH...1xW", date: "2026-06-05T00:00:00Z", status: "recycled", source: "Featured listing" },
  { id: "bb-4", feeAmount: 64, tokenAmount: 54900, tx: "7yT...3nQ", date: "2026-06-04T00:00:00Z", status: "burned", source: "Bounty fees" },
];

export const globalMetrics = {
  deadCoinsSubmitted: 312,
  coinsReviewed: 188,
  coinsRevived: 14,
  activeRevivals: 2,
  graduatedRevivals: 9,
  failedRevivals: 5,
  bountiesCreated: 540,
  bountiesCompleted: 421,
  rewardsPaid: 68400,
  contributors: 1240,
  guilds: 12,
  memesCreated: 3100,
  websitesRebuilt: 11,
  videosCreated: 240,
  communitiesRelaunched: 14,
  totalFeesCollected: 3420,
  totalTokenBought: 2_910_000,
  totalTokenBurned: 2_140_000,
  totalTokenRecycled: 770_000,
};

// ----------------------------------------------------------------------------
// Accessors (swap these for Supabase queries later)
// ----------------------------------------------------------------------------
export function getDeadCoin(id: string) {
  return deadCoins.find((c) => c.id === id);
}
export function getCampaign(slug: string) {
  return [...campaigns, ...graduatedCampaigns].find((c) => c.slug === slug);
}
export function getBounty(id: string) {
  return bounties.find((b) => b.id === id);
}
export function getContributor(username: string) {
  return contributors.find((c) => c.username === username);
}
export function getCampaignBounties(campaignId: string) {
  return bounties.filter((b) => b.campaignId === campaignId);
}
