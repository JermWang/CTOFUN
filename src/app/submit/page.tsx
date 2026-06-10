import type { Metadata } from "next";
import { SubmitFlow, type KnownToken } from "@/components/submit-flow";
import { getStoredDiscoveredDeadTokens } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a Revival",
  description:
    "Token holders can request a Pump.fun-origin token revival by connecting a wallet and submitting the mint for council review.",
};

export default async function SubmitPage() {
  const tokens = await getStoredDiscoveredDeadTokens(40);
  const known: KnownToken[] = tokens.map((t) => ({
    mint: t.mint,
    sym: t.symbol,
    name: t.name,
    description: t.description,
    imageUrl: t.imageUrl,
    pumpUrl: t.pumpUrl,
    chartUrl: t.chartUrl,
    websiteUrl: t.websiteUrl,
    twitterUrl: t.twitterUrl,
    telegramUrl: t.telegramUrl,
    ath: t.athMarketCapUsd ?? t.marketCapUsd,
    liquidityUsd: t.liquidityUsd,
    volume24hUsd: t.volume24hUsd,
    holders: t.holderCount,
    replies: t.replyCount,
    dormant: t.dormantDays,
    migrated: t.migrated,
    last: t.lastTradeAt ? new Date(t.lastTradeAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-",
    marketCap: t.marketCapUsd,
    qual: t.qualificationScore,
    reasons: t.qualificationReasons.slice(0, 4),
    categories: t.categories,
  }));

  return <SubmitFlow known={known} />;
}
