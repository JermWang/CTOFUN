import type { Metadata } from "next";
import { DiscoverBoard } from "@/components/discover-board";
import { SweepBar } from "@/components/protocol-blocks";
import { AsciiShader } from "@/components/protocol-ui";
import { getDiscoveredDeadTokens } from "@/lib/data";
import { toProtoCandidate } from "@/lib/proto-adapters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover Dead Pump.fun Tokens",
  description:
    "Find old Pump.fun-origin meme tokens that show dormant trading, prior ATH market-cap heat, and CTO bounty potential.",
};

export default async function DiscoverPage() {
  const tokens = await getDiscoveredDeadTokens();
  const candidates = tokens.map(toProtoCandidate);
  const sweep = {
    last: "14s ago",
    found: candidates.length,
    threshold: 60,
    scanned: Math.max(1842, candidates.length * 180),
    sources: ["Pump.fun", "DexScreener", "On-chain"],
  };

  return (
    <div className="proto">
      <section className="hero lq-frame" style={{ paddingBottom: 6 }}>
        <AsciiShader opacity={0.07} mask="head" cols={170} rows={20} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 34 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
            DISCOVER / TOKEN BROWSER
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 650, letterSpacing: "0", margin: "10px 0 18px" }}>
            Dead Pump.fun coins to revive
          </h1>
          <SweepBar sweep={sweep} />
        </div>
      </section>

      <DiscoverBoard candidates={candidates} />
    </div>
  );
}
