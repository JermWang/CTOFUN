import "server-only";
import { MEME_CATEGORY_LABELS } from "@/lib/domain";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { safeHttpUrl } from "@/lib/utils";

const PUMPFUN_COINS_ENDPOINT = "https://frontend-api-v3.pump.fun/coins";
const DEXSCREENER_TOKEN_ENDPOINT = "https://api.dexscreener.com/latest/dex/tokens";

export interface DiscoveredDeadToken {
  id: string;
  source: "pump.fun";
  mint: string;
  holderCount: number | null;
  lifetimeVolumeUsd: number | null;
  lifetimeVolumeSource: "indexed" | "estimated" | "";
  isGem: boolean;
  gemScore: number;
  gemReasons: string[];
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  pumpUrl: string;
  chartUrl: string;
  websiteUrl: string;
  twitterUrl: string;
  telegramUrl: string;
  createdAt: string;
  lastTradeAt: string;
  dormantDays: number;
  replyCount: number;
  migrated: boolean;
  raydiumPool: string;
  marketCapUsd: number;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  historicalVolumeUsd: number | null;
  athMarketCapUsd: number | null;
  athMarketCapAt: string;
  categories: string[];
  categoryScores: Record<string, number>;
  categoryConfidence: number;
  discoverySignals: string[];
  qualificationScore: number;
  revivalScore: number;
  qualificationReasons: string[];
  status: "candidate" | "watchlist" | "rejected" | "imported";
  sweptAt: string;
}

interface PumpCoin {
  mint?: string;
  name?: string;
  symbol?: string;
  description?: string;
  image_uri?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  created_timestamp?: number;
  last_trade_timestamp?: number;
  king_of_the_hill_timestamp?: number;
  raydium_pool?: string | null;
  pool_address?: string | null;
  complete?: boolean;
  reply_count?: number;
  usd_market_cap?: number;
  market_cap?: number;
  ath_market_cap?: number;
  ath_market_cap_timestamp?: number;
  nsfw?: boolean;
  is_banned?: boolean;
  hidden?: boolean;
}

interface DexPair {
  liquidity?: { usd?: number };
  volume?: { h24?: number };
}

interface CategoryRule {
  slug: string;
  terms: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  { slug: "dogs", terms: ["dog", "doge", "shib", "inu", "wif", "bonk", "floki", "cheems", "kabosu", "doggo"] },
  { slug: "cats", terms: ["cat", "kitty", "kitten", "mew", "michi", "popcat", "neko"] },
  { slug: "frogs", terms: ["frog", "pepe", "pepega", "fwog", "kermit"] },
  { slug: "ai", terms: ["ai", "agent", "gpt", "bot", "robot", "terminal", "agi", "neural", "autonomous"] },
  { slug: "politics", terms: ["trump", "biden", "maga", "potus", "america", "usa", "president", "election"] },
  { slug: "anime", terms: ["anime", "waifu", "neko", "manga", "senpai", "chan"] },
  { slug: "gaming", terms: ["game", "gaming", "arcade", "minecraft", "fortnite", "roblox", "pokemon", "xbox"] },
  { slug: "celebs", terms: ["elon", "ye", "kanye", "tate", "drake", "lebron", "swift", "celebrity", "fable"] },
  { slug: "tiktok", terms: ["tiktok", "viral", "trend", "hawk tuah", "skibidi", "aura", "brainrot"] },
  { slug: "y2024", terms: ["2024", "chillguy", "chill guy", "moodeng", "moo deng", "pnut", "goatseus", "fwog"] },
  { slug: "og", terms: ["wojak", "pepe", "doge", "chad", "kek", "anon", "4chan", "cope", "based"] },
  { slug: "classic", terms: ["moon", "safe", "inu", "rocket", "hodl", "diamond", "ape", "bull"] },
  { slug: "absurd", terms: ["fart", "silly", "weird", "nothing", "trash", "chaos", "goon", "brainrot"] },
  { slug: "animals", terms: ["dog", "cat", "frog", "bird", "fish", "monkey", "ape", "horse", "cow", "duck", "goat"] },
];

// ----------------------------------------------------------------------------
// GEM thesis: an abandoned Pump.fun coin worth a CTO had a real community
// (holders), real lifetime turnover (volume), and still has a residual-but-
// cheap market cap — i.e. survivors are holding the bag and waiting.
// All thresholds are env-tunable.
// ----------------------------------------------------------------------------
function gemMinHolders() {
  return Number(process.env.GEM_MIN_HOLDERS ?? 1_000);
}

function gemMinLifetimeVolumeUsd() {
  return Number(process.env.GEM_MIN_LIFETIME_VOLUME_USD ?? 5_000_000);
}

