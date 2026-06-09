/* CTO.fun prototype — Proof of Revival dashboard surface. */

function FeeFlow() {
  const steps = [
    { k: "Completed bounty", d: "Contributor paid", c: "var(--dim)" },
    { k: "5% protocol fee", d: "Routed to treasury", c: "var(--violet)" },
    { k: "Token buyback", d: "Open-market buy", c: "var(--green)" },
    { k: "Burn / recycle", d: "Supply reduced", c: "var(--green)" },
  ];
  return (
    <div className="pipe">
      {steps.map((s, i) => (
        <React.Fragment key={s.k}>
          <div className="lq-soft lq-chip pipe-node" style={{ padding: "10px 16px 10px 13px" }}>
            <span className="dot" style={{ background: s.c, boxShadow: s.c !== "var(--dim)" ? "0 0 8px " + s.c : "none" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.k}</div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--faint)" }}>{s.d}</div>
            </div>
          </div>
          {i < steps.length - 1 && <span className="pipe-link" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Proof({ go }) {
  const { proof, metrics, hall } = window.CTO;
  const bought = useCountUp(proof.tokenBought, 1400);
  const burned = useCountUp(proof.tokenBurned, 1400);
  const burnPct = Math.round((proof.tokenBurned / proof.tokenBought) * 100);

  return (
    <div>
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.13} mask="head" cols={170} rows={28} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 44, paddingBottom: 12 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>PROOF OF REVIVAL · PUBLIC LEDGER</div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 8px" }}>Every fee, buyback, and burn — on the record</h1>
          <p style={{ color: "var(--dim)", maxWidth: 580, lineHeight: 1.6 }}>A 5% fee on completed bounties funds open-market token buybacks. Revivals that reach a living community graduate to the Hall. Nothing is private.</p>
        </div>
      </section>

      {/* headline metrics */}
      <section className="section tight wrap">
        <div className="grid g4">
          {[[fmtUsd(proof.feesCollected), "fees collected", "var(--ink)"], [fmtNum(Math.round(bought)), "tokens bought back", "var(--green)"], [fmtNum(Math.round(burned)), "tokens burned", "var(--green)"], [metrics.revived, "coins graduated", "var(--ink)"]].map(([v, k, c]) => (
            <div key={k} className="lq-glass" style={{ padding: 20 }}>
              <div className="tnum" style={{ fontSize: 28, fontWeight: 600, color: c }}>{v}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)", marginTop: 6 }}>{k}</div>
            </div>
          ))}
        </div>
      </section>

      {/* fee flow */}
      <section className="section tight wrap">
        <div className="sechead"><h2>How fees become buybacks</h2></div>
        <div className="lq-glass" style={{ padding: 20 }}><FeeFlow /></div>
      </section>

      {/* buyback ledger + burn ratio */}
      <section className="section tight wrap">
        <div className="detail">
          <div className="lq-glass" style={{ padding: 4, backdropFilter: "none", WebkitBackdropFilter: "none", background: "rgba(12,17,22,0.9)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
              <span className="eyebrow" style={{ letterSpacing: ".16em" }}>BUYBACK LEDGER</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>last 5 · live</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px 8px" }}>
              <span className="mono" style={{ flex: "1 1 auto", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>Source</span>
              <span className="mono" style={{ width: 50, textAlign: "right", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>Fee</span>
              <span className="mono" style={{ width: 70, textAlign: "right", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>Tokens</span>
              <span className="mono" style={{ width: 76, textAlign: "right", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}>Status</span>
            </div>
            {proof.buybacks.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.source}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>{b.date} · {b.tx}</div>
                </div>
                <span className="mono tnum" style={{ width: 50, textAlign: "right", fontSize: 12.5 }}>{fmtUsd(b.fee)}</span>
                <span className="mono tnum" style={{ width: 70, textAlign: "right", fontSize: 12.5, color: "var(--green)" }}>{fmtNum(b.tokens)}</span>
                <span style={{ width: 76, display: "flex", justifyContent: "flex-end" }}>
                  <span className="chip lq-chip" style={{ fontSize: 9.5, padding: "3px 8px", color: b.status === "burned" ? "var(--green)" : "var(--violet)", borderColor: b.status === "burned" ? "rgba(0,229,153,.28)" : "rgba(155,123,255,.3)", background: b.status === "burned" ? "rgba(0,229,153,.06)" : "rgba(155,123,255,.07)" }}>{b.status}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="lq-glass" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span className="eyebrow" style={{ letterSpacing: ".16em", alignSelf: "flex-start" }}>BURN RATIO</span>
            <ScoreRing value={burnPct} size={130} stroke={8} label="burned" />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              {[["Bought back", proof.tokenBought, "var(--green)"], ["Burned", proof.tokenBurned, "var(--green)"], ["Recycled", proof.tokenRecycled, "var(--violet)"]].map(([k, v, c]) => (
                <div key={k} className="lq-soft" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--dim)" }}><span className="dot" style={{ background: c }} />{k}</span>
                  <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600 }}>{fmtNum(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hall of Revival */}
      <section className="section tight wrap">
        <div className="sechead"><h2>Hall of Revival</h2><span className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>{hall.length} graduated</span></div>
        <div className="grid g3">
          {hall.map((g) => (
            <div key={g.id} className="lq-glass hoverlift" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 600 }}>{g.name}</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--green)" }}>${g.sym}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 4 }}>graduated {g.graduated}</div>
                </div>
                <span className="chip chip-green lq-chip">★ Graduated</span>
              </div>
              {/* before → after */}
              <div className="lq-soft" style={{ padding: 14, marginTop: 14 }}>
                {[["Holders", g.before.holders, g.after.holders], ["Telegram", g.before.telegram, g.after.telegram]].map(([k, b, a]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".06em" }}>{k}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="mono tnum" style={{ fontSize: 12, color: "var(--faint)" }}>{fmtNum(b)}</span>
                      <span className="mono" style={{ color: "var(--green)" }}>→</span>
                      <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>{fmtNum(a)}</span>
                    </span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".06em" }}>Website</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--faint)" }}>{g.before.site}</span>
                    <span className="mono" style={{ color: "var(--green)" }}>→</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>{g.after.site}</span>
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
                {[["Contributors", g.contributors], ["Bounties", g.bounties], ["Spend", fmtUsd(g.spend)]].map(([k, v]) => (
                  <div className="kv" key={k}><div className="v" style={{ fontSize: 15 }}>{v}</div><div className="k">{k}</div></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

window.Proof = Proof;
