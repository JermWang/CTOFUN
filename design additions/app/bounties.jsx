/* CTO.fun prototype — Bounties / CTO work queue surface. */

function Bounties({ go, queue, togglePick }) {
  const { bounties, workflow } = window.CTO;
  const [cat, setCat] = React.useState("All");
  const cats = ["All", ...Array.from(new Set(bounties.map((b) => b.cat)))];
  const list = cat === "All" ? bounties : bounties.filter((b) => b.cat === cat);
  const totalReward = bounties.reduce((s, b) => s + b.reward, 0);

  return (
    <div>
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.1} mask="head" cols={170} rows={26} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 44, paddingBottom: 8 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>BOUNTIES · CTO WORK QUEUE</div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 8px" }}>Funded takeover work, pick up a task</h1>
          <p style={{ color: "var(--dim)", maxWidth: 560, lineHeight: 1.6 }}>Every revival is rebuilt by contributors. Pick up a funded task, submit proof, get paid on approval — a 5% fee funds token buybacks.</p>
          <div style={{ display: "flex", gap: 28, marginTop: 22, flexWrap: "wrap" }}>
            {[[fmtUsd(totalReward), "open rewards"], [bounties.length, "open bounties"], [queue.length, "in your queue"]].map(([v, k]) => (
              <div className="kv" key={k}><div className="v" style={{ fontSize: 22 }}>{v}</div><div className="k">{k}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* workflow rail */}
      <section className="section tight wrap">
        <div className="sechead"><h2>The CTO workflow</h2></div>
        <div className="flowrail">
          {workflow.map((w, i) => (
            <div key={w.k} className={"lq-soft flowcell" + (cat === w.k ? " on" : "")} onClick={() => setCat(cats.includes(w.k) ? w.k : "All")}>
              <div className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>{i + 1 < 10 ? "0" + (i + 1) : i + 1}</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 6 }}>{w.k}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 3 }}>{w.d}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                <span className="dot dot-live" /><span className="mono" style={{ fontSize: 10.5, color: "var(--green)" }}>{w.open} open</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* filter chips + list */}
      <section className="section tight wrap">
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 20 }}>
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className="lq-chip"
              style={{ fontSize: 12.5, fontWeight: 500, padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "var(--sans)",
                border: "1px solid " + (cat === c ? "rgba(0,229,153,.4)" : "rgba(255,255,255,.1)"),
                background: cat === c ? "rgba(0,229,153,.1)" : "rgba(255,255,255,.02)",
                color: cat === c ? "var(--green)" : "var(--dim)" }}>{c}</button>
          ))}
        </div>
        <div className="grid g3">
          {list.map((b) => <BountyCard key={b.id} b={b} picked={queue.includes(b.id)} onPick={togglePick} />)}
        </div>
      </section>
    </div>
  );
}

window.Bounties = Bounties;