function gemMinMarketCapUsd() {
  return Number(process.env.GEM_MIN_MARKET_CAP_USD ?? 6_000);
}

function gemMaxMarketCapUsd() {
  return Number(process.env.GEM_MAX_MARKET_CAP_USD ?? 80_000);
}

function holderEnrichmentLimit() {
  return Number(process.env.HELIUS_HOLDER_ENRICHMENT_LIMIT ?? 50);
}

/** Helius RPC URL for DAS calls. Falls back to SOLANA_RPC_URL when it is a Helius endpoint. */
function heliusRpcUrl(): string {
  const explicit = (process.env.HELIUS_RPC_URL ?? "").trim();
  if (explicit) return explicit;
  const key = (process.env.HELIUS_API_KEY ?? "").trim();
  if (key) return `https://mainnet.helius-rpc.com/?api-key=${key}`;
  const rpc = (process.env.SOLANA_RPC_URL ?? "").trim();
  return rpc.includes("helius") ? rpc : "";
}

// Minimum residual on-chain liquidity (USD) for a *migrated* token to count as
// revivable rather than a pulled-LP rug. Only enforced when liquidity is known.
function minResidualLiquidityUsd() {
  return Number(process.env.GEM_MIN_RESIDUAL_LIQUIDITY_USD ?? 150);
}

/**
 * pump.fun's `ath_market_cap` is frequently corrupt (unit glitches produce
 * values in the hundreds of billions). Accept it only when it's plausible: no
 * real pump.fun coin sustained an ATH above ~$2B, and an ATH more than
 * 100,000x the current cap is almost certainly a data artifact. Returns a
 * trustworthy USD ATH or 0.
 */
function plausibleAthUsd(coin: PumpCoin): number {
  const ath = coin.ath_market_cap ?? 0;
  const mcap = coin.usd_market_cap ?? coin.market_cap ?? 0;
  if (!Number.isFinite(ath) || ath <= 0 || ath > 2_000_000_000) return 0;
  if (mcap > 0 && ath / mcap > 100_000) return 0;
  return ath;
}

// ----------------------------------------------------------------------------
// Scam / spam detection. Pump.fun is adversarial: phishing-named tokens, fake
// airdrops, and pulled-liquidity rugs all show up in the same feeds. Reject
// them before they can be scored or surfaced.
// ----------------------------------------------------------------------------
const SCAM_TEXT_PATTERNS: RegExp[] = [
  /\bair\s?drops?\b/i,
  /\bclaim\b/i,
  /\bfree\s?(mint|sol|tokens?|claim)\b/i,
  /\bpre\s?sale\b/i,
  /\bguaranteed\b/i,
  /\b(double|triple|10x|100x|1000x)\s+(your|guaranteed)\b/i,
  /\bsend\s+\d*\s?sol\b/i,
  /\b(verify|connect)\s+(your\s+)?wallet\b/i,
  /\bgiveaway\b/i,
  /\bvisit\b.*\b(claim|airdrop)\b/i,
  /https?:\/\//i,
  /\bt\.me\//i,
  /\bwww\./i,
];

interface ScamVerdict {
  scam: boolean;
  reason: string;
}

function detectScam(
  coin: PumpCoin,
  dex?: { liquidityUsd: number | null; volume24hUsd: number | null },
): ScamVerdict {
  if (coin.is_banned) return { scam: true, reason: "banned on pump.fun" };
  if (coin.nsfw) return { scam: true, reason: "nsfw" };
  if (coin.hidden) return { scam: true, reason: "hidden on pump.fun" };

  const name = coin.name ?? "";
  const symbol = coin.symbol ?? "";
  const description = coin.description ?? "";
  // URLs/handles in the NAME or SYMBOL are a strong phishing signal (legit
  // links live in the dedicated website/telegram fields, not the name).
  for (const pattern of SCAM_TEXT_PATTERNS) {
    if (pattern.test(name) || pattern.test(symbol)) {
      return { scam: true, reason: "phishing-style name" };
    }
  }
  // Description phishing terms are only damning alongside the call-to-action
  // ones; a "free" mention alone in a description is too noisy.
  if (/\b(air\s?drops?|claim now|connect\s+wallet|verify\s+wallet|free\s?mint)\b/i.test(description)) {
    return { scam: true, reason: "phishing-style description" };
  }
  // The mint address echoed in the name = automated spam mint.
  if (coin.mint && name.includes(coin.mint.slice(0, 8))) {
    return { scam: true, reason: "bot-spam mint" };
  }
  // Migrated to Raydium but liquidity drained to dust => pulled-LP rug, and
  // untradeable regardless. Only judge when liquidity is actually known.
  const migrated = Boolean(coin.complete || coin.raydium_pool || coin.pool_address);
  if (migrated && dex && dex.liquidityUsd != null && dex.liquidityUsd < minResidualLiquidityUsd()) {
    return { scam: true, reason: "liquidity pulled (rug)" };
  }
  return { scam: false, reason: "" };
}

