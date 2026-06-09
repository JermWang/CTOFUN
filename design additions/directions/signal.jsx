/* DIRECTION C — SIGNAL: editorial, big type, pure black, one accent, crisp 1px */
const { useState: sgUseState } = React;

function SgBrand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M14.5 7a4.7 4.7 0 1 0 0 8" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" />
        <rect x="6.5" y="10.1" width="9" height="1.8" rx="0.9" fill="var(--green)" />
      </svg>
      <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-.01em" }}>CTO.fun</span>
    </div>
  );
}

function SgTicker() {
  // editorial live marquee of candidates
  const items = [...CANDIDATES, ...CANDIDATES];
  return (
    <div className="sg-marquee" style={{ borderTop: "1px solid rgba(255,255,255,.12)", borderBottom: "1px solid rgba(255,255,255,.12)", padding: "13px 0", whiteSpace: "nowrap" }}>
      <div className="marquee-track">
        {items.map((c, i) => {
          const km = { vote: "live", review: "review", newly: "newly", candidate: "candidate" };
          return (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 11, padding: "0 30px", borderRight: "1px solid rgba(255,255,255,.1)" }}>
              <StatusDot kind={km[c.status] || "idle"} />
              <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>${c.sym}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>{c.dormant}d dormant</span>
              <span className="mono tnum" style={{ fontSize: 12, color: "var(--dim)" }}>{fmtUsd(c.ath)} ATH</span>
              <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: c.qual >= 75 ? "var(--green)" : "var(--dim)" }}>{c.qual}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SignalHero() {
  const found = useCountUp(SWEEP.found, 1200);
  const paid = useCountUp(68400, 1500);
  return (
    <div className="dirframe sg-frame" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ height: 66, display: "flex", alignItems: "center", gap: 34, padding: "0 40px", borderBottom: "1px solid rgba(255,255,255,.12)" }}>
        <SgBrand />
        <div style={{ display: "flex", gap: 26, fontSize: 14, marginLeft: 8, color: "var(--dim)" }}>
          <span style={{ color: "var(--ink)" }}>Discover</span><span>Graveyard</span><span>Bounties</span><span>Proof</span>
        </div>
        <button className="btn btn-sm btn-solid" style={{ marginLeft: "auto" }}>Connect</button>
      </div>

      <div style={{ flex: 1, padding: "56px 40px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 40 }}>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ letterSpacing: ".22em" }}>PUMP.FUN-ORIGIN · COMMUNITY TAKEOVER PROTOCOL</div>
            <h1 className="sg-display" style={{ fontSize: 92, margin: "26px 0 0", maxWidth: 1000 }}>
              Dead coins,<br /><span style={{ color: "var(--green)" }}>revived</span> in public.
            </h1>
          </div>
          <div style={{ textAlign: "right", paddingTop: 8, flexShrink: 0 }}>
            <div className="sg-num tnum" style={{ fontSize: 58, color: "var(--green)" }}>{Math.round(found)}</div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)" }}>candidates in sweep</div>
          </div>
        </div>
        <p style={{ fontSize: 19, lineHeight: 1.55, color: "var(--dim)", maxWidth: 640, marginTop: 30 }}>
          CTO.fun discovers dormant Pump.fun launches, funds the takeover work through bounties,
          and tracks every revival as public proof. <span style={{ color: "var(--ink)" }}>Discover. Fund. Prove.</span>
        </p>
        <div style={{ display: "flex", gap: 13, marginTop: 34 }}>
          <button className="btn btn-solid">Discover Candidates →</button>
          <button className="btn btn-outline">Fund Bounties</button>
          <button className="btn btn-ghost">Submit a Token</button>
        </div>
      </div>

      {/* editorial pipeline numbered row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid rgba(255,255,255,.12)" }}>
        {PIPELINE.map((p, i) => (
          <div key={p.k} style={{ padding: "20px 24px", borderLeft: i ? "1px solid rgba(255,255,255,.12)" : "none", display: "flex", gap: 14, alignItems: "baseline" }}>
            <span className="mono tnum" style={{ fontSize: 13, color: i < 3 ? "var(--green)" : "var(--faint)" }}>0{i + 1}</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{p.k}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>{p.d}</div>
            </div>
          </div>
        ))}
      </div>
      <SgTicker />
    </div>
  );
}

/* ---- shelf ---- */
function SignalCandidate() {
  const c = CANDIDATES[3];
  return (
    <div className="dirframe sg-frame" style={{ padding: 18 }}>
      <div className="sg-card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--green)", textTransform: "uppercase" }}>◆ Pump.fun-origin</div>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.02em", marginTop: 9 }}>{c.name}</div>
            <div className="mono" style={{ fontSize: 13, color: "var(--dim)", marginTop: 2 }}>${c.sym}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="sg-num tnum" style={{ fontSize: 44, color: "var(--green)", lineHeight: 1 }}>{c.qual}</div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", color: "var(--faint)", textTransform: "uppercase" }}>qualify score</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, marginTop: 18, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.12)" }}>
          {[["Dormant", c.dormant + " days"], ["Replies", fmtNum(c.replies)], ["ATH cap", fmtUsd(c.ath)], ["Now", fmtUsd(c.mcap)]].map(([k, v]) => (
            <div key={k} style={{ background: "#050607", padding: "11px 13px" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>{k}</div>
              <div className="sg-num tnum" style={{ fontSize: 16, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
          {c.reasons.map((r) => <span key={r} className="chip">{r}</span>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.1)" }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--faint)" }}>last trade {c.last}</span>
          <button className="btn btn-sm btn-solid">Fund CTO →</button>
        </div>
      </div>
    </div>
  );
}

function SignalBounty() {
  const b = BOUNTIES[3];
  return (
    <div className="dirframe sg-frame" style={{ padding: 18 }}>
      <div className="sg-card" style={{ padding: 18, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--green)" }}>{b.cat} bounty</span>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--faint)" }}>{b.deadline}</span>
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-.02em", margin: "16px 0 0", lineHeight: 1.15 }}>{b.title}</h3>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: 22 }}>
          <div>
            <div className="sg-num tnum" style={{ fontSize: 40, color: "var(--green)", lineHeight: 1 }}>${b.reward}</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--faint)", textTransform: "uppercase", marginTop: 4 }}>USDC · {b.max} winners</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="sg-num tnum" style={{ fontSize: 24 }}>{b.subs}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>subs</div>
          </div>
        </div>
        <button className="btn btn-sm btn-outline" style={{ marginTop: 16 }}>Pick up task →</button>
      </div>
    </div>
  );
}

function SignalScore() {
  const r = REVIVAL;
  return (
    <div className="dirframe sg-frame" style={{ padding: 18 }}>
      <div className="sg-card" style={{ padding: 18, height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)" }}>Revival score · ${r.sym}</div>
            <div className="sg-num tnum" style={{ fontSize: 64, color: "var(--green)", lineHeight: 1, marginTop: 8 }}>{r.score}</div>
          </div>
          <span className="chip" style={{ color: "var(--green)", borderColor: "rgba(0,229,153,.3)" }}>{r.phase} phase</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: "11px 0", borderTop: "1px solid rgba(255,255,255,.12)", borderBottom: "1px solid rgba(255,255,255,.12)" }}>
          <span className="dot dot-live" />
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: "var(--green)" }}>SAFETY · {r.risk.level.toUpperCase()} RISK</span>
          <span style={{ fontSize: 11, color: "var(--dim)", marginLeft: "auto", textAlign: "right", maxWidth: 200, lineHeight: 1.4 }}>{r.risk.note}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginTop: 16 }}>
          {r.breakdown.map((b) => (
            <div key={b.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "var(--dim)" }}>{b.k}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div className="scorebar" style={{ width: 64 }}><span style={{ width: b.v * 10 + "%" }} /></div>
                <span className="mono tnum" style={{ fontSize: 11, width: 16, textAlign: "right" }}>{b.v}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SignalFilters() {
  const tabs = ["All", "Dormant", "Graduated", "Past heat", "Needs review"];
  const [on, setOn] = sgUseState(0);
  const votes = REVIVAL.votes;
  const total = votes.revive + votes.skip + votes.research;
  return (
    <div className="dirframe sg-frame" style={{ padding: 18 }}>
      <div className="sg-card" style={{ padding: 16 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>Community vote · ${REVIVAL.sym}</div>
        <div style={{ display: "flex", height: 8, borderRadius: 2, overflow: "hidden", gap: 2 }}>
          <span style={{ width: (votes.revive / total * 100) + "%", background: "var(--green)" }} />
          <span style={{ width: (votes.research / total * 100) + "%", background: "var(--violet)" }} />
          <span style={{ width: (votes.skip / total * 100) + "%", background: "var(--faint)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9 }}>
          {[["Revive", votes.revive, "var(--green)"], ["Research", votes.research, "var(--violet)"], ["Skip", votes.skip, "var(--faint)"]].map(([k, v, c]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="dot" style={{ background: c }} />
              <span style={{ fontSize: 11.5, color: "var(--dim)" }}>{k}</span>
              <span className="mono tnum" style={{ fontSize: 11.5, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button className="btn btn-sm btn-solid" style={{ flex: 1 }}>Vote revive</button>
          <button className="btn btn-sm btn-outline" style={{ flex: 1 }}>Skip</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.1)" }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setOn(i)} className="mono"
              style={{ fontSize: 11, letterSpacing: ".04em", padding: "6px 11px", borderRadius: 3, cursor: "pointer", textTransform: "uppercase",
                border: "1px solid " + (on === i ? "var(--green)" : "rgba(255,255,255,.14)"),
                background: on === i ? "var(--green)" : "transparent",
                color: on === i ? "#04130b" : "var(--dim)", fontWeight: on === i ? 600 : 400 }}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SignalHero, SignalCandidate, SignalBounty, SignalScore, SignalFilters });
