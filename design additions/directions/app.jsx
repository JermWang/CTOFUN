/* Assembles the three directions onto the design canvas. */
const { createElement: h } = React;

function Intro() {
  const Row = ({ k, v }) => (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, padding: "11px 0", borderTop: "1px solid var(--line)" }}>
      <span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--green)" }}>{k}</span>
      <span style={{ fontSize: 13.5, color: "var(--dim)", lineHeight: 1.55 }}>{v}</span>
    </div>
  );
  return (
    <div className="dirframe cz-frame" style={{ padding: "34px 36px", height: "100%" }}>
      <div className="eyebrow">CTO.FUN · REDESIGN EXPLORATION</div>
      <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-.02em", margin: "14px 0 0" }}>Three directions for the revival command layer</h1>
      <p style={{ fontSize: 15, color: "var(--dim)", lineHeight: 1.6, marginTop: 14, maxWidth: 660 }}>
        Same product, same green, same Geist + Geist Mono — three distinct visual languages.
        Each shows the <b style={{ color: "var(--ink)" }}>landing hero with a live discovery module</b>, plus the core
        component vocabulary: candidate card, bounty card, score + risk block, and filters / vote.
        Scan them, then tell me which to build out into the full interactive 4-surface prototype.
      </p>
      <div style={{ marginTop: 20 }}>
        <Row k="Console" v="Ops terminal. Hairline rules, mono-forward, near-black, streaming sweep feed. Maximum trust + density — feels like a serious command layer." />
        <Row k="Liquid" v="Refined liquid glass. Translucent depth, soft radii, restrained blur, faint green glow. The premium, expensive read — elevates your current direction." />
        <Row k="Signal" v="Editorial. Pure black, oversized Geist, one accent per view, crisp 1px. Confident protocol brand with a live ticker." />
        <Row k="Decisions" v="Green #00E599 · violet kept only as a rare third signal (categories, vote split) · risk is first-class everywhere · 'Pump.fun-origin / not affiliated' kept tasteful." />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
        <span className="chip chip-green">Animated / streaming</span>
        <span className="chip">1440 × 860 heroes</span>
        <span className="chip">Mobile direction next</span>
        <span className="chip">Next.js + Tailwind realistic</span>
      </div>
    </div>
  );
}

function App() {
  return (
    h(DesignCanvas, null,
      h(DCSection, { id: "intro", title: "Start here", subtitle: "Assumptions + how to read this" },
        h(DCArtboard, { id: "readme", label: "Read me first", width: 760, height: 470, style: { background: "#060809", borderRadius: 6 } }, h(Intro))
      ),
      h(DCSection, { id: "console", title: "Direction A · Console", subtitle: "Ops terminal — hairlines, mono-forward, streaming sweep" },
        h(DCArtboard, { id: "cz-hero", label: "Landing hero + live sweep", width: 1440, height: 860, style: { background: "#060809", borderRadius: 6 } }, h(ConsoleHero)),
        h(DCArtboard, { id: "cz-cand", label: "Candidate card", width: 440, height: 430, style: { background: "#060809", borderRadius: 6 } }, h(ConsoleCandidate)),
        h(DCArtboard, { id: "cz-bounty", label: "Bounty card", width: 360, height: 360, style: { background: "#060809", borderRadius: 6 } }, h(ConsoleBounty)),
        h(DCArtboard, { id: "cz-score", label: "Score + risk", width: 460, height: 400, style: { background: "#060809", borderRadius: 6 } }, h(ConsoleScore)),
        h(DCArtboard, { id: "cz-filt", label: "Sweeper status + filters", width: 400, height: 360, style: { background: "#060809", borderRadius: 6 } }, h(ConsoleFilters)),
      ),
      h(DCSection, { id: "liquid", title: "Direction B · Liquid", subtitle: "Refined glass — translucent depth, soft radii, faint glow" },
        h(DCArtboard, { id: "lq-hero", label: "Landing hero + live sweep", width: 1440, height: 860, style: { background: "#080c10", borderRadius: 6 } }, h(LiquidHero)),
        h(DCArtboard, { id: "lq-cand", label: "Candidate card", width: 440, height: 440, style: { background: "#080c10", borderRadius: 6 } }, h(LiquidCandidate)),
        h(DCArtboard, { id: "lq-bounty", label: "Bounty card", width: 360, height: 380, style: { background: "#080c10", borderRadius: 6 } }, h(LiquidBounty)),
        h(DCArtboard, { id: "lq-score", label: "Score + risk", width: 460, height: 400, style: { background: "#080c10", borderRadius: 6 } }, h(LiquidScore)),
        h(DCArtboard, { id: "lq-filt", label: "Sweeper status + filters", width: 400, height: 320, style: { background: "#080c10", borderRadius: 6 } }, h(LiquidFilters)),
      ),
      h(DCSection, { id: "signal", title: "Direction C · Signal", subtitle: "Editorial — pure black, oversized type, one accent, live ticker" },
        h(DCArtboard, { id: "sg-hero", label: "Landing hero + ticker", width: 1440, height: 860, style: { background: "#000", borderRadius: 6 } }, h(SignalHero)),
        h(DCArtboard, { id: "sg-cand", label: "Candidate card", width: 440, height: 450, style: { background: "#000", borderRadius: 6 } }, h(SignalCandidate)),
        h(DCArtboard, { id: "sg-bounty", label: "Bounty card", width: 360, height: 340, style: { background: "#000", borderRadius: 6 } }, h(SignalBounty)),
        h(DCArtboard, { id: "sg-score", label: "Score + risk", width: 460, height: 380, style: { background: "#000", borderRadius: 6 } }, h(SignalScore)),
        h(DCArtboard, { id: "sg-filt", label: "Vote + filters", width: 400, height: 360, style: { background: "#000", borderRadius: 6 } }, h(SignalFilters)),
      ),
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
