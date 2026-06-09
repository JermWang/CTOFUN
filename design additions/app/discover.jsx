/* CTO.fun prototype — Discover terminal surface. */

function Discover({ go, queue, togglePick }) {
  const all = window.CTO.candidates;
  const [filter, setFilter] = React.useState("all");
  const [q, setQ] = React.useState("");

  const FILTERS = [
    { k: "all", label: "All" },
    { k: "dormant", label: "Dormant" },
    { k: "migrated", label: "Graduated" },
    { k: "heat", label: "Past heat" },
    { k: "review", label: "Needs review" },
  ];

  const filtered = all.filter((c) => {
    if (filter === "dormant" && c.dormant < 150) return false;
    if (filter === "migrated" && !c.migrated) return false;
    if (filter === "heat" && c.replies < 400) return false;
    if (filter === "review" && !["review", "newly", "candidate"].includes(c.status)) return false;
    const n = q.trim().toLowerCase();
    if (n && !(c.name + " " + c.sym).toLowerCase().includes(n)) return false;
    return true;
  });

  return (
    <div>
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.1} mask="head" cols={170} rows={26} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 44 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>DISCOVER · TOKEN DISCOVERY TERMINAL</div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 22px" }}>Dormant Pump.fun-origin candidates</h1>
          <SweepBar />
        </div>
      </section>

      <section className="section tight wrap">
        {/* search + filters */}
        <div className="lq-glass" style={{ padding: 14, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }}>⌕</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or ticker"
                style={{ width: "100%", height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 999, color: "var(--ink)",
                  border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.02)", fontSize: 14, outline: "none", fontFamily: "var(--sans)" }} />
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <button key={f.k} onClick={() => setFilter(f.k)} className="lq-chip"
                  style={{ fontSize: 12.5, fontWeight: 500, padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "var(--sans)",
                    border: "1px solid " + (filter === f.k ? "rgba(0,229,153,.4)" : "rgba(255,255,255,.1)"),
                    background: filter === f.k ? "rgba(0,229,153,.1)" : "rgba(255,255,255,.02)",
                    color: filter === f.k ? "var(--green)" : "var(--dim)" }}>{f.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--dim)" }}>{filtered.length} candidate{filtered.length !== 1 ? "s" : ""}</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>sorted by qualification score</span>
        </div>

        {filtered.length === 0 ? (
          <div className="lq-soft" style={{ padding: 48, textAlign: "center", color: "var(--dim)" }}>No candidates matched this filter.</div>
        ) : (
          <div className="grid g2">
            {[...filtered].sort((a, b) => b.qual - a.qual).map((c) => (
              <CandidateCard key={c.id} c={c} onOpen={(id) => go("revival", id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

window.Discover = Discover;
