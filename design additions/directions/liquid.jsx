/* DIRECTION B — LIQUID: refined glass, soft radius, restrained blur, faint glow */
const { useState: lqUseState } = React;

/* Animated ASCII geometric shader — interference of geometric fields,
   quantised to a character ramp. Sits behind the glass; the frosted
   scanner panel blurs over it for depth. Kept low-opacity + masked. */
function AsciiShader({ cols = 168, rows = 52, opacity = 0.16 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const ramp = " ·∙:-=+*▢◇◆";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf, last = 0, t = reduce ? 1.2 : 0;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 90) return;
      last = now;
      if (!reduce) t += 0.05;
      let out = "";
      for (let y = 0; y < rows; y++) {
        const ny = (y / rows) * 2 - 1;
        for (let x = 0; x < cols; x++) {
          const nx = (x / cols) * 2 - 1;
          // rotating geometric frame (diamond SDF) + radial rings + diagonal weave
          const rot = t * 0.25;
          const rx = nx * Math.cos(rot) - ny * Math.sin(rot);
          const ry = nx * Math.sin(rot) + ny * Math.cos(rot);
          const diamond = Math.abs(rx) + Math.abs(ry);
          const d = Math.sqrt(nx * nx + ny * ny);
          let v =
            Math.sin(diamond * 7 - t * 1.3) +
            Math.sin(d * 11 - t * 1.6) +
            Math.sin((nx - ny) * 6 + t) * 0.7;
          v = (v + 2.7) / 5.4; // → ~0..1
          const idx = Math.max(0, Math.min(ramp.length - 1, Math.floor(v * ramp.length)));
          out += ramp[idx];
        }
        out += "\n";
      }
      if (ref.current) ref.current.textContent = out;
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [cols, rows]);
  return (
    <pre ref={ref} aria-hidden="true" className="mono" style={{
      position: "absolute", inset: 0, margin: 0, padding: 0, overflow: "hidden",
      fontSize: 14, lineHeight: "15px", letterSpacing: 0, whiteSpace: "pre",
      color: "var(--green)", opacity, pointerEvents: "none", userSelect: "none",
      WebkitMaskImage: "linear-gradient(100deg, transparent 6%, rgba(0,0,0,.22) 32%, #000 60%), radial-gradient(120% 120% at 80% 50%, #000 55%, transparent 100%)",
      maskImage: "linear-gradient(100deg, transparent 6%, rgba(0,0,0,.22) 32%, #000 60%), radial-gradient(120% 120% at 80% 50%, #000 55%, transparent 100%)",
      WebkitMaskComposite: "source-in", maskComposite: "intersect",
    }} />
  );
}

function LqBrand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 9, border: "1px solid rgba(0,229,153,.3)", background: "rgba(0,229,153,.08)" }}>
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
          <path d="M13 6.2a4.2 4.2 0 1 0 0 7.6" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="6" y="9.2" width="8" height="1.7" rx="0.85" fill="var(--green)" />
        </svg>
      </span>
      <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-.01em" }}>CTO<span style={{ color: "var(--green)" }}>.fun</span></span>
    </div>
  );
}

