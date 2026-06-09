import type { Metadata } from "next";
import { fmtNum, fmtUsd } from "@/lib/format";
import { CountUp, AsciiShader, ScoreRing } from "@/components/protocol-ui";
import { getBuybacks, getGlobalMetrics, getGraduatedCampaigns } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proof of Revival",
  description:
    "Every fee, buyback, and burn on the record. A 5% fee on completed bounties funds open-market token buybacks.",
};

function shortDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function FeeFlow() {
  const steps = [
    { k: "Completed bounty", d: "Contributor paid", c: "var(--dim)" },
    { k: "5% platform fee", d: "Routed to treasury", c: "var(--violet)" },
    { k: "Token buyback", d: "Open-market buy", c: "var(--green)" },
    { k: "Burn / recycle", d: "Supply reduced", c: "var(--green)" },
  ];
  return (
    <div className="pipe">
      {steps.map((s, i) => (
        <span key={s.k} style={{ display: "contents" }}>
          <div className="lq-soft lq-chip pipe-node" style={{ padding: "10px 16px 10px 13px" }}>
            <span className="dot" style={{ background: s.c, boxShadow: s.c !== "var(--dim)" ? "0 0 8px " + s.c : "none" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.k}</div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--faint)" }}>
                {s.d}
              </div>
            </div>
          </div>
          {i < steps.length - 1 && <span className="pipe-link" />}
        </span>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const [m, buybacks, hall] = await Promise.all([
    getGlobalMetrics(),
    getBuybacks(),
    getGraduatedCampaigns(),
  ]);

  const bought = m.totalTokenBought;
  const burned = m.totalTokenBurned;
  const recycled = m.totalTokenRecycled;
  const burnPct = bought > 0 ? Math.round((burned / bought) * 100) : 0;
  const ledger = buybacks.slice(0, 5);

  return (
    <div className="proto">
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.13} mask="head" cols={170} rows={28} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 44, paddingBottom: 12 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
            PROOF OF REVIVAL · PUBLIC LEDGER
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 8px" }}>
            Every fee, buyback, and burn — on the record
          </h1>
          <p style={{ color: "var(--dim)", maxWidth: 580, lineHeight: 1.6 }}>
            A 5% fee on completed bounties funds open-market token buybacks. Revivals that reach a living community
            graduate to the Hall. Nothing is private.
          </p>
        </div>
      </section>

      {/* headline metrics */}
      <section className="section tight wrap">
        <div className="grid g4">
          {[
            { v: fmtUsd(m.totalFeesCollected), k: "fees collected", c: "var(--ink)" },
            { v: <CountUp value={bought} />, k: "tokens bought back", c: "var(--green)" },
            { v: <CountUp value={burned} />, k: "tokens burned", c: "var(--green)" },
            { v: String(m.coinsRevived), k: "coins graduated", c: "var(--ink)" },
          ].map((cell) => (
            <div key={cell.k} className="lq-glass" style={{ padding: 20 }}>
              <div className="tnum" style={{ fontSize: 28, fontWeight: 600, color: cell.c }}>
                {cell.v}
              </div>
              <div
                className="mono"
                style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)", marginTop: 6 }}
              >
                {cell.k}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* fee flow */}
      <section className="section tight wrap">
        <div className="sechead">
          <h2>How fees become buybacks</h2>
        </div>
        <div className="lq-glass" style={{ padding: 20 }}>
          <FeeFlow />
        </div>
      </section>

      {/* buyback ledger + burn ratio */}
      <section className="section tight wrap">
        <div className="detail">
          <div
            className="lq-glass"
            style={{ padding: 4, backdropFilter: "none", WebkitBackdropFilter: "none", background: "rgba(12,17,22,0.9)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
              <span className="eyebrow" style={{ letterSpacing: ".16em" }}>
                BUYBACK LEDGER
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>
                latest {ledger.length}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px 8px" }}>
              <span className="mono" style={{ flex: "1 1 auto", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>
                Source
              </span>
              <span className="mono" style={{ width: 50, textAlign: "right", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>
                Fee
              </span>
              <span className="mono" style={{ width: 70, textAlign: "right", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>
                Tokens
              </span>
              <span className="mono" style={{ width: 76, textAlign: "right", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>
                Status
              </span>
            </div>
            {ledger.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.source}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>
                    {shortDate(b.date)} · {b.tx}
                  </div>
                </div>
                <span className="mono tnum" style={{ width: 50, textAlign: "right", fontSize: 12.5 }}>
                  {fmtUsd(b.feeAmount)}
                </span>
                <span className="mono tnum" style={{ width: 70, textAlign: "right", fontSize: 12.5, color: "var(--green)" }}>
                  {fmtNum(b.tokenAmount)}
                </span>
                <span style={{ width: 76, display: "flex", justifyContent: "flex-end" }}>
                  <span
                    className="chip lq-chip"
                    style={{
                      fontSize: 9.5,
                      padding: "3px 8px",
                      color: b.status === "burned" ? "var(--green)" : "var(--violet)",
                      borderColor: b.status === "burned" ? "rgba(0,229,153,.28)" : "rgba(155,123,255,.3)",
                      background: b.status === "burned" ? "rgba(0,229,153,.06)" : "rgba(155,123,255,.07)",
                    }}
                  >
                    {b.status}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="lq-glass" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span className="eyebrow" style={{ letterSpacing: ".16em", alignSelf: "flex-start" }}>
              BURN RATIO
            </span>
            <ScoreRing value={burnPct} size={130} stroke={8} label="burned" />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              {([
                ["Bought back", bought, "var(--green)"],
                ["Burned", burned, "var(--green)"],
                ["Recycled", recycled, "var(--violet)"],
              ] as [string, number, string][]).map(([k, v, c]) => (
                <div
                  key={k}
                  className="lq-soft"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--dim)" }}>
                    <span className="dot" style={{ background: c }} />
                    {k}
                  </span>
                  <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600 }}>
                    {fmtNum(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hall of Revival */}
      {hall.length > 0 && (
        <section className="section tight wrap">
          <div className="sechead">
            <h2>Hall of Revival</h2>
            <span className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>
              {hall.length} graduated
            </span>
          </div>
          <div className="grid g3">
            {hall.map((g) => (
              <div key={g.id} className="lq-glass hoverlift" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 600 }}>{g.coinName}</span>
                      <span className="mono" style={{ fontSize: 12, color: "var(--green)" }}>
                        ${g.ticker}
                      </span>
                    </div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 4 }}>
                      graduated {shortDate(g.graduationDate ?? "")}
                    </div>
                  </div>
                  <span className="chip chip-green lq-chip">★ Graduated</span>
                </div>
                <div className="lq-soft" style={{ padding: 14, marginTop: 14 }}>
                  {([
                    ["Holders", g.before.holders, g.after.holders],
                    ["Telegram", g.before.telegram, g.after.telegram],
                  ] as [string, number, number][]).map(([k, before, after]) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
                      <span className="mono" style={{ fontSize: 10.5, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                        {k}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="mono tnum" style={{ fontSize: 12, color: "var(--faint)" }}>
                          {fmtNum(before)}
                        </span>
                        <span className="mono" style={{ color: "var(--green)" }}>
                          →
                        </span>
                        <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>
                          {fmtNum(after)}
                        </span>
                      </span>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                      Website
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>
                        {g.before.website}
                      </span>
                      <span className="mono" style={{ color: "var(--green)" }}>
                        →
                      </span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>
                        {g.after.website}
                      </span>
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
                  {([
                    ["Contributors", g.contributorsCount],
                    ["Bounties", g.completedBounties],
                    ["Spend", fmtUsd(g.totalBountySpend)],
                  ] as [string, string | number][]).map(([k, v]) => (
                    <div className="kv" key={k}>
                      <div className="v" style={{ fontSize: 15 }}>
                        {v}
                      </div>
                      <div className="k">{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