function minDormantDays() {
  return Number(process.env.DEAD_TOKEN_MIN_DORMANT_DAYS ?? 45);
}

function minAgeDays() {
  return Number(process.env.DEAD_TOKEN_MIN_AGE_DAYS ?? 120);
}

function minQualificationScore() {
  return Number(process.env.DEAD_TOKEN_MIN_QUALIFICATION_SCORE ?? 60);
}

function minGemSignalScore() {
  return Number(process.env.DEAD_TOKEN_MIN_GEM_SIGNAL_SCORE ?? 48);
}

function maxCurrentVolumeUsd() {
  return Number(process.env.DEAD_TOKEN_MAX_CURRENT_VOLUME_USD ?? 5_000);
}

function toIso(timestamp?: number): string {
  if (!timestamp) return "";
  const ms = timestamp > 10_000_000_000 ? timestamp : timestamp * 1000;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function daysSince(iso: string): number {
  if (!iso) return 0;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return 0;
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
}

function pumpUrl(mint: string) {
  return `https://pump.fun/coin/${mint}`;
}

function chartUrl(mint: string) {
  return `https://dexscreener.com/solana/${mint}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fieldHasTerm(text: string, term: string) {
  const normalized = text.toLowerCase();
  const needle = term.toLowerCase();
  if (needle.includes(" ")) return normalized.includes(needle);
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}([^a-z0-9]|$)`, "i").test(normalized);
}

function classifyCategories(coin: PumpCoin) {
  const fields = [
    { text: coin.symbol ?? "", weight: 5 },
    { text: coin.name ?? "", weight: 4 },
    { text: coin.description ?? "", weight: 2 },
    { text: [coin.twitter, coin.telegram, coin.website].filter(Boolean).join(" "), weight: 1 },
  ];
  const categoryScores: Record<string, number> = {};

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const field of fields) {
      if (!field.text) continue;
      const matched = rule.terms.some((term) => fieldHasTerm(field.text, term));
      if (matched) score += field.weight;
    }
    if (score > 0) categoryScores[rule.slug] = score;
  }

  const ranked = Object.entries(categoryScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
  const categories = ranked.map(([slug]) => slug);
  const categoryConfidence = Math.min(100, ranked.reduce((sum, [, score]) => sum + score, 0) * 8);
  return { categories, categoryScores, categoryConfidence };
}

function scoreDiscoverySignals(
  coin: PumpCoin,
  dormantDays: number,
  ageDays: number,
  categories: string[],
  categoryConfidence: number,
  dex?: { liquidityUsd: number | null; volume24hUsd: number | null },
) {
  const signals: string[] = [];
  let score = 0;
  const replies = coin.reply_count ?? 0;
  const ath = plausibleAthUsd(coin);
  const marketCap = coin.usd_market_cap ?? coin.market_cap ?? 0;
  const hasSocials = Boolean(coin.twitter || coin.telegram || coin.website);
  const currentVolume = dex?.volume24hUsd ?? 0;

  if (categories.length > 0 && categoryConfidence >= 32) {
    score += 14;
    signals.push(`category fit: ${categories.map((c) => MEME_CATEGORY_LABELS[c] ?? c).join(", ")}`);
  }
  if (coin.image_uri) {
    score += 7;
    signals.push("has token artwork");
  }
  if ((coin.description ?? "").trim().length >= 32) {
    score += 7;
    signals.push("has descriptive metadata");
  }
  if (replies >= 250) {
    score += 18;
    signals.push(`${replies} Pump replies`);
  } else if (replies >= 75) {
    score += 10;
    signals.push(`${replies} Pump replies`);
  }
  if (ath >= 1_000_000) {
    score += 20;
    signals.push(`former ${formatCompactUsd(ath)} ATH`);
  } else if (ath >= 100_000) {
    score += 14;
    signals.push(`former ${formatCompactUsd(ath)} ATH`);
  } else if (ath >= 50_000) {
    score += 8;
    signals.push(`former ${formatCompactUsd(ath)} ATH`);
  }
  if (coin.complete || coin.raydium_pool || coin.pool_address || coin.king_of_the_hill_timestamp) {
    score += 10;
    signals.push("had Pump traction");
  }
  if (hasSocials) {
    score += 8;
    signals.push("old socials exist");
  }
  if (dormantDays >= 90) {
    score += 8;
    signals.push(`${dormantDays}d dormant`);
  }
  if (ageDays >= 180) {
    score += 5;
    signals.push(`${ageDays}d old`);
  }
  if (currentVolume <= 100) {
    score += 8;
    signals.push("near-zero current volume");
  } else if (currentVolume <= maxCurrentVolumeUsd()) {
    score += 4;
    signals.push("low current volume");
  }
  if (marketCap >= 500 && marketCap <= 500_000) {
    score += 5;
    signals.push("residual market cap");
  }

  return { score, signals };
}

