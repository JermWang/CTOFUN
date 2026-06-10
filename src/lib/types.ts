// ============================================================================
// Domain DTO types shared across the app. These describe the shapes the UI
// renders; all data is sourced live from Supabase / the dead-token sweeper via
// src/lib/data.ts. (No mock data — see git history if you need the old seeds.)
// ============================================================================

import type {
  BountyCategory,
  BountyStatus,
  DeadCoinStatus,
  RevivalApplicationStatus,
  RevivalPhase,
} from "@/lib/domain";

export interface RevivalApplication {
  id: string;
  mint: string;
  tokenName: string;
  tokenSymbol: string;
  tokenImageUrl: string;
  teamName: string;
  pitch: string;
  plan: string;
  teamSize: number;
  teamMembers: string;
  priorWork: string;
  payoutWallet: string;
  contact: string;
  bountyAmountSol: number | null;
  bountyPumpfunUrl: string;
  deliveryProof: string;
  deliveryLinks: string[];
  deliveredAt: string;
  payoutTx: string;
  paidAmountSol: number | null;
  paidAt: string;
  reviewNotes: string;
  status: RevivalApplicationStatus;
  createdAt: string;
}

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

export interface Buyback {
  id: string;
  feeAmount: number;
  tokenAmount: number;
  tx: string;
  date: string;
  status: "executed" | "burned" | "recycled";
  source: string;
}
