import type { Metadata } from "next";
import { fmtSol } from "@/lib/format";
import { AsciiShader } from "@/components/protocol-ui";
import { getRevivalApplications, getRevivalProgramMetrics, getGraduatedCampaigns } from "@/lib/data";
import { getTreasuryBalanceSol } from "@/lib/treasury";
import { REVIVAL_APPLICATION_STATUS_LABELS } from "@/lib/domain";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proof of Revival",
  description:
    "CTO.fun's token fees fund a SOL bounty for every revival. Teams deliver in public and get paid. Every bounty and payout is on the record.",
};

function shortDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function FeeFlow() {
  const steps = [
    { k: "CTO token fees", d: "Pump.fun creator fees", c: "var(--dim)" },
    { k: "Bounty funded", d: "On Pump.fun", c: "var(--violet)" },
    { k: "Team delivers", d: "Public revival work", c: "var(--green)" },
    { k: "Paid in SOL", d: "Startup capital", c: "var(--green)" },
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
  const [metrics, treasurySol, revivals, hall] = await Promise.all([
    getRevivalProgramMetrics(),
    getTreasuryBalanceSol(),
    getRevivalApplications(),
    getGraduatedCampaigns(),
  ]);

  // Public ledger: funded/delivered/paid revivals, paid ones first.
  const ledger = revivals
    .filter((r) => r.status === "funded" || r.status === "delivered" || r.status === "paid")
    .sort((a, b) => (a.status === "paid" ? -1 : 1) - (b.status === "paid" ? -1 : 1))
    .slice(0, 8);

  return (
    <div className="proto">
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.13} mask="head" cols={170} rows={28} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 44, paddingBottom: 12 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
            PROOF OF REVIVAL · PUBLIC LEDGER
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 8px" }}>
            Every bounty and payout — on the record
          </h1>
          <p style={{ color: "var(--dim)", maxWidth: 600, lineHeight: 1.6 }}>
            CTO.fun&apos;s own token fees fund a SOL bounty for each revival. Vetted teams deliver the takeover in
            public and get paid. Nothing is private.
          </p>
        </div>
      </section>

      {/* headline metrics */}
      <section className="section tight wrap">
        <div className="grid g4">
          {[
            { v: fmtSol(treasurySol), k: "treasury balance", c: "var(--ink)" },
            { v: fmtSol(metrics.bountySolCommitted), k: "bounties committed", c: "var(--violet)" },
            { v: fmtSol(metrics.bountySolPaid), k: "paid to teams", c: "var(--green)" },
            { v: String(metrics.teamsSelected), k: "teams leading", c: "var(--ink)" },
          ].map((cell) => (
            <div key={cell.k} className="lq-glass" style={{ padding: 20 }}>
              <div className="tnum" style={{ fontSize: 26, fontWeight: 600, color: cell.c }}>
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
          <h2>How fees become revivals</h2>
        </div>
        <div className="lq-glass" style={{ padding: 20 }}>
          <FeeFlow />
        </div>
      </section>

      {/* payout ledger */}
      <section className="section tight wrap">
        <div className="sechead">
          <h2>Bounty ledger</h2>
          <span className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>
            {ledger.length > 0 ? `latest ${ledger.length}` : "no payouts yet"}
          </span>
        </div>
        {ledger.length === 0 ? (
          <div className="lq-soft" style={{ padding: 26, textAlign: "center", fontSize: 13.5, color: "var(--dim)" }}>
            Funded bounties and payouts will appear here as teams are selected and deliver their revivals.
          </div>
        ) : (
          <div className="lq-glass" style={{ padding: 4 }}>
            {ledger.map((r) => (
              <div
                key={r.id}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderTop: "1px solid var(--line)" }}
              >
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.teamName} <span className="mono" style={{ color: "var(--green)", fontSize: 12 }}>${r.tokenSymbol}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.payoutTx ? `${shortDate(r.paidAt)} · ${r.payoutTx}` : REVIVAL_APPLICATION_STATUS_LABELS[r.status]}
                  </div>
                </div>
                <span className="mono tnum" style={{ width: 110, textAlign: "right", fontSize: 13, color: r.status === "paid" ? "var(--green)" : "var(--dim)" }}>
                  {fmtSol(r.status === "paid" ? r.paidAmountSol : r.bountyAmountSol)}
                </span>
                <span style={{ width: 92, display: "flex", justifyContent: "flex-end" }}>
                  <span className="statuspill" style={{ borderColor: "var(--line-2)" }}>
                    {REVIVAL_APPLICATION_STATUS_LABELS[r.status]}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