function LqScanner() {
  const rows = useSweepFeed(CANDIDATES.slice(0, 5), 2800);
  const found = useCountUp(SWEEP.found, 1100);
  return (
    <div className="lq-glass" style={{ padding: 20, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span className="dot dot-live" />
          <span className="eyebrow" style={{ letterSpacing: ".18em" }}>LIVE DISCOVERY SWEEP</span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>last {SWEEP.last}</span>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {[["Found", Math.round(found)], ["Scanned", fmtNum(SWEEP.scanned)], ["Gate", "≥" + SWEEP.threshold]].map(([k, v]) => (
          <div key={k} className="lq-soft" style={{ flex: 1, padding: "11px 13px" }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--faint)" }}>{k}</div>
            <div className="tnum" style={{ fontSize: 19, fontWeight: 600, marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((c, i) => {
          const km = { vote: "live", review: "review", newly: "newly", candidate: "candidate" };
          return (
            <div key={c._k || c.sym} className={"lq-soft " + (i === 0 && c._k ? "cz-feedrow" : "")} style={{ display: "grid", gridTemplateColumns: "14px 1fr auto auto", alignItems: "center", gap: 11, padding: "10px 13px" }}>
              <StatusDot kind={km[c.status] || "idle"} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}>${c.sym}</span>
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>{c.dormant}d · {fmtUsd(c.ath)} ATH</div>
              </div>
              <Spark data={c.spark} w={50} h={18} fill />
              <span className="tnum" style={{ fontSize: 15, fontWeight: 600, color: c.qual >= 75 ? "var(--green)" : "var(--dim)", width: 26, textAlign: "right" }}>{c.qual}</span>
            </div>
          );
        })}
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--green)", marginTop: 14, paddingTop: 13, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        scanning pump.fun-origin set<span className="caret" />
      </div>
    </div>
  );
}

function LqPipeline() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {PIPELINE.map((p, i) => (
        <React.Fragment key={p.k}>
          <div className="lq-soft lq-chip" style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 15px 9px 12px" }}>
            <span className="dot" style={{ background: i < 3 ? "var(--green)" : "var(--faint)", boxShadow: i < 3 ? "0 0 8px var(--green)" : "none" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.k}</div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--faint)" }}>{p.d}</div>
            </div>
          </div>
          {i < PIPELINE.length - 1 && <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(0,229,153,.4), rgba(255,255,255,.06))" }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function LiquidHero() {
  const paid = useCountUp(68400, 1400);
  return (
    <div className="dirframe lq-frame" style={{ display: "flex", flexDirection: "column" }}>
      <AsciiShader />
      <div style={{ position: "relative", height: 64, display: "flex", alignItems: "center", gap: 30, padding: "0 36px" }}>
        <LqBrand />
        <div style={{ display: "flex", gap: 22, fontSize: 14, marginLeft: 6, color: "var(--dim)" }}>
          <span style={{ color: "var(--ink)" }}>Discover</span><span>Graveyard</span><span>Bounties</span><span>Proof</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button className="btn btn-sm btn-ghost">Submit a token</button>
          <button className="btn btn-sm btn-solid">Connect</button>
        </div>
      </div>

      <div style={{ position: "relative", flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, padding: "44px 56px 30px", alignItems: "center" }}>
        <div>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>◆ PUMP.FUN-ORIGIN REVIVAL PROTOCOL</div>
          <h1 style={{ fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 600, margin: "22px 0 0" }}>
            Bring dead<br />Pump.fun tokens<br /><span style={{ color: "var(--green)" }}>back to life.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--dim)", maxWidth: 440, marginTop: 24 }}>
            Discover dormant launches the market forgot. Fund the takeover through bounties.
            Track every revival as public, on-chain proof.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button className="btn btn-solid">Discover Candidates →</button>
            <button className="btn btn-outline">Fund Bounties</button>
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 38 }}>
            {[["14", "coins revived"], [fmtUsd(paid), "bounties paid"], ["1,240", "contributors"]].map(([v, k]) => (
              <div key={k}>
                <div className="tnum" style={{ fontSize: 24, fontWeight: 600 }}>{v}</div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)", marginTop: 4 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
        <LqScanner />
      </div>

      <div style={{ position: "relative", padding: "20px 56px 30px" }}>
        <LqPipeline />
      </div>
    </div>
  );
}

/* ---- shelf ---- */
function LiquidCandidate() {
  const c = CANDIDATES[1];
  return (
    <div className="dirframe lq-frame" style={{ padding: 18 }}>
      <div className="lq-glass" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 19, fontWeight: 600 }}>{c.name}</span>
              <span className="mono" style={{ fontSize: 13, color: "var(--green)" }}>${c.sym}</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
              <span className="srcbadge lq-chip">◆ Pump.fun-origin</span>
            </div>
          </div>
          <ScoreRing value={c.qual} size={58} stroke={4} label="qualify" />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {[["Dormant", c.dormant + "d"], ["Replies", fmtNum(c.replies)], ["ATH", fmtUsd(c.ath)], ["Now", fmtUsd(c.mcap)]].map(([k, v]) => (
            <div key={k} className="lq-soft" style={{ flex: 1, padding: "9px 10px" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)" }}>{k}</div>
              <div className="tnum" style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {c.reasons.map((r) => <span key={r} className="chip chip-green">✓ {r}</span>)}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn btn-sm btn-outline" style={{ flex: 1 }}>Pump source ↗</button>
          <button className="btn btn-sm btn-solid" style={{ flex: 1 }}>Fund CTO bounties</button>
        </div>
      </div>
    </div>
  );
}

function LiquidBounty() {
  const b = BOUNTIES[2];
  return (
    <div className="dirframe lq-frame" style={{ padding: 18 }}>
      <div className="lq-glass" style={{ padding: 18, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="chip lq-chip" style={{ color: "var(--violet)", borderColor: "rgba(155,123,255,.3)", background: "rgba(155,123,255,.07)" }}>{b.cat}</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>${b.sym} · {b.deadline}</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "14px 0 0", lineHeight: 1.25 }}>{b.title}</h3>
        <p style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 10, lineHeight: 1.5 }}>A funded takeover task. Pick it up, submit proof, get paid on approval.</p>
        <div className="lq-soft" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", padding: "14px 16px" }}>
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", color: "var(--faint)" }}>REWARD</div>
            <div className="tnum" style={{ fontSize: 26, fontWeight: 600, color: "var(--green)" }}>${b.reward}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="tnum" style={{ fontSize: 18, fontWeight: 600 }}>{b.subs}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>submissions</div>
          </div>
        </div>
        <button className="btn btn-sm btn-solid" style={{ marginTop: 14 }}>Pick up task</button>
      </div>
    </div>
  );
}

function LiquidScore() {
  const r = REVIVAL;
  return (
    <div className="dirframe lq-frame" style={{ padding: 18 }}>
      <div className="lq-glass" style={{ padding: 18, height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <ScoreRing value={r.score} size={66} stroke={5} label="revival" />
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{r.name}</div>
              <span className="chip chip-green lq-chip" style={{ marginTop: 6, display: "inline-block" }}>{r.phase} phase</span>
            </div>
          </div>
        </div>
        <div className="lq-soft" style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 16, padding: "11px 13px", borderColor: "rgba(0,229,153,.22)", background: "rgba(0,229,153,.04)" }}>
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
                <span style={{ fontSize: 11, color: "var(--dim)" }}>{b.k}</span>
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

function LiquidFilters() {
  const tabs = ["All", "Dormant", "Graduated", "Past heat", "Needs review"];
  const [on, setOn] = lqUseState(0);
  return (
    <div className="dirframe lq-frame" style={{ padding: 18 }}>
      <div className="lq-glass" style={{ padding: 16 }}>
        <div className="eyebrow" style={{ letterSpacing: ".16em", marginBottom: 12 }}>SWEEPER STATUS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["Last sweep", "14s ago"], ["Candidates", "23 found"], ["Threshold", "score ≥ 60"], ["Sources", "3 live"]].map(([k, v]) => (
            <div key={k} className="lq-soft" style={{ padding: "9px 11px" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)" }}>{k}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 16 }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setOn(i)} className="lq-chip"
              style={{ fontSize: 12, fontWeight: 500, padding: "7px 13px", borderRadius: 999, cursor: "pointer", fontFamily: "var(--sans)",
                border: "1px solid " + (on === i ? "rgba(0,229,153,.4)" : "rgba(255,255,255,.1)"),
                background: on === i ? "rgba(0,229,153,.1)" : "rgba(255,255,255,.02)",
                color: on === i ? "var(--green)" : "var(--dim)" }}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AsciiShader, LiquidHero, LiquidCandidate, LiquidBounty, LiquidScore, LiquidFilters });
