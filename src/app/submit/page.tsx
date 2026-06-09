import type { Metadata } from "next";
import { SubmitFlow, type KnownToken } from "@/components/submit-flow";
import { getDiscoveredDeadTokens } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit a Token",
  description:
    "Paste a Pump.fun-origin mint and we pull what we can on-chain. Add your dormancy read and revival case — the council reviews every submission.",
};

export default async function SubmitPage() {
  const tokens = await getDiscoveredDeadTokens();
  const known: KnownToken[] = tokens.slice(0, 40).map((t) => ({
    sym: t.symbol,
    name: t.name,
    ath: t.athMarketCapUsd ?? t.marketCapUsd,
    replies: t.replyCount,
    dormant: t.dormantDays,
    migrated: t.migrated,
    last: t.lastTradeAt ? new Date(t.lastTradeAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
  }));

  return <SubmitFlow known={known} />;
}