function scoreAndReasons(
  coin: PumpCoin,
  dormantDays: number,
  ageDays: number,
  categories: string[],
  categoryConfidence: number,
  discoverySignals: string[],
  dex?: { liquidityUsd: number | null; volume24hUsd: number | null },
) {
  const reasons: string[] = [];
  let qualificationScore = 0;

  if (ageDays >= minAgeDays()) {
    qualificationScore += 14;
    reasons.push(`${ageDays}d old`);
  }
  if (dormantDays >= minDormantDays()) {
    qualificationScore += 20;
    reasons.push(`${dormantDays}d dormant`);
  }
  if (categories.length > 0) {
    qualificationScore += Math.min(18, 8 + Math.round(categoryConfidence / 12));
    reasons.push(`category: ${categories.slice(0, 2).map((c) => MEME_CATEGORY_LABELS[c] ?? c).join(", ")}`);
  }
  if (coin.complete || coin.raydium_pool || coin.pool_address) {
    qualificationScore += 14;
    reasons.push("graduated from Pump bonding curve");
  }
  if ((coin.reply_count ?? 0) >= 100) {
    qualificationScore += 16;
    reasons.push(`${coin.reply_count} Pump replies`);
  } else if ((coin.reply_count ?? 0) >= 35) {
    qualificationScore += 9;
    reasons.push(`${coin.reply_count} Pump replies`);
  }
  if (coin.king_of_the_hill_timestamp) {
    qualificationScore += 8;
    reasons.push("hit Pump king-of-the-hill");
  }
  if (coin.twitter || coin.telegram || coin.website) {
    qualificationScore += 6;
    reasons.push("old socials exist");
  }
  if ((dex?.volume24hUsd ?? 0) < 100) {
    qualificationScore += 6;
    reasons.push("low current 24h volume");
  }
  if ((coin.usd_market_cap ?? 0) > 500) {
    qualificationScore += 4;
    reasons.push("nonzero residual market cap");
  }
  if ((plausibleAthUsd(coin)) >= 1_000_000) {
    qualificationScore += 18;
    reasons.push(`ATH cap ${formatCompactUsd(plausibleAthUsd(coin))}`);
  } else if ((plausibleAthUsd(coin)) >= 100_000) {
    qualificationScore += 12;
    reasons.push(`ATH cap ${formatCompactUsd(plausibleAthUsd(coin))}`);
  }
  if (coin.image_uri && (coin.description ?? "").trim().length >= 32) {
    qualificationScore += 6;
    reasons.push("usable artwork + metadata");
  }
  if (discoverySignals.length >= 4) {
    qualificationScore += 6;
    reasons.push("multiple revival signals");
  }

  const revivalScore = Math.min(96, Math.max(10, Math.round(qualificationScore * 0.92)));

  return {
    qualificationScore: Math.min(100, qualificationScore),
    revivalScore,
    qualificationReasons: reasons.slice(0, 5),
  };
}

// ----------------------------------------------------------------------------
// GEM evaluation.
//
// Hard gates (all must hold for isGem) — verifiable, accurate data only:
//   1. residual market cap inside [GEM_MIN_MARKET_CAP_USD, GEM_MAX_MARKET_CAP_USD]
//      (real pump.fun usd_market_cap)
//   2. holders >= GEM_MIN_HOLDERS, verified on-chain via Helius. With no Helius
//      key the gate is "unverified" and only score >= 72 may pass.
//   3. dormancy/age gates inherited from the sweep; scams rejected upstream.
//
// Lifetime volume is NOT a hard gate: pump.fun exposes no accurate lifetime
// volume, so we never block on an estimate. It contributes to the score only.
//
// Score (0-100): holders 24 + est. lifetime volume 20 + ATH:MC upside 18 +
// community heat 12 + MC sweet spot 8 + graduation 8 + dormancy window 6 +
// brand kit 4.
// ----------------------------------------------------------------------------
interface GemVerdict {
  isGem: boolean;
  gemScore: number;
  gemReasons: string[];
}

