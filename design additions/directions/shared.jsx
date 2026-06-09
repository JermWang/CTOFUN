/* Shared mock data, hooks, and tiny primitives for all three directions.
   Exports everything to window so each direction file can use it. */

const { useState, useEffect, useRef } = React;

// ---------------------------------------------------------------- format
const fmtUsd = (n) => {
  if (n == null) return "—";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + "k";
  return "$" + n;
};
const fmtNum = (n) => new Intl.NumberFormat("en").format(n);

// ---------------------------------------------------------------- data
const CANDIDATES = [
  { sym: "RUGZ", name: "Rugzilla", dormant: 248, replies: 412, ath: 1_800_000, mcap: 41_200, last: "Oct 02", qual: 86, migrated: true, status: "vote",
    reasons: ["Mint renounced", "2.1k holders live", "Strong kaiju lore"], spark: [38,52,45,68,84,40,22,18,24] },
  { sym: "GPEPE", name: "Ghost Pepe", dormant: 96, replies: 188, ath: 640_000, mcap: 18_700, last: "Aug 19", qual: 74, migrated: false, status: "review",
    reasons: ["Clean contract", "Loyal Telegram", "Unused angle"], spark: [20,30,48,40,28,18,14,16,12] },
  { sym: "DCB", name: "Dead Cat Bounce", dormant: 180, replies: 503, ath: 2_100_000, mcap: 6_300, last: "Nov 21", qual: 62, migrated: true, status: "review",
    reasons: ["Self-aware meme", "High ATH cap", "Needs new LP"], spark: [60,72,55,30,18,10,8,12,9] },
  { sym: "WLIVE", name: "Wojak Lives", dormant: 64, replies: 920, ath: 3_400_000, mcap: 92_000, last: "Sep 01", qual: 78, migrated: true, status: "newly",
    reasons: ["5.1k holders", "Telegram alive", "Leaderless"], spark: [44,66,80,72,60,52,48,55,58] },
  { sym: "LAZ", name: "Lazaroo", dormant: 268, replies: 240, ath: 410_000, mcap: 12_400, last: "Sep 14", qual: 72, migrated: false, status: "candidate",
    reasons: ["On-theme lore", "Safe contract", "No identity yet"], spark: [30,40,52,44,30,20,16,14,18] },
  { sym: "FOMOF", name: "Fomo Frog", dormant: 142, replies: 661, ath: 980_000, mcap: 28_900, last: "Oct 28", qual: 81, migrated: true, status: "candidate",
    reasons: ["Proven comeback", "Active scouts", "Clean LP"], spark: [50,58,46,38,30,42,55,62,70] },
];

const SWEEP = {
  last: "14s ago",
  found: 23,
  threshold: 60,
  scanned: 1_842,
  sources: ["Pump.fun", "DexScreener", "On-chain"],
};

const BOUNTIES = [
  { sym: "RUGZ", title: "Redesign the Rugzilla mascot", cat: "Design", reward: 250, subs: 3, max: 1, status: "open", deadline: "6d left" },
  { sym: "RUGZ", title: "Write the RUGZ CTO manifesto", cat: "Lore", reward: 80, subs: 6, max: 1, status: "in review", deadline: "2d left" },
  { sym: "RUGZ", title: "Stand up & moderate Telegram", cat: "Social", reward: 120, subs: 4, max: 2, status: "open", deadline: "4d left" },
  { sym: "—", title: "Scout 10 dead Pump.fun tokens", cat: "Scout", reward: 150, subs: 9, max: 3, status: "open", deadline: "9d left" },
];

const WORKFLOW = ["Scout", "Research", "Audit", "Lore", "Design", "Website", "Social", "Moderation", "Outreach", "Proof"];

const REVIVAL = {
  sym: "RUGZ", name: "Rugzilla", score: 79, phase: "Rebuild",
  contract: "Rugz4kP2…StUvWx",
  risk: { level: "Low", note: "Mint + freeze authority renounced. No malicious functions found. Liquidity thin but present." },
  breakdown: [
    { k: "Meme", v: 9 }, { k: "Community", v: 7 }, { k: "Safety", v: 8 },
    { k: "Liquidity", v: 5 }, { k: "Lore", v: 9 }, { k: "Ticker", v: 8 },
  ],
  votes: { revive: 312, skip: 44, research: 61 },
  bountySpend: 2840, active: 5, done: 11, contributors: 27,
};

const PIPELINE = [
  { k: "Dormant", d: "Pump.fun-origin" },
  { k: "Review", d: "Scored & gated" },
  { k: "Bounties", d: "Funded CTO work" },
  { k: "Proof", d: "Public revival" },
];

const PHASES = ["Discovery", "Review", "Vote", "Setup", "Rebuild", "Relaunch", "Growth", "Graduation"];

// ---------------------------------------------------------------- hooks
function useCountUp(target, ms = 1200, deps = []) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setV(target * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, deps); // eslint-disable-line
  return v;
}

// streaming feed — rotates candidates through, prepending a new "hit"
function useSweepFeed(seed, interval = 2600) {
  const [rows, setRows] = useState(seed);
  const idx = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      idx.current = (idx.current + 1) % CANDIDATES.length;
      const next = CANDIDATES[idx.current];
      setRows((r) => [{ ...next, _k: Date.now() }, ...r.slice(0, seed.length - 1)]);
    }, interval);
    return () => clearInterval(id);
  }, []); // eslint-disable-line
  return rows;
}

// ---------------------------------------------------------------- primitives
function Spark({ data, w = 64, h = 20, color = "var(--green)", fill = false }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / rng) * (h - 3) - 1.5]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScoreRing({ value, size = 72, stroke = 5, color = "var(--green)", label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = useCountUp(value, 1100);
  const off = c - (v / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="mono tnum" style={{ fontSize: size * 0.30, fontWeight: 600, color: "var(--ink)" }}>{Math.round(v)}</span>
        {label && <span className="mono" style={{ fontSize: 8, letterSpacing: ".12em", color: "var(--faint)", textTransform: "uppercase" }}>{label}</span>}
      </div>
    </div>
  );
}

function StatusDot({ kind = "live" }) {
  const map = { live: "dot-live", vote: "dot-live", warn: "dot-warn", review: "dot-warn", risk: "dot-risk", idle: "dot-idle", newly: "dot-idle", candidate: "dot-warn" };
  return <span className={"dot " + (map[kind] || "dot-idle")} />;
}

Object.assign(window, {
  fmtUsd, fmtNum, CANDIDATES, SWEEP, BOUNTIES, WORKFLOW, REVIVAL, PIPELINE, PHASES,
  useCountUp, useSweepFeed, Spark, ScoreRing, StatusDot,
});
