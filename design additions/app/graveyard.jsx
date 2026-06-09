/* CTO.fun prototype — Graveyard list + Revival detail surfaces. */

function StatusPill({ status }) {
  const s = window.CTO.STATUS[status] || { label: status, dot: "idle" };
  return <span className="statuspill"><StatusDot kind={s.dot} />{s.label}</span>;
}

function Graveyard({ go }) {
  const { graveyard, STATUS } = window.CTO;
  const order = ["newly", "review", "candidate", "vote", "selected", "active", "graduated"];
  const [tab, setTab] = React.useState("all");
  const tabs = [["all", "All"], ...order.filter((o) => graveyard.some((g) => g.status === o)).map((o) => [o, STATUS[o].label])];
  const list = tab === "all" ? graveyard : graveyard.filter((g) => g.status === tab);

  return (
    <div>
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.1} mask="head" cols={170} rows={26} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 44, paddingBottom: 8 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>GRAVEYARD · REVIVAL PIPELINE</div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 8px" }}>Every candidate, by status</h1>
          <p style={{ color: "var(--dim)", maxWidth: 540, lineHeight: 1.6 }}>From newly found to graduated. Each token carries an explicit safety signal and a weighted revival score before it ever reaches a vote.</p>
        </div>
      </section>

      <section className="section tight wrap">
        {/* status hierarchy rail */}
        <div className="lq-glass" style={{ padding: 16, marginBottom: 22 }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>Status hierarchy</div>
          <div className="pipe">
            {order.map((o, i) => (
              <React.Fragment key={o}>
                <div className="lq-soft lq-chip pipe-node" style={{ padding: "8px 13px 8px 11px" }}>
                  <StatusDot kind={STATUS[o].dot} />
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{STATUS[o].label}</span>
                </div>
                {i < order.length - 1 && <span className="pipe-link" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
          {tabs.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className="lq-chip"
              style={{ fontSize: 12.5, fontWeight: 500, padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "var(--sans)",
                border: "1px solid " + (tab === k ? "rgba(0,229,153,.4)" : "rgba(255,255,255,.1)"),
                background: tab === k ? "rgba(0,229,153,.1)" : "rgba(255,255,255,.02)",
                color: tab === k ? "var(--green)" : "var(--dim)" }}>{label}</button>
          ))}
        </div>

        <div className="grid" style={{ gap: 10 }}>
          {list.map((g) => (
            <div key={g.id + g.status} className="lq-soft hoverlift" style={{ padding: 16, cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}
              onClick={() => go("revival", g.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flexWrap: "wrap" }}>
                <ScoreRing value={g.score} size={48} stroke={4} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 17, fontWeight: 600 }}>{g.name}</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--green)" }}>${g.sym}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 3 }}>{fmtNum(g.holders)} holders · {g.dormant}d dormant · {fmtUsd(g.ath)} ATH</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <RiskTag level={g.risk} />
                <StatusPill status={g.status} />
                <span className="mono" style={{ color: "var(--dim)", fontSize: 16 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function VoteWidget({ initial }) {
  const [votes, setVotes] = React.useState(initial);
  const [cast, setCast] = React.useState(null);
  const total = votes.revive + votes.research + votes.skip;
  const vote = (k) => {
    if (cast) return;
    setVotes((v) => ({ ...v, [k]: v[k] + 1 }));
    setCast(k);
  };
  const seg = [["revive", "Revive", "var(--green)"], ["research", "Needs research", "var(--violet)"], ["skip", "Skip", "var(--faint)"]];
  return (
    <div className="lq-glass" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="eyebrow" style={{ letterSpacing: ".16em" }}>COMMUNITY VOTE</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{fmtNum(total)} cast</span>
      </div>
      <div className="votebar" style={{ marginTop: 14 }}>
        {seg.map(([k, , c]) => <span key={k} style={{ width: (votes[k] / total * 100) + "%", background: c }} />)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
        {seg.map(([k, label, c]) => (
          <button key={k} onClick={() => vote(k)} disabled={!!cast}
            className="lq-soft" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", cursor: cast ? "default" : "pointer",
              border: "1px solid " + (cast === k ? "rgba(0,229,153,.4)" : "rgba(255,255,255,.07)"),
              background: cast === k ? "rgba(0,229,153,.07)" : "rgba(255,255,255,.022)", opacity: cast && cast !== k ? 0.55 : 1, fontFamily: "var(--sans)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span className="dot" style={{ background: c }} />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>{label}</span>
              {cast === k && <span className="mono" style={{ fontSize: 10, color: "var(--green)" }}>✓ voted</span>}
            </span>
            <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600 }}>{votes[k]}</span>
          </button>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 12, lineHeight: 1.5 }}>One wallet, one vote. Votes are public and weighted by reputation at settlement.</div>
    </div>
  );
}

function Revival({ go, queue, togglePick }) {
  const r = window.CTO.revival;
  const { phases, bounties } = window.CTO;
  const phaseIdx = phases.indexOf(r.phase);
  const coinBounties = bounties.filter((b) => b.sym === r.sym);

  return (
    <div>
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.13} mask="head" cols={170} rows={28} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 36, paddingBottom: 14 }}>
          <span className="lnk mono" style={{ fontSize: 12, color: "var(--dim)", cursor: "pointer" }} onClick={() => go("graveyard")}>← Graveyard</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-.03em", margin: 0 }}>{r.name}</h1>
            <span className="mono" style={{ fontSize: 16, color: "var(--green)" }}>${r.sym}</span>
            <span className="chip chip-green lq-chip">{r.phase} phase</span>
            <SourceBadge />
          </div>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 10 }}>contract {r.contract} · not affiliated with the original developer</div>
        </div>
      </section>

      <section className="section tight wrap">
        {/* phase rail */}
        <div className="lq-glass" style={{ padding: 16, marginBottom: 18 }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>Revival phase</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {phases.map((p, i) => (
              <div key={p} style={{ flex: "1 1 auto", minWidth: 90 }}>
                <div style={{ height: 4, borderRadius: 2, background: i <= phaseIdx ? "var(--green)" : "rgba(255,255,255,.08)", boxShadow: i === phaseIdx ? "0 0 10px var(--green)" : "none" }} />
                <div className="mono" style={{ fontSize: 10, marginTop: 7, color: i === phaseIdx ? "var(--green)" : i < phaseIdx ? "var(--dim)" : "var(--faint)" }}>{p}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail">
          {/* left: score + risk + roadmap + bounties */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* risk — first class */}
            <div className="lq-glass" style={{ padding: 18, borderColor: "rgba(0,229,153,.22)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="dot dot-live" />
                <span className="eyebrow" style={{ letterSpacing: ".16em" }}>SAFETY · {r.risk.level.toUpperCase()} RISK</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.6, marginTop: 12 }}>{r.risk.note}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {["Mint renounced", "Freeze renounced", "No malicious functions"].map((t) => <span key={t} className="chip chip-green">✓ {t}</span>)}
                <span className="chip" style={{ color: "var(--amber)", borderColor: "rgba(245,181,74,.3)" }}>Liquidity thin</span>
              </div>
            </div>

            {/* score breakdown */}
            <div className="lq-glass" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ScoreRing value={r.score} size={84} stroke={6} label="revival" />
                <div>
                  <div className="eyebrow" style={{ letterSpacing: ".16em" }}>WEIGHTED REVIVAL SCORE</div>
                  <p className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 8, lineHeight: 1.5, maxWidth: 280 }}>Meme 25% · community 20% · safety 20% · liquidity 10% · lore 10% · ticker 10% · interest 5%</p>
                </div>
              </div>
              <div className="grid g2" style={{ gap: "12px 22px", marginTop: 18 }}>
                {r.breakdown.map((b) => (
                  <div key={b.k}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "var(--dim)" }}>{b.k}</span>
                      <span className="mono tnum" style={{ fontSize: 11 }}>{b.v}/10</span>
                    </div>
                    <div className="scorebar"><span style={{ width: b.v * 10 + "%" }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* roadmap */}
            <div className="lq-glass" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ letterSpacing: ".16em" }}>REBUILD ROADMAP</div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 0 }}>
                {r.roadmap.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <span className="mono" style={{ fontSize: 11, color: i < 2 ? "var(--green)" : "var(--faint)", width: 22 }}>{i < 2 ? "✓" : "0" + (i + 1)}</span>
                    <span style={{ fontSize: 13.5, color: i < 2 ? "var(--dim)" : "var(--ink)" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* funded bounties */}
            <div>
              <div className="sechead" style={{ marginBottom: 14 }}><h2 style={{ fontSize: 18 }}>Funded bounties</h2><span className="lnk" onClick={() => go("bounties")}>All →</span></div>
              <div className="grid g2">
                {coinBounties.map((b) => <BountyCard key={b.id} b={b} picked={queue.includes(b.id)} onPick={togglePick} />)}
              </div>
            </div>
          </div>

          {/* right: vote + stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <VoteWidget initial={r.votes} />
            <div className="lq-glass" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ letterSpacing: ".16em" }}>REVIVAL ACTIVITY</div>
              <div className="grid g2" style={{ gap: 12, marginTop: 14 }}>
                {[["Active bounties", r.active], ["Completed", r.done], ["Contributors", r.contributors], ["Bounty spend", fmtUsd(r.spend)]].map(([k, v]) => (
                  <div key={k} className="lq-soft" style={{ padding: "12px 14px" }}>
                    <div className="tnum" style={{ fontSize: 22, fontWeight: 600 }}>{v}</div>
                    <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)", marginTop: 3 }}>{k}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-solid" style={{ width: "100%", marginTop: 16 }} onClick={() => go("bounties")}>Fund a bounty</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { Graveyard, Revival });
