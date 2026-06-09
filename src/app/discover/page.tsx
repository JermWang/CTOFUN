import type { Metadata } from "next";
import { DiscoverBoard } from "@/components/discover-board";
import { PageHeader } from "@/components/blocks";
import { getDiscoveredDeadTokens } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover Dead Pump.fun Tokens",
  description:
    "Find old Pump.fun-origin meme tokens that show dormant trading, prior ATH market-cap heat, and CTO bounty potential.",
};

export default async function DiscoverPage() {
  const candidates = await getDiscoveredDeadTokens();

  return (
    <>
      <PageHeader
        title="Discover"
        subtitle="A sweeper-fed list of old Pump.fun-origin meme tokens that look dormant, had prior ATH/social heat, and may be worth CTO bounty review."
      />
      <DiscoverBoard candidates={candidates} />
    </>
  );
}
