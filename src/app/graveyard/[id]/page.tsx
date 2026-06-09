import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fmtUsd } from "@/lib/format";
import { AsciiShader, SourceBadge } from "@/components/protocol-ui";
import { BountyGrid, VoteWidget } from "@/components/protocol-blocks";
import { getBounties, getCampaigns, getDeadCoinById, getGraduatedCampaigns } from "@/lib/data";
import { PHASE_LABELS, toProtoBounty, toProtoRevival } from "@/lib/proto-adapters";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const coin = await getDeadCoinById(id);
  return { title: coin ? `${coin.name} ($${coin.ticker})` : "Revival" };
}

export default async function RevivalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [coin, active, graduated, bounties] = await Promise.all([
    getDeadCoinById(id),
    getCampaigns(),
    getGraduatedCampaigns(),
    getBounties(),
  ]);
  if (!coin) notFound();

  const campaign = [...active, ...graduated].find((c) => c.ticker === coin.ticker);
  const r = toProtoRevival(coin, campaign);
  const phaseIdx = PHASE_LABELS.indexOf(r.phase);
  const coinBounties = bounties.filter((b) => b.coinTicker === r.sym).map(toProtoBounty);

  return (
    <div className="proto">
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.13} mask="head" cols={170} rows={28} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 36, paddingBottom: 14 }}>
          <Link className="lnk mono" href="/graveyard" style={{ fontSize: 12, color: "var(--dim)" }}>
            ← Graveyard
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-.03em", margin: 0 }}>{r.name}</h1>
            <span className="mono" style={{ fontSize: 16, color: "var(--green)" }}>
              ${r.sym}
            </span>
            <span className="chip chip-green lq-chip">{r.phase} phase</span>
            <SourceBadge />
          </div>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 10 }}>
            contract {r.contract} · not affiliated with the original developer
          </div>
        </div>
      </section>

      <section className="section tight wrap">
        {/* phase rail */}
        <div className="lq-glass" style={{ padding: 16, marginBottom: 18 }}>
          <div
            className="mono"
            style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}
          >
            Revival phase
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PHASE_LABELS.map((p, i) => (
              <div key={p} style={{ flex: "1 1 auto", minWidth: 90 }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: i <= phaseIdx ? "var(--green)" : "rgba(255,255,255,.08)",
                    boxShadow: i === phaseIdx ? "0 0 10px var(--green)" : "none",
                  }}
                />
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    marginTop: 7,
                    color: i === phaseIdx ? "var(--green)" : i < phaseIdx ? "var(--dim)" : "var(--faint)",
                  }}
                >
                  {p}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail">
          {/* left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* risk — first class */}
            <div className="lq-glass" style={{ padding: 18, borderColor: "rgba(0,229,153,.22)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="dot dot-live" />
                <span className="eyebrow" style={{ letterSpacing: ".16em" }}>
                  SAFETY · {r.risk.level.toUpperCase()} RISK
                </span>
              </div>
              <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.6, marginTop: 12 }}>{r.risk.note}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {["Mint renounced", "Freeze renounced", "No malicious functions"].map((t) => (
                  <span key={t} className="chip chip-green">
                    ✓ {t}
                  </span>
                ))}
                <span className="chip" style={{ color: "var(--amber)", borderColor: "rgba(245,181,74,.3)" }}>
                  Liquidity thin
                </span>
              </div>
            </div>

            {/* council review */}
            <div className="lq-glass" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div>
                  <div className="eyebrow" style={{ letterSpacing: ".16em" }}>
                    COUNCIL REVIEW SIGNALS
                  </div>
                  <p className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 8, lineHeight: 1.5, maxWidth: 280 }}>
                    Holder demand, safety, market history, lore, ticker quality, and visible community interest.
                  </p>
                </div>
              </div>
              <div className="grid g2" style={{ gap: "12px 22px", marginTop: 18 }}>
                {r.breakdown.map((b) => (
                  <div key={b.k}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "var(--dim)" }}>{b.k}</span>
                      <span className="mono" style={{ fontSize: 11, color: b.v >= 6 ? "var(--green)" : "var(--faint)" }}>
                        {b.v >= 7 ? "strong" : b.v >= 5 ? "review" : "weak"}
                      </span>
                    </div>
                    <div className="scorebar">
                      <span style={{ width: b.v * 10 + "%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* roadmap */}
            <div className="lq-glass" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ letterSpacing: ".16em" }}>
                REBUILD ROADMAP
              </div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 0 }}>
                {r.roadmap.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: "10px 0",
                      borderTop: i ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <span className="mono" style={{ fontSize: 11, color: i < 2 ? "var(--green)" : "var(--faint)", width: 22 }}>
                      {i < 2 ? "✓" : "0" + (i + 1)}
                    </span>
                    <span style={{ fontSize: 13.5, color: i < 2 ? "var(--dim)" : "var(--ink)" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* funded bounties */}
            {coinBounties.length > 0 && (
              <div>
                <div className="sechead" style={{ marginBottom: 14 }}>
                  <h2 style={{ fontSize: 18 }}>Funded bounties</h2>
                  <Link className="lnk" href="/bounties">
                    All →
                  </Link>
                </div>
                <BountyGrid bounties={coinBounties} columns={2} />
              </div>
            )}
          </div>

          {/* right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <VoteWidget initial={r.votes} />
            <div className="lq-glass" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ letterSpacing: ".16em" }}>
                REVIVAL ACTIVITY
              </div>
              <div className="grid g2" style={{ gap: 12, marginTop: 14 }}>
                {([
                  ["Active bounties", r.active],
                  ["Completed", r.done],
                  ["Contributors", r.contributors],
                  ["Bounty spend", fmtUsd(r.spend)],
                ] as [string, string | number][]).map(([k, v]) => (
                  <div key={k} className="lq-soft" style={{ padding: "12px 14px" }}>
                    <div className="tnum" style={{ fontSize: 22, fontWeight: 600 }}>
                      {v}
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)", marginTop: 3 }}
                    >
                      {k}
                    </div>
                  </div>
                ))}
              </div>
              <Link className="btn btn-solid" style={{ width: "100%", marginTop: 16 }} href="/bounties">
                Fund a bounty
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
