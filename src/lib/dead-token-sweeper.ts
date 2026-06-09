import "server-only";
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

function minDormantDays() {
  return Number(process.env.DEAD_TOKEN_MIN_DORMANT_DAYS ?? 45);
}

function minAgeDays() {
  return Number(process.env.DEAD_TOKEN_MIN_AGE_DAYS ?? 120);
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

function scoreAndReasons(
  coin: PumpCoin,
  dormantDays: number,
  ageDays: number,
  dex?: { liquidityUsd: number | null; volume24hUsd: number | null },
) {
  const reasons: string[] = [];
  let qualificationScore = 0;

  if (ageDays >= minAgeDays()) {
    qualificationScore += 18;
    reasons.push(`${ageDays}d old`);
  }
  if (dormantDays >= minDormantDays()) {
    qualificationScore += 24;
    reasons.push(`${dormantDays}d dormant`);
  }
  if (coin.complete || coin.raydium_pool || coin.pool_address) {
    qualificationScore += 18;
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
    qualificationScore += 16;
    reasons.push(`ATH cap ${formatCompactUsd(coin.ath_market_cap ?? 0)}`);
  } else if ((coin.ath_market_cap ?? 0) >= 100_000) {
    qualificationScore += 10;
    reasons.push(`ATH cap ${formatCompactUsd(coin.ath_market_cap ?? 0)}`);
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
  const pageSize = Math.min(50, Math.max(10, limit));
  const urls = [
    `${PUMPFUN_COINS_ENDPOINT}?offset=0&limit=${pageSize}&sort=last_trade_timestamp&order=ASC&includeNsfw=false`,
    `${PUMPFUN_COINS_ENDPOINT}?offset=0&limit=${pageSize}&sort=reply_count&order=DESC&includeNsfw=false`,
    `${PUMPFUN_COINS_ENDPOINT}?offset=0&limit=${pageSize}&sort=volume&order=DESC&includeNsfw=false`,
    `${PUMPFUN_COINS_ENDPOINT}?offset=0&limit=${pageSize}&sort=created_timestamp&order=ASC&includeNsfw=false`,
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

  await Promise.all(
    mints.slice(0, 24).map(async (mint) => {
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

  if (ageDays < minAgeDays()) return null;
  if (dormantDays < minDormantDays()) return null;

  const scored = scoreAndReasons(coin, dormantDays, ageDays, dex);
  if (scored.qualificationScore < 45) return null;

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
