/* CTO.fun prototype — Landing surface. */

function Landing({ go, queue, togglePick }) {
  const { metrics, revival, bounties, workflow } = window.CTO;
  const paid = useCountUp(metrics.paid, 1400);
  const open = bounties.filter((b) => b.status === "open").slice(0, 3);

  return (
    <div>
      {/* hero */}
      <section className="hero lq-frame">
        <AsciiShader opacity={0.17} mask="hero" />
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow" style={{ letterSpacing: ".2em" }}>◆ PUMP.FUN-ORIGIN REVIVAL PROTOCOL</div>
            <h1>Bring dead<br />Pump.fun tokens<br /><span style={{ color: "var(--green)" }}>back to life.</span></h1>
            <p className="sub">Discover dormant launches the market forgot. Fund the takeover through bounties. Track every revival as public, on-chain proof.</p>
            <div className="hero-ctas">
              <button className="btn btn-solid" onClick={() => go("discover")}>Discover Candidates →</button>
              <button className="btn btn-outline" onClick={() => go("bounties")}>Fund Bounties</button>
              <button className="btn btn-ghost" onClick={() => go("submit")}>Submit a Token</button>
            </div>
            <div className="hero-stats">
              {[[metrics.revived, "coins revived"], [fmtUsd(paid), "bounties paid"], [fmtNum(metrics.contributors), "contributors"]].map(([v, k]) => (
                <div key={k}><div className="v tnum">{v}</div><div className="k">{k}</div></div>
              ))}
            </div>
          </div>
          <LiveSweep count={5} />
        </div>
        <div className="wrap" style={{ position: "relative", zIndex: 1, padding: "8px 28px 34px" }}>
          <Pipeline />
        </div>
      </section>

      {/* current revival */}
      <section className="section wrap">
        <div className="sechead">
          <h2>Current revival</h2>
          <span className="lnk" onClick={() => go("graveyard")}>All revivals →</span>
        </div>
        <div className="lq-glass" style={{ padding: 24 }}>
          <div className="detail">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{revival.name}</h3>
                <span className="mono" style={{ color: "var(--green)" }}>${revival.sym}</span>
                <span className="chip chip-green lq-chip">{revival.phase} phase</span>
                <RiskTag level={revival.risk.level} />
              </div>
              <p style={{ fontSize: 14, color: "var(--dim)", lineHeight: 1.6, marginTop: 14, maxWidth: 560 }}>{revival.manifesto}</p>
              <div style={{ display: "flex", gap: 28, marginTop: 20, flexWrap: "wrap" }}>
                {[["Active bounties", revival.active], ["Completed", revival.done], ["Contributors", revival.contributors], ["Bounty spend", fmtUsd(revival.spend)]].map(([k, v]) => (
                  <div className="kv" key={k}><div className="v">{v}</div><div className="k">{k}</div></div>
                ))}
              </div>
              <button className="btn btn-solid" style={{ marginTop: 22 }} onClick={() => go("revival", revival.id)}>Join the revival →</button>
            </div>
            <div className="lq-soft" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <ScoreRing value={revival.score} size={120} stroke={7} label="revival score" />
              <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", textAlign: "center", letterSpacing: ".06em" }}>weighted · meme · safety · community · liquidity · lore</div>
            </div>
          </div>
        </div>
      </section>

      {/* workflow categories */}
      <section className="section tight wrap">
        <div className="sechead">
          <h2>Bounties pay for the takeover work</h2>
          <span className="lnk" onClick={() => go("bounties")}>Open the work queue →</span>
        </div>
        <div className="flowrail">
          {workflow.map((w, i) => (
            <div key={w.k} className="lq-soft flowcell" onClick={() => go("bounties")}>
              <div className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>0{i < 9 ? i + 1 : ""}{i === 9 ? "10" : ""}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>{w.k}</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 3 }}>{w.d}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 11 }}>
                <span className="dot dot-live" />
                <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}>{w.open} open</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* active bounties */}
      <section className="section tight wrap">
        <div className="sechead">
          <h2>Active bounties</h2>
          <span className="lnk" onClick={() => go("bounties")}>All bounties →</span>
        </div>
        <div className="grid g3">
          {open.map((b) => <BountyCard key={b.id} b={b} picked={queue.includes(b.id)} onPick={togglePick} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="section wrap">
        <div className="lq-glass" style={{ position: "relative", overflow: "hidden", padding: "48px 32px", textAlign: "center" }}>
          <AsciiShader opacity={0.12} mask="panel" cols={150} rows={34} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-grid", placeItems: "center", width: 46, height: 46, borderRadius: 13, border: "1px solid rgba(0,229,153,.3)", background: "rgba(0,229,153,.08)", marginBottom: 16 }}><Mark size={24} /></div>
            <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-.02em", margin: 0 }}>Every revival is public. Every contributor earns.</h2>
            <p style={{ color: "var(--dim)", maxWidth: 520, margin: "12px auto 0", lineHeight: 1.6 }}>Submit a dormant token, fund a bounty, or pick up CTO work. The takeover runs in the open — scored, funded, and proven on-chain.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
              <button className="btn btn-solid" onClick={() => go("discover")}>Discover Candidates</button>
              <button className="btn btn-outline" onClick={() => go("bounties")}>Browse Bounties</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

window.Landing = Landing;
