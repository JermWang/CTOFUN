import Link from "next/link";
import {
  getBounties,
  getCampaigns,
  getDiscoveredDeadTokens,
  getGlobalMetrics,
} from "@/lib/data";
import { fmtNum, fmtUsd } from "@/lib/format";
import { AsciiShader, ScoreRing, RiskTag } from "@/components/protocol-ui";
import { BountyGrid, CtaPanel, LiveSweep, Pipeline } from "@/components/protocol-blocks";
import { WORKFLOW, toProtoBounty, toSweepCandidate } from "@/lib/proto-adapters";
import { REVIVAL_PHASES } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [campaigns, bounties, globalMetrics, discovered] = await Promise.all([
    getCampaigns(),
    getBounties(),
    getGlobalMetrics(),
    getDiscoveredDeadTokens(),
  ]);

  const featured = campaigns[0];
  const phaseLabel = featured
    ? REVIVAL_PHASES.find((p) => p.key === featured.phase)?.label ?? "Rebuild"
    : "Rebuild";
  const riskLvl = featured ? (featured.revivalScore >= 76 ? "Low" : featured.revivalScore >= 60 ? "Med" : "High") : "Low";

  const openBounties = bounties.filter((b) => b.status === "open").slice(0, 3).map(toProtoBounty);
  const sweep = discovered.slice(0, 24).map(toSweepCandidate);

  return (
    <div className="proto">
      {/* hero */}
      <section className="hero lq-frame">
        <AsciiShader opacity={0.17} mask="hero" />
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
              ◆ PUMP.FUN-ORIGIN REVIVAL PROTOCOL
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
                Discover Candidates →
              </Link>
              <Link className="btn btn-outline" href="/bounties">
                Fund Bounties
              </Link>
              <Link className="btn btn-ghost" href="/submit">
                Submit a Token
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
          {sweep.length > 0 && <LiveSweep data={sweep} count={5} />}
        </div>
        <div className="wrap" style={{ position: "relative", zIndex: 1, padding: "8px 28px 34px" }}>
          <Pipeline />
        </div>
      </section>

      {/* current revival */}
      {featured && (
        <section className="section wrap">
          <div className="sechead">
            <h2>Current revival</h2>
            <Link className="lnk" href="/graveyard">
              All revivals →
            </Link>
          </div>
          <div className="lq-glass" style={{ padding: 24 }}>
            <div className="detail">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{featured.coinName}</h3>
                  <span className="mono" style={{ color: "var(--green)" }}>
                    ${featured.ticker}
                  </span>
                  <span className="chip chip-green lq-chip">{phaseLabel} phase</span>
                  <RiskTag level={riskLvl} />
                </div>
                <p style={{ fontSize: 14, color: "var(--dim)", lineHeight: 1.6, marginTop: 14, maxWidth: 560 }}>
                  {featured.manifesto}
                </p>
                <div style={{ display: "flex", gap: 28, marginTop: 20, flexWrap: "wrap" }}>
                  {([
                    ["Active bounties", featured.activeBounties],
                    ["Completed", featured.completedBounties],
                    ["Contributors", featured.contributorsCount],
                    ["Bounty spend", fmtUsd(featured.totalBountySpend)],
                  ] as [string, string | number][]).map(([k, v]) => (
                    <div className="kv" key={k}>
                      <div className="v">{v}</div>
                      <div className="k">{k}</div>
                    </div>
                  ))}
                </div>
                <Link className="btn btn-solid" style={{ marginTop: 22 }} href={`/revivals/${featured.slug}`}>
                  Join the revival →
                </Link>
              </div>
              <div
                className="lq-soft"
                style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
              >
                <ScoreRing value={featured.revivalScore} size={120} stroke={7} label="revival score" />
                <div
                  className="mono"
                  style={{ fontSize: 10.5, color: "var(--faint)", textAlign: "center", letterSpacing: ".06em" }}
                >
                  weighted · meme · safety · community · liquidity · lore
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* workflow categories */}
      <section className="section tight wrap">
        <div className="sechead">
          <h2>Bounties pay for the takeover work</h2>
          <Link className="lnk" href="/bounties">
            Open the work queue →
          </Link>
        </div>
        <div className="flowrail">
          {WORKFLOW.map((w, i) => (
            <Link key={w.k} className="lq-soft flowcell" href="/bounties">
              <div className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
                {i < 9 ? "0" + (i + 1) : "10"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>{w.k}</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 3 }}>
                {w.d}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 11 }}>
                <span className="dot dot-live" />
                <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}>
                  {w.open} open
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* active bounties */}
      {openBounties.length > 0 && (
        <section className="section tight wrap">
          <div className="sechead">
            <h2>Active bounties</h2>
            <Link className="lnk" href="/bounties">
              All bounties →
            </Link>
          </div>
          <BountyGrid bounties={openBounties} columns={3} />
        </section>
      )}

      {/* CTA */}
      <section className="section wrap">
        <CtaPanel />
      </section>
    </div>
  );
}