function evaluateGem(
  coin: PumpCoin,
  dormantDays: number,
  marketCapUsd: number,
  holderCount: number | null,
  lifetimeVolumeUsd: number,
): GemVerdict {
  const reasons: string[] = [];
  let score = 0;

  // Holders (0-24). Unknown gets a neutral baseline, verified scales by log.
  if (holderCount === null) {
    score += 8;
  } else if (holderCount >= gemMinHolders()) {
    score += Math.round(14 + 10 * Math.min(1, Math.log10(holderCount / gemMinHolders())));
    reasons.push(holderCount >= HOLDER_PAGE_LIMIT ? `${HOLDER_PAGE_LIMIT}+ holders` : `${holderCount} holders`);
  } else {
    score += Math.round(14 * (holderCount / gemMinHolders()));
  }

  // Lifetime volume (0-20), log-scaled past the $5M floor (10x floor maxes it).
  // pump.fun exposes no real lifetime-volume field, so this is an estimate and
  // a *signal* only — it never hard-gates a gem (see isGem below).
  if (lifetimeVolumeUsd >= gemMinLifetimeVolumeUsd()) {
    score += Math.round(
      12 + 8 * Math.min(1, Math.log10(lifetimeVolumeUsd / gemMinLifetimeVolumeUsd())),
    );
    reasons.push(`~${formatCompactUsd(lifetimeVolumeUsd)} est. lifetime volume`);
  } else if (lifetimeVolumeUsd > 0) {
    score += Math.round(12 * (lifetimeVolumeUsd / gemMinLifetimeVolumeUsd()));
  }

  // ATH upside (0-18): how far the coin fell — the revival narrative.
  const ath = plausibleAthUsd(coin);
  const ratio = marketCapUsd > 0 ? ath / marketCapUsd : 0;
  if (ratio >= 100) score += 18;
  else if (ratio >= 30) score += 14;
  else if (ratio >= 10) score += 10;
  else if (ratio >= 3) score += 5;
  if (ratio >= 10) reasons.push(`${Math.round(ratio)}x below ATH`);

  // Community heat (0-12).
  const replies = coin.reply_count ?? 0;
  if (replies >= 500) score += 12;
  else if (replies >= 250) score += 9;
  else if (replies >= 100) score += 6;
  else if (replies >= 35) score += 3;

  // Residual-cap sweet spot (0-8): inside the band, with the middle ideal.
  const inBand = marketCapUsd >= gemMinMarketCapUsd() && marketCapUsd <= gemMaxMarketCapUsd();
  if (inBand) {
    score += marketCapUsd >= 10_000 && marketCapUsd <= 50_000 ? 8 : 5;
    reasons.push(`${formatCompactUsd(marketCapUsd)} residual cap`);
  }

  // Graduation (0-8): cleared the bonding curve = proven demand.
  if (coin.complete || coin.raydium_pool || coin.pool_address) score += 8;
  else if (coin.king_of_the_hill_timestamp) score += 4;

  // Dormancy window (0-6): dead long enough to be abandoned, not so long the
  // community has fully evaporated.
  if (dormantDays >= 60 && dormantDays <= 365) score += 6;
  else if (dormantDays >= 45 && dormantDays <= 720) score += 3;
  else score += 1;

  // Brand kit (0-4): revivable identity out of the box.
  if (coin.image_uri && (coin.description ?? "").trim().length >= 32) score += 2;
  if (coin.twitter || coin.telegram || coin.website) score += 2;

  const gemScore = Math.min(100, score);
  // Hard gates use ONLY verifiable, accurate data: residual market-cap band
  // (pump.fun usd_market_cap) and 1,000+ real on-chain holders (Helius).
  // Lifetime volume is unavailable accurately from pump.fun, so it informs the
  // score but never gates. When holders can't be verified (no Helius key), a
  // high composite score is required as a proxy.
  const holdersOk = holderCount === null ? gemScore >= 72 : holderCount >= gemMinHolders();
  const isGem = inBand && holdersOk;
  if (isGem && holderCount === null) reasons.push("holders unverified");

  return { isGem, gemScore, gemReasons: reasons.slice(0, 5) };
}

function formatCompactUsd(value: number) {
  if (value >= 1_000_000) return `$${Math.round(value / 100_000) / 10}M`;
  if (value >= 1_000) return `$${Math.round(value / 100) / 10}K`;
  return `$${Math.round(value)}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    // Bound each upstream call so a stalled API can't hang the request or
    // exhaust the serverless execution window.
    signal: AbortSignal.timeout(8_000),
    headers: {
      accept: "application/json",
      "user-agent": "CTO.fun dead-token sweeper",
    },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${url}`);
  return response.json() as Promise<T>;
}

