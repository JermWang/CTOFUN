/* CTO.fun prototype — UI kit: hooks, primitives, ASCII shader. */

const { useState, useEffect, useRef } = React;

const fmtUsd = (n) => {
  if (n == null) return "—";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + "k";
  return "$" + n;
};
const fmtNum = (n) => new Intl.NumberFormat("en").format(n);

function useCountUp(target, ms = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / ms);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function useSweepFeed(seed, interval = 2700) {
  const data = window.CTO.candidates;
  const [rows, setRows] = useState(seed);
  const idx = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      idx.current = (idx.current + 1) % data.length;
      const next = data[idx.current];
      setRows((r) => [{ ...next, _k: Date.now() }, ...r.slice(0, seed.length - 1)]);
    }, interval);
    return () => clearInterval(id);
  }, []);
  return rows;
}

/* ----- ASCII geometric shader ----- */
function AsciiShader({ opacity = 0.16, mask = "hero", cols = 168, rows = 52, fontSize = 14 }) {
  const ref = useRef(null);
  useEffect(() => {
    const ramp = " ·∙:-=+*▢◇◆";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf, last = 0, t = reduce ? 1.2 : 0;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 95) return;
      last = now;
      if (!reduce) t += 0.05;
      let out = "";
      for (let y = 0; y < rows; y++) {
        const ny = (y / rows) * 2 - 1;
        for (let x = 0; x < cols; x++) {
          const nx = (x / cols) * 2 - 1;
          const rot = t * 0.25;
          const rx = nx * Math.cos(rot) - ny * Math.sin(rot);
          const ry = nx * Math.sin(rot) + ny * Math.cos(rot);
          const diamond = Math.abs(rx) + Math.abs(ry);
          const d = Math.sqrt(nx * nx + ny * ny);
          let v = Math.sin(diamond * 7 - t * 1.3) + Math.sin(d * 11 - t * 1.6) + Math.sin((nx - ny) * 6 + t) * 0.7;
          v = (v + 2.7) / 5.4;
          const i = Math.max(0, Math.min(ramp.length - 1, Math.floor(v * ramp.length)));
          out += ramp[i];
        }
        out += "\n";
      }
      if (ref.current) ref.current.textContent = out;
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [cols, rows]);
  const masks = {
    hero: "linear-gradient(100deg, transparent 6%, rgba(0,0,0,.22) 32%, #000 60%), radial-gradient(120% 120% at 80% 50%, #000 55%, transparent 100%)",
    head: "linear-gradient(180deg, #000 0%, transparent 92%), radial-gradient(90% 130% at 86% 0%, #000 30%, transparent 80%)",
    panel: "radial-gradient(100% 100% at 100% 0%, #000 0%, transparent 72%)",
  };
  return (
    <pre ref={ref} aria-hidden="true" className="mono" style={{
      position: "absolute", inset: 0, margin: 0, padding: 0, overflow: "hidden",
      fontSize, lineHeight: (fontSize + 1) + "px", letterSpacing: 0, whiteSpace: "pre",
      color: "var(--green)", opacity, pointerEvents: "none", userSelect: "none",
      WebkitMaskImage: masks[mask], maskImage: masks[mask],
      WebkitMaskComposite: "source-in", maskComposite: "intersect",
    }} />
  );
}

/* ----- mark ----- */
function Mark({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M13 6.2a4.2 4.2 0 1 0 0 7.6" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6" y="9.2" width="8" height="1.7" rx="0.85" fill="var(--green)" />
    </svg>
  );
}

/* ----- sparkline ----- */
function Spark({ data, w = 56, h = 18, fill = true, color = "var(--green)" }) {
  const max = Math.max(...data), min = Math.min(...data), rng = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / rng) * (h - 3) - 1.5]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {fill && <path d={line + ` L${w} ${h} L0 ${h} Z`} fill={color} opacity="0.12" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ----- score ring ----- */
function ScoreRing({ value, size = 64, stroke = 5, label, color = "var(--green)" }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const v = useCountUp(value, 1100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="mono tnum" style={{ fontSize: size * 0.3, fontWeight: 600 }}>{Math.round(v)}</span>
        {label && <span className="mono" style={{ fontSize: 8, letterSpacing: ".12em", color: "var(--faint)", textTransform: "uppercase" }}>{label}</span>}
      </div>
    </div>
  );
}

function StatusDot({ kind = "idle" }) {
  const map = { live: "dot-live", vote: "dot-live", active: "dot-live", selected: "dot-live", graduated: "dot-live", warn: "dot-warn", review: "dot-warn", candidate: "dot-warn", risk: "dot-risk", idle: "dot-idle", newly: "dot-idle" };
  return <span className={"dot " + (map[kind] || "dot-idle")} />;
}

function RiskTag({ level }) {
  const m = { Low: ["var(--green)", "rgba(0,229,153,.28)", "rgba(0,229,153,.06)"], Med: ["var(--amber)", "rgba(245,181,74,.3)", "rgba(245,181,74,.07)"], High: ["var(--red)", "rgba(255,93,108,.32)", "rgba(255,93,108,.08)"] };
  const [c, b, bg] = m[level] || m.Med;
  return <span className="chip lq-chip" style={{ color: c, borderColor: b, background: bg }}>{level} risk</span>;
}

function SourceBadge() {
  return <span className="srcbadge lq-chip">◆ Pump.fun-origin</span>;
}

Object.assign(window, { fmtUsd, fmtNum, useCountUp, useSweepFeed, AsciiShader, Mark, Spark, ScoreRing, StatusDot, RiskTag, SourceBadge });
