"use client";

import * as React from "react";
import { CandidateCard, type ProtoCandidate } from "@/components/protocol-blocks";

const FILTERS = [
  { k: "all", label: "All" },
  { k: "dormant", label: "Dormant" },
  { k: "migrated", label: "Graduated" },
  { k: "heat", label: "Past heat" },
  { k: "review", label: "Needs review" },
] as const;

type FilterKey = (typeof FILTERS)[number]["k"];

export function DiscoverBoard({ candidates }: { candidates: ProtoCandidate[] }) {
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [q, setQ] = React.useState("");

  const filtered = candidates.filter((c) => {
    if (filter === "dormant" && c.dormant < 150) return false;
    if (filter === "migrated" && !c.migrated) return false;
    if (filter === "heat" && c.replies < 400) return false;
    if (filter === "review" && !(c.qual >= 60 && c.qual < 76)) return false;
    const n = q.trim().toLowerCase();
    if (n && !(c.name + " " + c.sym).toLowerCase().includes(n)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.qual - a.qual);

  return (
    <section className="section tight wrap">
      {/* search + filters */}
      <div className="lq-glass" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span
              style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }}
            >
              ⌕
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or ticker"
              style={{
                width: "100%",
                height: 40,
                paddingLeft: 34,
                paddingRight: 12,
                borderRadius: 999,
                color: "var(--ink)",
                border: "1px solid rgba(255,255,255,.1)",
                background: "rgba(255,255,255,.02)",
                fontSize: 14,
                outline: "none",
                fontFamily: "var(--sans)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className="lq-chip"
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "8px 14px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "var(--sans)",
                  border: "1px solid " + (filter === f.k ? "rgba(0,229,153,.4)" : "rgba(255,255,255,.1)"),
                  background: filter === f.k ? "rgba(0,229,153,.1)" : "rgba(255,255,255,.02)",
                  color: filter === f.k ? "var(--green)" : "var(--dim)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--dim)" }}>
          {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
        </span>
        <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
          sorted by qualification score
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="lq-soft" style={{ padding: 48, textAlign: "center", color: "var(--dim)" }}>
          No candidates matched this filter.
        </div>
      ) : (
        <div className="grid g2">
          {sorted.map((c) => (
            <CandidateCard key={c.id} c={c} href="/bounties" />
          ))}
        </div>
      )}
    </section>
  );
}
