/* CTO.fun prototype — shared composite components. */

function Pipeline() {
  const P = [
    { k: "Dormant", d: "Pump.fun-origin", on: true },
    { k: "Review", d: "Scored & gated", on: true },
    { k: "Bounties", d: "Funded CTO work", on: true },
    { k: "Proof", d: "Public revival", on: false },
  ];
  return (
    <div className="pipe">
      {P.map((p, i) => (
        <React.Fragment key={p.k}>
          <div className="lq-soft lq-chip pipe-node">
            <span className="dot" style={{ background: p.on ? "var(--green)" : "var(--faint)", boxShadow: p.on ? "0 0 8px var(--green)" : "none" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.k}</div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--faint)" }}>{p.d}</div>
            </div>
          </div>
          {i < P.length - 1 && <span className="pipe-link" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function SweepBar() {
  const s = window.CTO.sweep;
  const found = useCountUp(s.found, 1000);
  return (
    <div className="lq-glass" style={{ padding: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="dot dot-live" />
          <span className="eyebrow" style={{ letterSpacing: ".18em" }}>DISCOVERY SWEEP</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>· last {s.last}</span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["found", Math.round(found)], ["scanned", fmtNum(s.scanned)], ["gate", "score ≥ " + s.threshold]].map(([k, v]) => (
            <div key={k} className="lq-soft" style={{ padding: "8px 13px" }}>
              <span className="mono" style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>{k} </span>
              <span className="tnum" style={{ fontSize: 13, fontWeight: 600, marginLeft: 4 }}>{v}</span>
            </div>
          ))}
          <div className="lq-soft" style={{ padding: "8px 13px", display: "flex", alignItems: "center", gap: 7 }}>
            <span className="mono" style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>sources</span>
            {s.sources.map((src) => <span key={src} className="mono" style={{ fontSize: 10.5, color: "var(--dim)" }}>{src}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveSweep({ count = 5 }) {
  const rows = useSweepFeed(window.CTO.candidates.slice(0, count));
  return (
    <div className="lq-glass" style={{ padding: 18, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span className="dot dot-live" /><span className="eyebrow" style={{ letterSpacing: ".18em" }}>LIVE CANDIDATE STREAM</span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>pump.fun-origin</span>
      </div>
      <div style={{ marginTop: 14, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((c, i) => (
          <div key={c._k || c.sym} className={"lq-soft feedrow " + (i === 0 && c._k ? "cz-feedrow" : "")}>
            <StatusDot kind={c.status} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}>${c.sym}</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>{c.dormant}d · {fmtUsd(c.ath)} ATH · {fmtNum(c.replies)} replies</div>
            </div>
            <Spark data={c.spark} w={50} h={18} />
            <span className="tnum" style={{ fontSize: 15, fontWeight: 600, color: c.qual >= 75 ? "var(--green)" : "var(--dim)", width: 26, textAlign: "right" }}>{c.qual}</span>
          </div>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--green)", marginTop: 14, paddingTop: 13, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        scanning<span className="caret" />
      </div>
    </div>
  );
}

function CandidateCard({ c, onOpen }) {
  return (
    <div className="lq-glass hoverlift" style={{ padding: 18, cursor: "pointer" }} onClick={() => onOpen && onOpen(c.id)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 19, fontWeight: 600 }}>{c.name}</span>
            <span className="mono" style={{ fontSize: 13, color: "var(--green)" }}>${c.sym}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
            <SourceBadge />{c.migrated && <span className="chip lq-chip">Graduated</span>}<RiskTag level={c.risk} />
          </div>
        </div>
        <ScoreRing value={c.qual} size={56} stroke={4} label="qualify" />
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--dim)", marginTop: 13 }}>{c.blurb}</p>
      <div className="mtiles" style={{ marginTop: 14 }}>
        {[["Dormant", c.dormant + "d"], ["Replies", fmtNum(c.replies)], ["ATH", fmtUsd(c.ath)], ["Now", fmtUsd(c.mcap)]].map(([k, v]) => (
          <div key={k} className="lq-soft mtile"><div className="k">{k}</div><div className="v">{v}</div></div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 13 }}>
        {c.reasons.map((r) => <span key={r} className="chip chip-green">✓ {r}</span>)}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button className="btn btn-sm btn-outline" style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>Pump source ↗</button>
        <button className="btn btn-sm btn-solid" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); onOpen && onOpen(c.id); }}>Fund CTO bounties</button>
      </div>
    </div>
  );
}

function CatTag({ cat }) {
  const violet = ["Lore", "Research"].includes(cat);
  return (
    <span className="chip lq-chip" style={violet
      ? { color: "var(--violet)", borderColor: "rgba(155,123,255,.3)", background: "rgba(155,123,255,.07)" }
      : { color: "var(--green)", borderColor: "rgba(0,229,153,.28)", background: "rgba(0,229,153,.06)" }}>{cat}</span>
  );
}

function BountyCard({ b, onPick, picked }) {
  return (
    <div className="lq-glass hoverlift" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <CatTag cat={b.cat} />
        <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>${b.sym} · {b.deadline}</span>
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 600, margin: "13px 0 0", lineHeight: 1.25 }}>{b.title}</h3>
      <p style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 9, lineHeight: 1.5 }}>{b.desc}</p>
      <div className="lq-soft" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", padding: "13px 15px" }}>
        <div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", color: "var(--faint)" }}>REWARD</div>
          <div className="tnum" style={{ fontSize: 25, fontWeight: 600, color: "var(--green)" }}>${b.reward}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 1 }}>USDC · {b.max} winner{b.max > 1 ? "s" : ""}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span className={"dot " + (b.status === "open" ? "dot-live" : "dot-warn")} />
            <span className="mono" style={{ fontSize: 10.5, color: b.status === "open" ? "var(--green)" : "var(--amber)" }}>{b.status}</span>
          </div>
          <div className="tnum" style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>{b.subs}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>submissions</div>
        </div>
      </div>
      <button className={"btn btn-sm " + (picked ? "btn-outline" : "btn-solid")} style={{ marginTop: 13 }}
        onClick={() => onPick && onPick(b.id)}>{picked ? "✓ In your queue" : "Pick up task"}</button>
    </div>
  );
}

Object.assign(window, { Pipeline, SweepBar, LiveSweep, CandidateCard, BountyCard, CatTag });
