"use client";

import * as React from "react";
import Link from "next/link";
import { fmtNum, fmtUsd, RiskTag, ScoreRing, StatusDot } from "@/components/protocol-ui";
import { STATUS_MAP, StatusPill } from "@/components/protocol-blocks";
import type { ProtoGrave } from "@/lib/proto-adapters";

const ORDER = ["newly", "review", "candidate", "vote", "selected", "active", "graduated"];

export function GraveyardBoard({ graves }: { graves: ProtoGrave[] }) {
  const [tab, setTab] = React.useState("all");
  const tabs: [string, string][] = [
    ["all", "All"],
    ...ORDER.filter((o) => graves.some((g) => g.status === o)).map((o) => [o, STATUS_MAP[o].label] as [string, string]),
  ];
  const list = tab === "all" ? graves : graves.filter((g) => g.status === tab);

  return (
    <section className="section tight wrap">
      {/* status hierarchy rail */}
      <div className="lq-glass" style={{ padding: 16, marginBottom: 22 }}>
        <div
          className="mono"
          style={{
            fontSize: 9.5,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--faint)",
            marginBottom: 12,
          }}
        >
          Status hierarchy
        </div>
        <div className="pipe">
          {ORDER.map((o, i) => (
            <React.Fragment key={o}>
              <div className="lq-soft lq-chip pipe-node" style={{ padding: "8px 13px 8px 11px" }}>
                <StatusDot kind={STATUS_MAP[o].dot} />
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{STATUS_MAP[o].label}</span>
              </div>
              {i < ORDER.length - 1 && <span className="pipe-link" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
        {tabs.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="lq-chip"
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: "var(--sans)",
              border: "1px solid " + (tab === k ? "rgba(0,229,153,.4)" : "rgba(255,255,255,.1)"),
              background: tab === k ? "rgba(0,229,153,.1)" : "rgba(255,255,255,.02)",
              color: tab === k ? "var(--green)" : "var(--dim)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid" style={{ gap: 10 }}>
        {list.map((g) => (
          <Link
            key={g.id + g.status}
            href={`/graveyard/${g.id}`}
            className="lq-soft hoverlift"
            style={{
              padding: 16,
              cursor: "pointer",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flexWrap: "wrap" }}>
              <ScoreRing value={g.score} size={48} stroke={4} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>{g.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--green)" }}>
                    ${g.sym}
                  </span>
                </div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 3 }}>
                  {fmtNum(g.holders)} holders · {g.dormant}d dormant · {fmtUsd(g.ath)} ATH
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <RiskTag level={g.risk} />
              <StatusPill status={g.status} />
              <span className="mono" style={{ color: "var(--dim)", fontSize: 16 }}>
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
