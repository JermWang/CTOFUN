/* DIRECTION A — CONSOLE: ops terminal, hairlines, mono-forward, near-black */
const { useState: czUseState } = React;

function CzBrand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="1.5" y="1.5" width="17" height="17" rx="2" stroke="var(--green)" strokeWidth="1.3" />
        <path d="M13 6.2a4.2 4.2 0 1 0 0 7.6" stroke="var(--green)" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="6" y="9.2" width="8" height="1.6" rx="0.8" fill="var(--green)" />
      </svg>
      <span className="mono" style={{ fontSize: 14, fontWeight: 600, letterSpacing: ".02em" }}>
        CTO<span style={{ color: "var(--green)" }}>.fun</span>
      </span>
    </div>
  );
}

function CzFeedRow({ c, fresh }) {
  const km = { vote: "live", review: "review", newly: "newly", candidate: "candidate" };
  return (
    <div className={"cz-row " + (fresh ? "cz-feedrow" : "")} style={{ display: "grid", gridTemplateColumns: "16px 78px 1fr 64px 52px 30px", alignItems: "center", gap: 10, padding: "9px 14px" }}>
      <StatusDot kind={km[c.status] || "idle"} />
      <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>${c.sym}</span>
      <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>{c.dormant}d dormant · {fmtNum(c.replies)} replies</span>
      <span className="mono tnum" style={{ fontSize: 11, color: "var(--dim)", textAlign: "right" }}>{fmtUsd(c.ath)}</span>
      <div style={{ justifySelf: "end" }}><Spark data={c.spark} w={48} h={16} /></div>
      <span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 600, color: c.qual >= 75 ? "var(--green)" : "var(--dim)", textAlign: "right" }}>{c.qual}</span>
    </div>
  );
}

