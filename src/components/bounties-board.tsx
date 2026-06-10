"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Coins, Rocket } from "lucide-react";
import { AsciiShader, fmtUsd } from "@/components/protocol-ui";
import { BountyCard, type ProtoBounty } from "@/components/protocol-blocks";

// How a team gets funded to revive a dead token. You don't pay to play —
// CTO.fun's token fees bankroll the bounty. Three plain steps, no invented numbers.
const STEPS = [
  {
    icon: Users,
    title: "Apply",
    body: "Find a dead token on Discover and pitch your team. You're proving you can run the takeover — not paying for it.",
  },
  {
    icon: Coins,
    title: "Get funded",
    body: "If you're selected, CTO.fun funds a SOL bounty on Pump.fun from token fees. The reward is set before you start.",
  },
  {
    icon: Rocket,
    title: "Deliver & earn",
    body: "Ship the revival — identity, site, community — submit proof, and the bounty SOL is yours as real startup capital.",
  },
];

export function BountiesBoard({ bounties, totalReward }: { bounties: ProtoBounty[]; totalReward: number }) {
  const [cat, setCat] = React.useState("All");
  const [queue, setQueue] = React.useState<string[]>([]);
  const [toast, setToast] = React.useState("");
  const toastT = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cats = ["All", ...Array.from(new Set(bounties.map((b) => b.cat)))];
  const list = cat === "All" ? bounties : bounties.filter((b) => b.cat === cat);
  // Real counts only: how many open bounties actually sit in each category.
  const countFor = (c: string) => (c === "All" ? bounties.length : bounties.filter((b) => b.cat === c).length);

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
    <div className="proto">
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.1} mask="head" cols={170} rows={26} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 44, paddingBottom: 8 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
            BOUNTIES · GET FUNDED TO REVIVE
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 8px" }}>
            Get funded to revive a dead token
          </h1>
          <p style={{ color: "var(--dim)", maxWidth: 580, lineHeight: 1.6 }}>
            You don&apos;t pay to play. CTO.fun&apos;s token fees bankroll a SOL bounty for every revival. Prove your
            team, deliver the takeover, and the bounty is yours.
          </p>
          <div style={{ display: "flex", gap: 28, marginTop: 22, flexWrap: "wrap" }}>
            {([
              [fmtUsd(totalReward), "open rewards"],
              [bounties.length, "open bounties"],
              [queue.length, "in your queue"],
            ] as [string | number, string][]).map(([v, k]) => (
              <div className="kv" key={k}>
                <div className="v" style={{ fontSize: 22 }}>
                  {v}
                </div>
                <div className="k">{k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How a revival works — three plain steps for holders */}
      <section className="section tight wrap">
        <div className="sechead">
          <h2>How a revival works</h2>
        </div>
        <div className="flow-steps">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="lq-soft flowstep">
                <div className="flowstep-top">
                  <span className="flowstep-num mono">Step {i + 1}</span>
                  <span className="flowstep-icon">
                    <Icon size={18} />
                  </span>
                </div>
                <div className="flowstep-title">{s.title}</div>
                <p className="flowstep-body">{s.body}</p>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20 }}>
          <Link className="btn btn-solid" href="/discover">
            Browse dead tokens to revive -&gt;
          </Link>
        </div>
      </section>

      {/* Open task bounties: honest list with real category counts */}
      <section className="section tight wrap">
        <div className="sechead">
          <h2>Open task bounties</h2>
        </div>
        {bounties.length > 0 && (
          <div className="bounty-filters">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={"bounty-chip" + (cat === c ? " on" : "")}
              >
                {c}
                <span className="bounty-chip-count">{countFor(c)}</span>
              </button>
            ))}
          </div>
        )}

        {list.length === 0 ? (
          <div className="lq-soft bounty-empty">
            <strong>No task bounties are open right now.</strong>
            <span>
              Once a team is leading a revival, granular tasks show up here. To lead one yourself, apply from a dead
              token on Discover.
            </span>
          </div>
        ) : (
          <div className="grid g3">
            {list.map((b) => (
              <BountyCard key={b.id} b={b} picked={queue.includes(b.id)} onPick={togglePick} />
            ))}
          </div>
        )}
      </section>

      <div className={"proto-toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}
