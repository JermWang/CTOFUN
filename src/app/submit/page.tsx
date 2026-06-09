import type { Metadata } from "next";
import { SubmitFlow, type KnownToken } from "@/components/submit-flow";
import { getDiscoveredDeadTokens } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a Revival",
  description:
    "Token holders can request a Pump.fun-origin token revival by connecting a wallet and submitting the mint for council review.",
};

export default async function SubmitPage() {
  const tokens = await getDiscoveredDeadTokens();
  const known: KnownToken[] = tokens.slice(0, 40).map((t) => ({
    mint: t.mint,
    sym: t.symbol,
    name: t.name,
    ath: t.athMarketCapUsd ?? t.marketCapUsd,
    replies: t.replyCount,
    dormant: t.dormantDays,
    migrated: t.migrated,
    last: t.lastTradeAt ? new Date(t.lastTradeAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-",
    chartUrl: t.chartUrl,
    marketCap: t.marketCapUsd,
  }));

  return <SubmitFlow known={known} />;
}
