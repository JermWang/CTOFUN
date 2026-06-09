import Link from "next/link";
import { AsciiShader } from "@/components/protocol-ui";
import { Pipeline } from "@/components/protocol-blocks";
import { SplashTokenCarousel } from "@/components/splash-token-carousel";
import { getDiscoveredDeadTokens, getGlobalMetrics } from "@/lib/data";
import { fmtNum, fmtUsd } from "@/lib/format";
import { toProtoCandidate } from "@/lib/proto-adapters";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [globalMetrics, discovered] = await Promise.all([
    getGlobalMetrics(),
    getDiscoveredDeadTokens(),
  ]);

  const carouselTokens = discovered.slice(0, 5).map(toProtoCandidate);

  return (
    <div className="proto splash-home">
      <section className="hero lq-frame">
        <AsciiShader opacity={0.17} mask="hero" />
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
              PUMP.FUN-ORIGIN REVIVAL PROTOCOL
            </div>
            <h1>
              Bring dead
              <br />
              Pump.fun tokens
              <br />
              <span style={{ color: "var(--green)" }}>back to life.</span>
            </h1>
            <p className="sub">
              Discover dormant launches the market forgot. Fund the takeover through bounties. Track every revival as
              public, on-chain proof.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-solid" href="/discover">
                Discover Candidates -&gt;
              </Link>
            </div>
            <div className="hero-stats">
              {([
                [String(globalMetrics.coinsRevived), "coins revived"],
                [fmtUsd(globalMetrics.rewardsPaid), "bounties paid"],
                [fmtNum(globalMetrics.contributors), "contributors"],
              ] as [string, string][]).map(([v, k]) => (
                <div key={k}>
                  <div className="v tnum">{v}</div>
                  <div className="k">{k}</div>
                </div>
              ))}
            </div>
          </div>
          {carouselTokens.length > 0 && (
            <div className="splash-carousel-shell">
              <SplashTokenCarousel tokens={carouselTokens} />
            </div>
          )}
        </div>
        <div className="wrap splash-pipeline">
          <Pipeline />
        </div>
      </section>
    </div>
  );
}