async function fetchPumpCoins(limit: number): Promise<PumpCoin[]> {
  const pageSize = 50;
  const deep = limit >= 50;
  const oldPageCount = Math.min(6, Math.max(3, Math.ceil(limit / 15)));
  const oldOffsets = Array.from({ length: oldPageCount }, (_, i) => i * pageSize);
  // Gems hide DEEP in these rankings: high-community coins (reply_count) that
  // have since faded, and former higher-cap coins (market_cap) that fell into
  // the residual band. Shallow pages only return still-alive coins, so we page
  // well past the top to reach abandoned-but-once-loved tokens.
  const heatOffsets = deep ? [0, 50, 100, 150, 200, 300, 400, 500] : [0, 50, 100];
  const capOffsets = deep ? [0, 100, 200, 300, 450, 600] : [0, 100, 200];
  const urls = [
    ...oldOffsets.map(
      (offset) =>
        `${PUMPFUN_COINS_ENDPOINT}?offset=${offset}&limit=${pageSize}&sort=last_trade_timestamp&order=ASC&includeNsfw=false`,
    ),
    ...oldOffsets.map(
      (offset) =>
        `${PUMPFUN_COINS_ENDPOINT}?offset=${offset}&limit=${pageSize}&sort=created_timestamp&order=ASC&includeNsfw=false`,
    ),
    ...heatOffsets.map(
      (offset) =>
        `${PUMPFUN_COINS_ENDPOINT}?offset=${offset}&limit=${pageSize}&sort=reply_count&order=DESC&includeNsfw=false`,
    ),
    ...capOffsets.map(
      (offset) =>
        `${PUMPFUN_COINS_ENDPOINT}?offset=${offset}&limit=${pageSize}&sort=market_cap&order=DESC&includeNsfw=false`,
    ),
    `${PUMPFUN_COINS_ENDPOINT}?offset=0&limit=${pageSize}&sort=volume&order=DESC&includeNsfw=false`,
  ];

  const batches = await Promise.allSettled(urls.map((url) => fetchJson<PumpCoin[]>(url)));
  const byMint = new Map<string, PumpCoin>();
  for (const batch of batches) {
    if (batch.status !== "fulfilled") continue;
    for (const coin of batch.value) {
      if (coin.mint && !byMint.has(coin.mint)) byMint.set(coin.mint, coin);
    }
  }
  return [...byMint.values()];
}

// ----------------------------------------------------------------------------
// Holder-count enrichment via Helius DAS getTokenAccounts. One page of up to
// 1000 accounts per mint: if the page is full we know holders >= 1000, which
// is exactly the gem gate — no need to paginate the long tail.
// ----------------------------------------------------------------------------
const HOLDER_PAGE_LIMIT = 1_000;

async function fetchHolderCount(rpcUrl: string, mint: string): Promise<number | null> {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `holders-${mint}`,
        method: "getTokenAccounts",
        params: { mint, page: 1, limit: HOLDER_PAGE_LIMIT, options: { showZeroBalance: false } },
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      result?: { token_accounts?: { owner?: string; amount?: number | string }[] };
    };
    const accounts = payload.result?.token_accounts;
    if (!Array.isArray(accounts)) return null;
    if (accounts.length >= HOLDER_PAGE_LIMIT) return HOLDER_PAGE_LIMIT; // floor: ">= 1000"
    const owners = new Set<string>();
    for (const account of accounts) {
      if (account.owner && Number(account.amount ?? 0) > 0) owners.add(account.owner);
    }
    return owners.size;
  } catch {
    return null;
  }
}

async function enrichWithHolderCounts(mints: string[]) {
  const holders = new Map<string, number | null>();
  const rpcUrl = heliusRpcUrl();
  if (!rpcUrl || mints.length === 0) return holders;
  await Promise.all(
    mints.slice(0, holderEnrichmentLimit()).map(async (mint) => {
      holders.set(mint, await fetchHolderCount(rpcUrl, mint));
    }),
  );
  return holders;
}

/**
 * Pump.fun's API exposes no lifetime-volume field, so without an indexer we
 * estimate it from ATH market cap: graduating the bonding curve plus a Raydium
 * life implies turnover of roughly 3x ATH cap; curve-only coins closer to
 * 1.5x. Deliberately conservative — used only when Helius/Birdeye style
 * indexed volume is unavailable.
 */
function estimateLifetimeVolumeUsd(coin: PumpCoin): number {
  const ath = plausibleAthUsd(coin);
  if (ath <= 0) return 0;
  const graduated = Boolean(coin.complete || coin.raydium_pool || coin.pool_address);
  return Math.round(ath * (graduated ? 3 : 1.5));
}

