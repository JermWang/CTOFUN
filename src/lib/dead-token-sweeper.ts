import "server-only";
import { MEME_CATEGORY_LABELS } from "@/lib/domain";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const PUMPFUN_COINS_ENDPOINT = "https://frontend-api-v3.pump.fun/coins";
const DEXSCREENER_TOKEN_ENDPOINT = "https://api.dexscreener.com/latest/dex/tokens";

export interface DiscoveredDeadToken {
  id: string;
  source: "pump.fun";
  mint: string;
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
  const ath = coin.ath_market_cap ?? 0;
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
  if ((coin.ath_market_cap ?? 0) >= 1_000_000) {
    qualificationScore += 18;
    reasons.push(`ATH cap ${formatCompactUsd(coin.ath_market_cap ?? 0)}`);
  } else if ((coin.ath_market_cap ?? 0) >= 100_000) {
    qualificationScore += 12;
    reasons.push(`ATH cap ${formatCompactUsd(coin.ath_market_cap ?? 0)}`);
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

function formatCompactUsd(value: number) {
  if (value >= 1_000_000) return `$${Math.round(value / 100_000) / 10}M`;
  if (value >= 1_000) return `$${Math.round(value / 100) / 10}K`;
  return `$${Math.round(value)}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
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
  const oldPageCount = Math.min(6, Math.max(3, Math.ceil(limit / 15)));
  const oldOffsets = Array.from({ length: oldPageCount }, (_, i) => i * pageSize);
  const heatOffsets = [0, 50];
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
    `${PUMPFUN_COINS_ENDPOINT}?offset=0&limit=${pageSize}&sort=market_cap&order=DESC&includeNsfw=false`,
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
): DiscoveredDeadToken | null {
  const mint = coin.mint?.trim();
  if (!mint || coin.nsfw || coin.is_banned) return null;

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

  const hasStrongCategory = classified.categories.length > 0 && classified.categoryConfidence >= 32;
  const hasExceptionalHeat = (coin.reply_count ?? 0) >= 300 || (coin.ath_market_cap ?? 0) >= 250_000;
  const hasUsableMetadata = Boolean(coin.image_uri) && (coin.description ?? "").trim().length >= 16;
  if (!hasUsableMetadata && !hasExceptionalHeat) return null;
  if (!hasStrongCategory && !hasExceptionalHeat) return null;
  if (discovery.score < minGemSignalScore()) return null;
  if ((dex?.volume24hUsd ?? 0) > maxCurrentVolumeUsd()) return null;

  const scored = scoreAndReasons(
    coin,
    dormantDays,
    ageDays,
    classified.categories,
    classified.categoryConfidence,
    discovery.signals,
    dex,
  );
  if (scored.qualificationScore < minQualificationScore()) return null;

  return {
    id: mint,
    source: "pump.fun",
    mint,
    name: coin.name?.trim() || "Unknown",
    symbol: coin.symbol?.trim() || "UNKNOWN",
    description: coin.description?.trim() || "",
    imageUrl: coin.image_uri ?? "",
    pumpUrl: pumpUrl(mint),
    chartUrl: chartUrl(mint),
    websiteUrl: coin.website ?? "",
    twitterUrl: coin.twitter ?? "",
    telegramUrl: coin.telegram ?? "",
    createdAt,
    lastTradeAt,
    dormantDays,
    replyCount: coin.reply_count ?? 0,
    migrated: Boolean(coin.complete || coin.raydium_pool || coin.pool_address),
    raydiumPool: coin.raydium_pool ?? coin.pool_address ?? "",
    marketCapUsd: Number(coin.usd_market_cap ?? coin.market_cap ?? 0),
    liquidityUsd: dex?.liquidityUsd ?? null,
    volume24hUsd: dex?.volume24hUsd ?? null,
    historicalVolumeUsd: null,
    athMarketCapUsd: coin.ath_market_cap ?? null,
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

export async function findDeadTokenCandidates(limit = 30): Promise<DiscoveredDeadToken[]> {
  const rawCoins = await fetchPumpCoins(limit);
  const dex = await enrichWithDexScreener(rawCoins.map((coin) => coin.mint).filter(Boolean) as string[]);
  return rawCoins
    .map((coin) => mapPumpCandidate(coin, coin.mint ? dex.get(coin.mint) : undefined))
    .filter((coin): coin is DiscoveredDeadToken => Boolean(coin))
    .sort((a, b) => b.qualificationScore - a.qualificationScore)
    .slice(0, limit);
}

export async function sweepDeadTokenCandidates(limit = 40) {
  const candidates = await findDeadTokenCandidates(limit);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { persisted: false, candidates, upserted: 0 };
  }

  const sb = createSupabaseAdminClient();
  const rows = candidates.map((candidate) => ({
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
  if (error) throw error;

  return { persisted: true, candidates, upserted: rows.length };
}
