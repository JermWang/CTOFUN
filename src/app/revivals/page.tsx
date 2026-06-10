import Link from "next/link";
import type { Metadata } from "next";
/* eslint-disable @next/next/no-img-element */
import { AsciiShader } from "@/components/protocol-ui";
import { RevivalDeliverForm } from "@/components/revival-deliver-form";
import { getRevivalApplications, getRevivalProgramMetrics } from "@/lib/data";
import { REVIVAL_APPLICATION_STATUS_LABELS, type RevivalApplicationStatus } from "@/lib/domain";
import { fmtSol } from "@/lib/format";
import type { RevivalApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Active Revivals",
  description: "Teams leading community takeovers of dead Pump.fun tokens, funded by CTO.fun bounties.",
};

const STATUS_COLOR: Record<RevivalApplicationStatus, string> = {
  pending: "var(--faint)",
  approved: "var(--violet)",
  funded: "var(--green)",
  delivered: "var(--violet)",
  paid: "var(--green)",
  rejected: "var(--faint)",
  failed: "var(--faint)",
};

export default async function RevivalsPage() {
  const [revivals, metrics] = await Promise.all([
    getRevivalApplications(),
    getRevivalProgramMetrics(),
  ]);

  return (
    <div className="proto">
      <section className="hero lq-frame" style={{ paddingBottom: 6 }}>
        <AsciiShader opacity={0.1} mask="head" cols={170} rows={22} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 40, paddingBottom: 14 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
            REVIVALS · TEAM-LED TAKEOVERS
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 8px" }}>
            Teams bringing dead tokens back
          </h1>
          <p style={{ color: "var(--dim)", maxWidth: 580, lineHeight: 1.6 }}>
            Each revival is led by a vetted team, funded by a CTO.fun bounty on Pump.fun. They deliver the takeover in
            public and earn the bounty as startup capital.
          </p>
          <div style={{ display: "flex", gap: 28, marginTop: 22, flexWrap: "wrap" }}>
            {([
              [String(metrics.teamsSelected), "teams leading"],
              [fmtSol(metrics.bountySolCommitted), "bounties committed"],
              [fmtSol(metrics.bountySolPaid), "paid to teams"],
            ] as [string, string][]).map(([v, k]) => (
              <div className="kv" key={k}>
                <div className="v" style={{ fontSize: 22 }}>
                  {v}
                </div>
                <div className="k">{k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight wrap">
        {revivals.length === 0 ? (
          <div className="lq-soft" style={{ padding: 30, textAlign: "center", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <strong style={{ fontSize: 15, color: "var(--ink)" }}>No revivals are live yet.</strong>
            <span style={{ fontSize: 13, color: "var(--dim)", maxWidth: 440, lineHeight: 1.55 }}>
              Browse dead tokens on Discover and apply to lead one. Vetted teams show up here once selected.
            </span>
            <Link className="btn btn-solid" href="/discover" style={{ marginTop: 8 }}>
              Discover dead tokens -&gt;
            </Link>
          </div>
        ) : (
          <div className="grid g2">
            {revivals.map((r) => (
              <RevivalCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RevivalCard({ r }: { r: RevivalApplication }) {
  const showDeliver = r.status === "approved" || r.status === "funded";
  return (
    <article className="lq-glass hoverlift" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {r.tokenImageUrl && (
          <img
            src={r.tokenImageUrl}
            alt={`${r.tokenName} token`}
            width={44}
            height={44}
            style={{ width: 44, height: 44, borderRadius: 11, objectFit: "cover", border: "1px solid var(--line-2)" }}
          />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 650, color: "var(--ink)" }}>{r.tokenName}</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--green)" }}>
              ${r.tokenSymbol}
            </span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>
            led by {r.teamName}
          </div>
        </div>
        <span
          className="statuspill"
          style={{ color: STATUS_COLOR[r.status], borderColor: "var(--line-2)" }}
        >
          {REVIVAL_APPLICATION_STATUS_LABELS[r.status]}
        </span>
      </div>

      <p style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.55, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {r.pitch}
      </p>

      <div className="lq-soft" style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
        <div className="kv">
          <div className="v" style={{ fontSize: 15 }}>{fmtSol(r.bountyAmountSol)}</div>
          <div className="k">bounty</div>
        </div>
        <div className="kv">
          <div className="v" style={{ fontSize: 15 }}>{r.teamSize}</div>
          <div className="k">team size</div>
        </div>
        {r.status === "paid" && (
          <div className="kv">
            <div className="v" style={{ fontSize: 15, color: "var(--green)" }}>{fmtSol(r.paidAmountSol)}</div>
            <div className="k">paid</div>
          </div>
        )}
      </div>

      {r.deliveryLinks.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {r.deliveryLinks.slice(0, 4).map((link, i) => (
            <a key={link} className="mono" style={{ fontSize: 11, color: "var(--green-dim)" }} href={link} target="_blank" rel="noreferrer">
              proof {i + 1}
            </a>
          ))}
        </div>
      )}

      {r.payoutTx && (
        <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", wordBreak: "break-all" }}>
          payout tx: {r.payoutTx}
        </div>
      )}

      {showDeliver && <RevivalDeliverForm applicationId={r.id} symbol={r.tokenSymbol} />}
    </article>
  );
}