function CzScanner() {
  const rows = useSweepFeed(CANDIDATES.slice(0, 6));
  const found = useCountUp(SWEEP.found, 1000);
  return (
    <div className="cz-panel" style={{ borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="cz-bar" style={{ justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="dot dot-live" /><span style={{ color: "var(--ink)", letterSpacing: ".14em", fontSize: 11 }}>DISCOVERY SWEEP</span>
        </span>
        <span style={{ fontSize: 11 }}>last {SWEEP.last}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderBottom: "1px solid var(--line)" }}>
        {[["found", Math.round(found)], ["scanned", fmtNum(SWEEP.scanned)], ["threshold", "≥" + SWEEP.threshold]].map(([k, v], i) => (
          <div key={k} style={{ padding: "11px 14px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)" }}>{k}</div>
            <div className="mono tnum" style={{ fontSize: 17, fontWeight: 600, marginTop: 3, color: "var(--ink)" }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="cz-bar" style={{ height: 30, fontSize: 10, color: "var(--faint)", borderBottom: "1px solid var(--line)" }}>
        <span style={{ display: "grid", gridTemplateColumns: "16px 78px 1fr 64px 52px 30px", gap: 10, width: "100%", letterSpacing: ".1em" }}>
          <span /><span>TICKER</span><span>SIGNAL</span><span style={{ textAlign: "right" }}>ATH CAP</span><span style={{ textAlign: "right" }}>30D</span><span style={{ textAlign: "right" }}>SCR</span>
        </span>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {rows.map((c, i) => <CzFeedRow key={c._k || c.sym} c={c} fresh={i === 0 && c._k} />)}
      </div>
      <div className="cz-bar" style={{ borderTop: "1px solid var(--line)", borderBottom: "none", fontSize: 11, color: "var(--green)" }}>
        scanning pump.fun-origin set<span className="caret" />
      </div>
    </div>
  );
}

function CzPipeline() {
  return (
    <div className="cz-pipe" style={{ display: "flex", justifyContent: "space-between", padding: "0 4px", marginTop: 4 }}>
      <div className="pipe-line" /><div className="pipe-pulse" />
      {PIPELINE.map((p, i) => (
        <div key={p.k} className="cz-node" style={{ textAlign: i === 0 ? "left" : i === PIPELINE.length - 1 ? "right" : "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: i === 0 ? "flex-start" : i === PIPELINE.length - 1 ? "flex-end" : "center" }}>
            <span className="dot" style={{ background: i < 3 ? "var(--green)" : "var(--faint)" }} />
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{p.k}</span>
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 3 }}>{p.d}</div>
        </div>
      ))}
    </div>
  );
}

function ConsoleHero() {
  const paid = useCountUp(68400, 1400);
  const revived = useCountUp(14, 1400);
  return (
    <div className="dirframe cz-frame grid-bg" style={{ display: "flex", flexDirection: "column" }}>
      {/* command bar */}
      <div style={{ height: 52, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 28, padding: "0 28px", background: "#070a0c" }}>
        <CzBrand />
        <div className="mono" style={{ display: "flex", gap: 20, fontSize: 12.5, marginLeft: 8 }}>
          <span style={{ color: "var(--ink)" }}>Discover</span>
          <span style={{ color: "var(--dim)" }}>Graveyard</span>
          <span style={{ color: "var(--dim)" }}>Bounties</span>
          <span style={{ color: "var(--dim)" }}>Proof</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>23 candidates · sweep 14s</span>
          <button className="btn btn-sm btn-solid">Connect</button>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 44, padding: "52px 56px 36px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
          <div className="eyebrow">SWEEP/01 · PUMP.FUN-ORIGIN · NOT AFFILIATED</div>
          <h1 style={{ fontSize: 52, lineHeight: 1.04, letterSpacing: "-0.025em", fontWeight: 600, margin: "20px 0 0" }}>
            Discover dead<br />Pump.fun tokens.<br />
            <span style={{ color: "var(--green)" }}>Fund</span> the takeover.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--dim)", maxWidth: 460, marginTop: 22 }}>
            A command layer for meme-coin revival. CTO.fun scores dormant launches,
            funds the takeover work through bounties, and tracks every revival as public proof.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            <button className="btn btn-solid">Discover Candidates →</button>
            <button className="btn btn-outline">Fund Bounties</button>
            <button className="btn btn-ghost">Submit Token</button>
          </div>
          <div style={{ display: "flex", gap: 0, marginTop: 38, borderTop: "1px solid var(--line)" }}>
            {[["coins revived", Math.round(revived)], ["bounties paid", fmtUsd(paid)], ["contributors", "1,240"]].map(([k, v], i) => (
              <div key={k} style={{ flex: 1, padding: "16px 16px 0 0", borderRight: i < 2 ? "1px solid var(--line)" : "none", paddingLeft: i ? 20 : 0 }}>
                <div className="mono tnum" style={{ fontSize: 22, fontWeight: 600 }}>{v}</div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--faint)", marginTop: 4 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
        <CzScanner />
      </div>

      {/* pipeline footer */}
      <div style={{ borderTop: "1px solid var(--line)", padding: "22px 56px 26px", background: "#070a0c" }}>
        <CzPipeline />
      </div>
    </div>
  );
}

/* ---- component shelf ---- */
function ConsoleCandidate() {
  const c = CANDIDATES[0];
  return (
    <div className="dirframe cz-frame" style={{ padding: 18 }}>
      <div className="cz-panel" style={{ borderRadius: 4, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>{c.name}</span>
              <span className="mono" style={{ fontSize: 13, color: "var(--green)" }}>${c.sym}</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <span className="srcbadge">◆ Pump.fun-origin</span>
              {c.migrated && <span className="chip">Graduated</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--faint)" }}>QUALIFY</div>
            <div className="mono tnum" style={{ fontSize: 30, fontWeight: 600, color: "var(--green)", lineHeight: 1 }}>{c.qual}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginTop: 16, border: "1px solid var(--line)", borderRadius: 3 }}>
          {[["Dormant", c.dormant + "d"], ["Replies", fmtNum(c.replies)], ["ATH cap", fmtUsd(c.ath)], ["Now", fmtUsd(c.mcap)]].map(([k, v], i) => (
            <div key={k} style={{ padding: "9px 11px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>{k}</div>
              <div className="mono tnum" style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {c.reasons.map((r) => <span key={r} className="chip chip-green">✓ {r}</span>)}
        </div>
        <div className="cz-row" style={{ marginTop: 14, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--faint)" }}>last trade {c.last} · Rugz4kP2…UvWx</span>
          <div style={{ display: "flex", gap: 7 }}>
            <button className="btn btn-sm btn-outline">Source ↗</button>
            <button className="btn btn-sm btn-solid">Fund CTO</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsoleBounty() {
  const b = BOUNTIES[0];
  return (
    <div className="dirframe cz-frame" style={{ padding: 18 }}>
      <div className="cz-panel" style={{ borderRadius: 4, padding: 16, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="chip" style={{ color: "var(--violet)", borderColor: "rgba(155,123,255,.3)", background: "rgba(155,123,255,.06)" }}>{b.cat}</span>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--dim)" }}>${b.sym} · {b.deadline}</span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 600, margin: "14px 0 0", lineHeight: 1.25 }}>{b.title}</h3>
        <p className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 10, lineHeight: 1.5 }}>Funded CTO task · open to contributors · paid on approval.</p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--faint)" }}>REWARD</div>
            <div className="mono tnum" style={{ fontSize: 26, fontWeight: 600, color: "var(--green)" }}>${b.reward}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>USDC · {b.max} winner{b.max > 1 ? "s" : ""}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono tnum" style={{ fontSize: 18, fontWeight: 600 }}>{b.subs}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>submissions</div>
          </div>
        </div>
        <button className="btn btn-sm btn-solid" style={{ marginTop: 14, width: "100%" }}>Pick up task</button>
      </div>
    </div>
  );
}

function ConsoleScore() {
  const r = REVIVAL;
  return (
    <div className="dirframe cz-frame" style={{ padding: 18 }}>
      <div className="cz-panel" style={{ borderRadius: 4, padding: 16, height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--faint)" }}>REVIVAL SCORE · {r.sym}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span className="mono tnum" style={{ fontSize: 38, fontWeight: 600, color: "var(--green)", lineHeight: 1 }}>{r.score}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>/100</span>
            </div>
          </div>
          <span className="chip chip-green">{r.phase} phase</span>
        </div>
        {/* risk first-class */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "10px 12px", border: "1px solid rgba(0,229,153,.22)", borderRadius: 3, background: "rgba(0,229,153,.04)" }}>
          <span className="dot dot-live" />
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--green)" }}>SAFETY · {r.risk.level.toUpperCase()} RISK</div>
            <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 3, lineHeight: 1.4 }}>{r.risk.note}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", marginTop: 16 }}>
          {r.breakdown.map((b) => (
            <div key={b.k}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--dim)", letterSpacing: ".06em" }}>{b.k}</span>
                <span className="mono tnum" style={{ fontSize: 10, color: "var(--ink)" }}>{b.v}/10</span>
              </div>
              <div className="scorebar"><span style={{ width: b.v * 10 + "%" }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConsoleFilters() {
  const tabs = ["All", "Dormant", "Graduated", "Past heat", "Needs review"];
  const [on, setOn] = czUseState(0);
  return (
    <div className="dirframe cz-frame" style={{ padding: 18 }}>
      <div className="cz-panel" style={{ borderRadius: 4, padding: 14 }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--faint)", marginBottom: 10 }}>SWEEPER STATUS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["Last sweep", "14s ago"], ["Candidates", "23 found"], ["Threshold", "score ≥ 60"], ["Sources", "3 live"]].map(([k, v]) => (
            <div key={k} style={{ padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 3 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>{k}</div>
              <div className="mono" style={{ fontSize: 12, fontWeight: 600, marginTop: 3, color: "var(--ink)" }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--faint)", margin: "16px 0 9px" }}>FILTERS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setOn(i)} className="mono"
              style={{ fontSize: 11.5, padding: "6px 11px", borderRadius: 3, cursor: "pointer",
                border: "1px solid " + (on === i ? "rgba(0,229,153,.4)" : "var(--line)"),
                background: on === i ? "rgba(0,229,153,.08)" : "transparent",
                color: on === i ? "var(--green)" : "var(--dim)" }}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ConsoleHero, ConsoleCandidate, ConsoleBounty, ConsoleScore, ConsoleFilters });
