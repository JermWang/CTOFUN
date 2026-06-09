import type { Metadata } from "next";
import { DiscoverBoard } from "@/components/discover-board";
import { AsciiShader } from "@/components/protocol-ui";
import { SweepBar } from "@/components/protocol-blocks";
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
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.1} mask="head" cols={170} rows={26} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 44 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
            DISCOVER · TOKEN DISCOVERY TERMINAL
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 22px" }}>
            Dormant Pump.fun-origin candidates
          </h1>
          <SweepBar sweep={sweep} />
        </div>
      </section>

      <DiscoverBoard candidates={candidates} />
    </div>
  );
}