async function enrichWithDexScreener(mints: string[]) {
  const enriched = new Map<string, { liquidityUsd: number | null; volume24hUsd: number | null }>();
  const enabled = process.env.DEXSCREENER_ENRICHMENT !== "false";
  if (!enabled) return enriched;

  const enrichmentLimit = Number(process.env.DEXSCREENER_ENRICHMENT_LIMIT ?? 60);
  await Promise.all(
    mints.slice(0, enrichmentLimit).map(async (mint) => {
      try {
        const data = await fetchJson<{ pairs?: DexPair[] | null }>(`${DEXSCREENER_TOKEN_ENDPOINT}/${mint}`);
        const best = (data.pairs ?? []).sort(
          (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
        )[0];
        enriched.set(mint, {
          liquidityUsd: best?.liquidity?.usd ?? null,
          volume24hUsd: best?.volume?.h24 ?? null,
        });
      } catch {
        enriched.set(mint, { liquidityUsd: null, volume24hUsd: null });
      }
    }),
  );

  return enriched;
}

function mapPumpCandidate(
  coin: PumpCoin,
  dex?: { liquidityUsd: number | null; volume24hUsd: number | null },
  holderCount: number | null = null,
): DiscoveredDeadToken | null {
  const mint = coin.mint?.trim();
  if (!mint) return null;
  // Reject scams/spam/rugs before any scoring.
  if (detectScam(coin, dex).scam) return null;

  const createdAt = toIso(coin.created_timestamp);
  const lastTradeAt = toIso(coin.last_trade_timestamp);
  const dormantDays = daysSince(lastTradeAt);
  const ageDays = daysSince(createdAt);
  const classified = classifyCategories(coin);
  const discovery = scoreDiscoverySignals(
    coin,
    dormantDays,
    ageDays,
    classified.categories,
    classified.categoryConfidence,
    dex,
  );

  if (ageDays < minAgeDays()) return null;
  if (dormantDays < minDormantDays()) return null;
  if ((dex?.volume24hUsd ?? 0) > maxCurrentVolumeUsd()) return null;

  const marketCapUsd = Number(coin.usd_market_cap ?? coin.market_cap ?? 0);
  const lifetimeVolumeUsd = estimateLifetimeVolumeUsd(coin);
  const gem = evaluateGem(coin, dormantDays, marketCapUsd, holderCount, lifetimeVolumeUsd);

  // A verified gem always qualifies; everything else passes the softer
  // meme-fit gates below.
  if (!gem.isGem) {
    const hasStrongCategory = classified.categories.length > 0 && classified.categoryConfidence >= 32;
    const hasExceptionalHeat = (coin.reply_count ?? 0) >= 300 || (plausibleAthUsd(coin)) >= 250_000;
    const hasUsableMetadata = Boolean(coin.image_uri) && (coin.description ?? "").trim().length >= 16;
    if (!hasUsableMetadata && !hasExceptionalHeat) return null;
    if (!hasStrongCategory && !hasExceptionalHeat) return null;
    if (discovery.score < minGemSignalScore()) return null;
  }

  const scored = scoreAndReasons(
    coin,
    dormantDays,
    ageDays,
    classified.categories,
    classified.categoryConfidence,
    discovery.signals,
    dex,
  );
  if (!gem.isGem && scored.qualificationScore < minQualificationScore()) return null;

  return {
    id: mint,
    source: "pump.fun",
    mint,
    holderCount,
    lifetimeVolumeUsd: lifetimeVolumeUsd || null,
    lifetimeVolumeSource: lifetimeVolumeUsd > 0 ? "estimated" : "",
    isGem: gem.isGem,
    gemScore: gem.gemScore,
    gemReasons: gem.gemReasons,
    name: coin.name?.trim() || "Unknown",
    symbol: coin.symbol?.trim() || "UNKNOWN",
    description: coin.description?.trim() || "",
    imageUrl: safeHttpUrl(coin.image_uri),
    pumpUrl: pumpUrl(mint),
    chartUrl: chartUrl(mint),
    websiteUrl: safeHttpUrl(coin.website),
    twitterUrl: safeHttpUrl(coin.twitter),
    telegramUrl: safeHttpUrl(coin.telegram),
    createdAt,
    lastTradeAt,
    dormantDays,
    replyCount: coin.reply_count ?? 0,
    migrated: Boolean(coin.complete || coin.raydium_pool || coin.pool_address),
    raydiumPool: coin.raydium_pool ?? coin.pool_address ?? "",
    marketCapUsd,
    liquidityUsd: dex?.liquidityUsd ?? null,
    volume24hUsd: dex?.volume24hUsd ?? null,
    historicalVolumeUsd: null,
    athMarketCapUsd: plausibleAthUsd(coin) || null,
    athMarketCapAt: toIso(coin.ath_market_cap_timestamp),
    categories: classified.categories,
    categoryScores: classified.categoryScores,
    categoryConfidence: classified.categoryConfidence,
    discoverySignals: discovery.signals.slice(0, 8),
    status: "candidate",
    sweptAt: new Date().toISOString(),
    ...scored,
  };
}

/**
 * Gem prospects worth a Helius holder lookup: any coin whose residual market
 * cap sits inside the gem band. Holder count is the decisive (and accurate)
 * gate, so we verify it for every in-band candidate rather than pre-filtering
 * on the unreliable volume estimate. Keeps RPC spend proportional to the small
 * in-band subset instead of the whole sweep.
 */
function isGemProspect(coin: PumpCoin): boolean {
  const mcap = Number(coin.usd_market_cap ?? coin.market_cap ?? 0);
  return mcap >= gemMinMarketCapUsd() && mcap <= gemMaxMarketCapUsd();
}

export async function findDeadTokenCandidates(limit = 30): Promise<DiscoveredDeadToken[]> {
  const rawCoins = await fetchPumpCoins(limit);
  const mints = rawCoins.map((coin) => coin.mint).filter(Boolean) as string[];
  const prospectMints = rawCoins.filter(isGemProspect).map((coin) => coin.mint!) as string[];
  const [dex, holders] = await Promise.all([
    enrichWithDexScreener(mints),
    enrichWithHolderCounts(prospectMints),
  ]);
  return rawCoins
    .map((coin) =>
      mapPumpCandidate(
        coin,
        coin.mint ? dex.get(coin.mint) : undefined,
        coin.mint ? holders.get(coin.mint) ?? null : null,
      ),
    )
    .filter((coin): coin is DiscoveredDeadToken => Boolean(coin))
    .sort((a, b) => {
      // Gems first, by gem score; the rest by qualification score.
      if (a.isGem !== b.isGem) return a.isGem ? -1 : 1;
      if (a.isGem && b.isGem) return b.gemScore - a.gemScore;
      return b.qualificationScore - a.qualificationScore;
    })
    .slice(0, limit);
}

export async function sweepDeadTokenCandidates(limit = 40) {
  const candidates = await findDeadTokenCandidates(limit);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { persisted: false, candidates, upserted: 0 };
  }

  const sb = createSupabaseAdminClient();
  const gemColumns = (candidate: DiscoveredDeadToken) => ({
    holder_count: candidate.holderCount,
    lifetime_volume_usd: candidate.lifetimeVolumeUsd,
    lifetime_volume_source: candidate.lifetimeVolumeSource || null,
    is_gem: candidate.isGem,
    gem_score: candidate.gemScore,
    gem_reasons: candidate.gemReasons,
  });
  const rows = candidates.map((candidate) => ({
    ...gemColumns(candidate),
    source: candidate.source,
    source_token_id: candidate.mint,
    mint: candidate.mint,
    name: candidate.name,
    symbol: candidate.symbol,
    description: candidate.description,
    image_url: candidate.imageUrl,
    pump_url: candidate.pumpUrl,
    chart_url: candidate.chartUrl,
    website_url: candidate.websiteUrl,
    twitter_url: candidate.twitterUrl,
    telegram_url: candidate.telegramUrl,
    source_created_at: candidate.createdAt || null,
    last_trade_at: candidate.lastTradeAt || null,
    dormant_days: candidate.dormantDays,
    reply_count: candidate.replyCount,
    migrated: candidate.migrated,
    raydium_pool: candidate.raydiumPool || null,
    market_cap_usd: candidate.marketCapUsd,
    liquidity_usd: candidate.liquidityUsd,
    volume_24h_usd: candidate.volume24hUsd,
    historical_volume_usd: candidate.historicalVolumeUsd,
    ath_market_cap_usd: candidate.athMarketCapUsd,
    ath_market_cap_at: candidate.athMarketCapAt || null,
    categories: candidate.categories,
    category_scores: candidate.categoryScores,
    category_confidence: candidate.categoryConfidence,
    discovery_signals: candidate.discoverySignals,
    qualification_score: candidate.qualificationScore,
    revival_score: candidate.revivalScore,
    qualification_reasons: candidate.qualificationReasons,
    status: candidate.status,
    swept_at: candidate.sweptAt,
    raw_source: candidate,
  }));

  if (rows.length === 0) return { persisted: true, candidates, upserted: 0 };

  const { error } = await sb
    .from("discovered_dead_tokens")
    .upsert(rows, { onConflict: "mint" });
  if (error) {
    // Gem columns ship in migration 0008; keep sweeping on databases that
    // have not applied it yet by retrying without them.
    const missingColumn = error.code === "PGRST204" || error.code === "42703";
    if (!missingColumn) throw error;
    const gemKeys = [
      "holder_count",
      "lifetime_volume_usd",
      "lifetime_volume_source",
      "is_gem",
      "gem_score",
      "gem_reasons",
    ];
    const legacyRows = rows.map((row) => {
      const legacy: Record<string, unknown> = { ...row };
      for (const key of gemKeys) delete legacy[key];
      return legacy;
    });
    const { error: legacyError } = await sb
      .from("discovered_dead_tokens")
      .upsert(legacyRows, { onConflict: "mint" });
    if (legacyError) throw legacyError;
  }

  return { persisted: true, candidates, upserted: rows.length };
}
