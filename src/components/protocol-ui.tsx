"use client";

// ============================================================================
// CTO.fun — UI kit. Faithful port of the Claude "Liquid" prototype primitives
// (design additions/app/ui.jsx): hooks, formatters, animated ASCII shader,
// mark, sparkline, count-up score ring, status dots, risk + source badges.
// ============================================================================

import * as React from "react";
import { fmtNum, fmtUsd } from "@/lib/format";

const { useState, useEffect, useRef } = React;

// Re-export for client consumers that already import these from here.
export { fmtNum, fmtUsd };

export function useCountUp(target: number, ms = 1200): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start: number | undefined;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / ms);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export interface SweepCandidate {
  sym: string;
  name: string;
  dormant: number;
  ath: number;
  replies: number;
  qual: number;
  status: string;
  spark: number[];
  _k?: number;
}

export function useSweepFeed(data: SweepCandidate[], count = 5, interval = 2700): SweepCandidate[] {
  const seed = data.slice(0, count);
  const [rows, setRows] = useState<SweepCandidate[]>(seed);
  const idx = useRef(0);
  useEffect(() => {
    if (data.length === 0) return;
    const id = setInterval(() => {
      idx.current = (idx.current + 1) % data.length;
      const next = data[idx.current];
      setRows((r) => [{ ...next, _k: Date.now() }, ...r.slice(0, count - 1)]);
    }, interval);
    return () => clearInterval(id);
  }, [data, count, interval]);
  return rows;
}

/* ----- ASCII geometric shader ----- */
type ShaderMask = "hero" | "head" | "panel";

export function AsciiShader({
  opacity = 0.16,
  mask = "hero",
  cols = 168,
  rows = 52,
  fontSize = 14,
}: {
  opacity?: number;
  mask?: ShaderMask;
  cols?: number;
  rows?: number;
  fontSize?: number;
}) {
  const ref = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const ramp = " ·∙:-=+*▢◇◆";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let t = reduce ? 1.2 : 0;
    const draw = (now: number) => {
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
          let v =
            Math.sin(diamond * 7 - t * 1.3) +
            Math.sin(d * 11 - t * 1.6) +
            Math.sin((nx - ny) * 6 + t) * 0.7;
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

  const masks: Record<ShaderMask, string> = {
    hero: "linear-gradient(100deg, transparent 6%, rgba(0,0,0,.22) 32%, #000 60%), radial-gradient(120% 120% at 80% 50%, #000 55%, transparent 100%)",
    head: "linear-gradient(180deg, #000 0%, transparent 92%), radial-gradient(90% 130% at 86% 0%, #000 30%, transparent 80%)",
    panel: "radial-gradient(100% 100% at 100% 0%, #000 0%, transparent 72%)",
  };

  return (
    <pre
      ref={ref}
      aria-hidden="true"
      className="mono"
      style={{
        position: "absolute",
        inset: 0,
        margin: 0,
        padding: 0,
        overflow: "hidden",
        fontSize,
        lineHeight: fontSize + 1 + "px",
        letterSpacing: 0,
        whiteSpace: "pre",
        color: "var(--green)",
        opacity,
        pointerEvents: "none",
        userSelect: "none",
        WebkitMaskImage: masks[mask],
        maskImage: masks[mask],
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
      }}
    />
  );
}

/* ----- mark ----- */
export function Mark({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M13 6.2a4.2 4.2 0 1 0 0 7.6" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6" y="9.2" width="8" height="1.7" rx="0.85" fill="var(--green)" />
    </svg>
  );
}

/* ----- sparkline ----- */
export function Spark({
  data,
  w = 56,
  h = 18,
  fill = true,
  color = "var(--green)",
}: {
  data: number[];
  w?: number;
  h?: number;
  fill?: boolean;
  color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
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
export function ScoreRing({
  value,
  size = 64,
  stroke = 5,
  label,
  color = "var(--green)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = useCountUp(value, 1100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="mono tnum" style={{ fontSize: size * 0.3, fontWeight: 600 }}>
          {Math.round(v)}
        </span>
        {label && (
          <span
            className="mono"
            style={{ fontSize: 8, letterSpacing: ".12em", color: "var(--faint)", textTransform: "uppercase" }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/** Animated count-up number (client). */
export function CountUp({ value, kind = "num", ms = 1400 }: { value: number; kind?: "num" | "raw"; ms?: number }) {
  const v = useCountUp(value, ms);
  return <>{kind === "num" ? fmtNum(Math.round(v)) : Math.round(v)}</>;
}

export function StatusDot({ kind = "idle" }: { kind?: string }) {
  const map: Record<string, string> = {
    live: "dot-live",
    vote: "dot-live",
    active: "dot-live",
    selected: "dot-live",
    graduated: "dot-live",
    warn: "dot-warn",
    review: "dot-warn",
    candidate: "dot-warn",
    risk: "dot-risk",
    idle: "dot-idle",
    newly: "dot-idle",
  };
  return <span className={"dot " + (map[kind] || "dot-idle")} />;
}

export function RiskTag({ level }: { level: string }) {
  const m: Record<string, [string, string, string]> = {
    Low: ["var(--green)", "rgba(0,229,153,.28)", "rgba(0,229,153,.06)"],
    Med: ["var(--amber)", "rgba(245,181,74,.3)", "rgba(245,181,74,.07)"],
    High: ["var(--red)", "rgba(255,93,108,.32)", "rgba(255,93,108,.08)"],
  };
  const [color, borderColor, background] = m[level] || m.Med;
  return (
    <span className="chip lq-chip" style={{ color, borderColor, background }}>
      {level} risk
    </span>
  );
}

export function SourceBadge() {
  return <span className="srcbadge lq-chip">◆ Pump.fun-origin</span>;
}

/** Map a numeric qualification/revival score to the prototype risk band. */
export function riskFromScore(score: number): "Low" | "Med" | "High" {
  return score >= 76 ? "Low" : score >= 60 ? "Med" : "High";
}
