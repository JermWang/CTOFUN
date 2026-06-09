"use client";

// ============================================================================
// CTO.fun — composite blocks. Faithful port of the Claude "Liquid" prototype
// (design additions/app/components.jsx + graveyard.jsx): pipeline, sweep bar,
// live candidate stream, candidate + bounty cards, category/status tags, the
// community vote widget, and an interactive bounty grid with work-queue toast.
// ============================================================================

import * as React from "react";
import Link from "next/link";
import {
  AsciiShader,
  fmtNum,
  fmtUsd,
  RiskTag,
  SourceBadge,
  Spark,
  StatusDot,
  useCountUp,
  useSweepFeed,
  type SweepCandidate,
} from "@/components/protocol-ui";

/* ----------------------------------------------------------------- Pipeline */
export function Pipeline() {
  const P = [
    { k: "Dormant", d: "Pump.fun-origin", on: true },
    { k: "Review", d: "Holder-gated", on: true },
    { k: "Bounties", d: "Funded CTO work", on: true },
    { k: "Proof", d: "Public revival", on: false },
  ];
  return (
    <div className="pipe">
      {P.map((p, i) => (
        <React.Fragment key={p.k}>
          <div className="lq-soft lq-chip pipe-node">
            <span
              className="dot"
              style={{
                background: p.on ? "var(--green)" : "var(--faint)",
                boxShadow: p.on ? "0 0 8px var(--green)" : "none",
              }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.k}</div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--faint)" }}>
                {p.d}
              </div>
            </div>
          </div>
          {i < P.length - 1 && <span className="pipe-link" />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Sweep bar */
export interface SweepInfo {
  last: string;
  found: number;
  threshold: number;
  scanned: number;
  sources: string[];
}

export function SweepBar({ sweep }: { sweep: SweepInfo }) {
  const found = useCountUp(sweep.found, 1000);
  return (
    <div className="lq-glass" style={{ padding: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="dot dot-live" />
          <span className="eyebrow" style={{ letterSpacing: ".18em" }}>
            Recent finds
          </span>
          <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>
            · last {sweep.last}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {([
            ["found", Math.round(found)],
            ["checked", fmtNum(sweep.scanned)],
            ["review", "qualified"],
          ] as [string, string | number][]).map(([k, v]) => (
            <div key={k} className="lq-soft" style={{ padding: "8px 13px" }}>
              <span
                className="mono"
                style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}
              >
                {k}{" "}
              </span>
              <span className="tnum" style={{ fontSize: 13, fontWeight: 600, marginLeft: 4 }}>
                {v}
              </span>
            </div>
          ))}
          <div className="lq-soft" style={{ padding: "8px 13px", display: "flex", alignItems: "center", gap: 7 }}>
            <span
              className="mono"
              style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)" }}
            >
              sources
            </span>
            {sweep.sources.map((src) => (
              <span key={src} className="mono" style={{ fontSize: 10.5, color: "var(--dim)" }}>
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Live sweep */
export function LiveSweep({ data, count = 5 }: { data: SweepCandidate[]; count?: number }) {
  const rows = useSweepFeed(data, count);
  return (
    <div className="lq-glass" style={{ padding: 18, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span className="dot dot-live" />
          <span className="eyebrow" style={{ letterSpacing: ".18em" }}>
            LIVE CANDIDATE STREAM
          </span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>
          pump.fun-origin
        </span>
      </div>
      <div style={{ marginTop: 14, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((c, i) => (
          <div key={c._k || c.sym} className={"lq-soft feedrow " + (i === 0 && c._k ? "feed-in" : "")}>
            <StatusDot kind={c.status} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}>
                  ${c.sym}
                </span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>
                {c.dormant}d · {fmtUsd(c.ath)} ATH · {fmtNum(c.replies)} replies
              </div>
            </div>
            <Spark data={c.spark} w={50} h={18} />
            <span className="statuspill">
              <StatusDot kind={c.status} />
              {c.status}
            </span>
          </div>
        ))}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--green)",
          marginTop: 14,
          paddingTop: 13,
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        scanning<span className="caret" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Candidate card */
export interface ProtoCandidate {
  id: string;
  sym: string;
  name: string;
  qual: number;
  migrated: boolean;
  risk: string;
  blurb: string;
  dormant: number;
  replies: number;
  ath: number | null;
  mcap: number;
  imageUrl?: string;
  chartUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  createdAt?: string;
  liquidityUsd?: number | null;
  volume24hUsd?: number | null;
  historicalVolumeUsd?: number | null;
  categories?: string[];
  categoryConfidence?: number;
  discoverySignals?: string[];
  reasons: string[];
  pumpUrl?: string;
}

export function CandidateCard({ c, href }: { c: ProtoCandidate; href: string }) {
  return (
    <div className="lq-glass hoverlift" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 19, fontWeight: 600 }}>{c.name}</span>
            <span className="mono" style={{ fontSize: 13, color: "var(--green)" }}>
              ${c.sym}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
            <SourceBadge />
            {c.migrated && <span className="chip lq-chip">Graduated</span>}
            <RiskTag level={c.risk} />
          </div>
        </div>
        <span className="statuspill">
          <StatusDot kind={c.qual >= 80 ? "vote" : c.qual >= 70 ? "candidate" : "review"} />
          Review
        </span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--dim)", marginTop: 13 }}>{c.blurb}</p>
      <div className="mtiles" style={{ marginTop: 14 }}>
        {([
          ["Dormant", c.dormant + "d"],
          ["Replies", fmtNum(c.replies)],
          ["ATH", fmtUsd(c.ath)],
          ["Now", fmtUsd(c.mcap)],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} className="lq-soft mtile">
            <div className="k">{k}</div>
            <div className="v">{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 13 }}>
        {c.reasons.map((r) => (
          <span key={r} className="chip chip-green">
            ✓ {r}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <a className="btn btn-sm btn-outline" style={{ flex: 1 }} href={c.pumpUrl || "#"} target="_blank" rel="noreferrer">
          Pump source ↗
        </a>
        <Link className="btn btn-sm btn-solid" style={{ flex: 1 }} href={href}>
          Fund CTO bounties
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Cat tag */
export function CatTag({ cat }: { cat: string }) {
  const violet = ["Lore", "Research"].includes(cat);
  return (
    <span
      className="chip lq-chip"
      style={
        violet
          ? { color: "var(--violet)", borderColor: "rgba(155,123,255,.3)", background: "rgba(155,123,255,.07)" }
          : { color: "var(--green)", borderColor: "rgba(0,229,153,.28)", background: "rgba(0,229,153,.06)" }
      }
    >
      {cat}
    </span>
  );
}

/* ------------------------------------------------------------- Bounty card */
export interface ProtoBounty {
  id: string;
  sym: string;
  title: string;
  cat: string;
  reward: number;
  subs: number;
  max: number;
  status: string; // "open" | "in review"
  deadline: string;
  desc: string;
}

export function BountyCard({
  b,
  picked,
  onPick,
}: {
  b: ProtoBounty;
  picked: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <div className="lq-glass hoverlift" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <CatTag cat={b.cat} />
        <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>
          ${b.sym} · {b.deadline}
        </span>
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 600, margin: "13px 0 0", lineHeight: 1.25 }}>{b.title}</h3>
      <p style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 9, lineHeight: 1.5 }}>{b.desc}</p>
      <div
        className="lq-soft"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", padding: "13px 15px" }}
      >
        <div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", color: "var(--faint)" }}>
            REWARD
          </div>
          <div className="tnum" style={{ fontSize: 25, fontWeight: 600, color: "var(--green)" }}>
            ${b.reward}
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)", marginTop: 1 }}>
            USDC · {b.max} winner{b.max > 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span className={"dot " + (b.status === "open" ? "dot-live" : "dot-warn")} />
            <span className="mono" style={{ fontSize: 10.5, color: b.status === "open" ? "var(--green)" : "var(--amber)" }}>
              {b.status}
            </span>
          </div>
          <div className="tnum" style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>
            {b.subs}
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
            submissions
          </div>
        </div>
      </div>
      <button
        className={"btn btn-sm " + (picked ? "btn-outline" : "btn-solid")}
        style={{ marginTop: 13 }}
        onClick={() => onPick(b.id)}
      >
        {picked ? "✓ In your queue" : "Pick up task"}
      </button>
    </div>
  );
}

/* ------------------------------------------ Interactive bounty grid + toast */
export function BountyGrid({ bounties, columns = 3 }: { bounties: ProtoBounty[]; columns?: 2 | 3 }) {
  const [queue, setQueue] = React.useState<string[]>([]);
  const [toast, setToast] = React.useState("");
  const toastT = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePick = (id: string) => {
    setQueue((q) => {
      const has = q.includes(id);
      flash(has ? "Removed from your work queue" : "Added to your work queue");
      return has ? q.filter((x) => x !== id) : [...q, id];
    });
  };
  const flash = (msg: string) => {
    setToast(msg);
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(""), 2200);
  };

  return (
    <>
      <div className={"grid g" + columns}>
        {bounties.map((b) => (
          <BountyCard key={b.id} b={b} picked={queue.includes(b.id)} onPick={togglePick} />
        ))}
      </div>
      <div className={"proto-toast" + (toast ? " show" : "")}>{toast}</div>
    </>
  );
}

/* -------------------------------------------------------------- Status pill */
export const STATUS_MAP: Record<string, { label: string; dot: string }> = {
  newly: { label: "Newly Found", dot: "idle" },
  review: { label: "Under Review", dot: "warn" },
  candidate: { label: "Candidate", dot: "warn" },
  vote: { label: "Up For Vote", dot: "live" },
  selected: { label: "Selected", dot: "live" },
  active: { label: "Active CTO", dot: "live" },
  graduated: { label: "Graduated", dot: "live" },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, dot: "idle" };
  return (
    <span className="statuspill">
      <StatusDot kind={s.dot} />
      {s.label}
    </span>
  );
}

/* -------------------------------------------------------------- Vote widget */
export function VoteWidget({ initial }: { initial: { revive: number; research: number; skip: number } }) {
  const [votes, setVotes] = React.useState(initial);
  const [cast, setCast] = React.useState<string | null>(null);
  const total = votes.revive + votes.research + votes.skip;
  const vote = (k: "revive" | "research" | "skip") => {
    if (cast) return;
    setVotes((v) => ({ ...v, [k]: v[k] + 1 }));
    setCast(k);
  };
  const seg: [keyof typeof votes, string, string][] = [
    ["revive", "Revive", "var(--green)"],
    ["research", "Needs research", "var(--violet)"],
    ["skip", "Skip", "var(--faint)"],
  ];
  return (
    <div className="lq-glass" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="eyebrow" style={{ letterSpacing: ".16em" }}>
          COMMUNITY VOTE
        </span>
        <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>
          {fmtNum(total)} cast
        </span>
      </div>
      <div className="votebar" style={{ marginTop: 14 }}>
        {seg.map(([k, , c]) => (
          <span key={k} style={{ width: (votes[k] / total) * 100 + "%", background: c }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
        {seg.map(([k, label, c]) => (
          <button
            key={k}
            onClick={() => vote(k)}
            disabled={!!cast}
            className="lq-soft"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 14px",
              cursor: cast ? "default" : "pointer",
              border: "1px solid " + (cast === k ? "rgba(0,229,153,.4)" : "rgba(255,255,255,.07)"),
              background: cast === k ? "rgba(0,229,153,.07)" : "rgba(255,255,255,.022)",
              opacity: cast && cast !== k ? 0.55 : 1,
              fontFamily: "var(--sans)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span className="dot" style={{ background: c }} />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>{label}</span>
              {cast === k && (
                <span className="mono" style={{ fontSize: 10, color: "var(--green)" }}>
                  ✓ voted
                </span>
              )}
            </span>
            <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600 }}>
              {votes[k]}
            </span>
          </button>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 12, lineHeight: 1.5 }}>
        One wallet, one vote. Votes are public, with reputation checks applied at settlement.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ CTA panel hero */
export function CtaPanel() {
  return (
    <div className="lq-glass" style={{ position: "relative", overflow: "hidden", padding: "48px 32px", textAlign: "center" }}>
      <AsciiShader opacity={0.12} mask="panel" cols={150} rows={34} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: 46,
            height: 46,
            borderRadius: 13,
            border: "1px solid rgba(0,229,153,.3)",
            background: "rgba(0,229,153,.08)",
            marginBottom: 16,
          }}
        >
          <MarkInline />
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-.02em", margin: 0 }}>
          Every revival is public. Every contributor earns.
        </h2>
        <p style={{ color: "var(--dim)", maxWidth: 520, margin: "12px auto 0", lineHeight: 1.6 }}>
          Submit a dormant token, fund a bounty, or pick up CTO work. The takeover runs in the open: requested,
          reviewed, funded, and proven on-chain.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
          <Link className="btn btn-solid" href="/discover">
            Discover Candidates
          </Link>
          <Link className="btn btn-outline" href="/bounties">
            Browse Bounties
          </Link>
        </div>
      </div>
    </div>
  );
}

function MarkInline() {
  return (
    <svg width={24} height={24} viewBox="0 0 20 20" fill="none">
      <path d="M13 6.2a4.2 4.2 0 1 0 0 7.6" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6" y="9.2" width="8" height="1.7" rx="0.85" fill="var(--green)" />
    </svg>
  );
}
