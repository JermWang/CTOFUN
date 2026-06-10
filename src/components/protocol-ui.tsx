"use client";

import * as React from "react";
import { fmtNum, fmtUsd } from "@/lib/format";

const { useState, useEffect, useRef } = React;

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

type ShaderMask = "hero" | "head" | "panel";

export function AsciiShader({
  opacity = 0.08,
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
  const [grid, setGrid] = useState({ cols, rows });

  useEffect(() => {
    const node = ref.current;
    const parent = node?.parentElement;
    if (!parent) return;

    const lineHeight = fontSize + 1;
    const charWidth = Math.max(fontSize * 0.62, 1);
    const measure = () => {
      const rect = parent.getBoundingClientRect();
      const next = {
        cols: Math.max(cols, Math.ceil(rect.width / charWidth) + 16),
        rows: Math.max(rows, Math.ceil(rect.height / lineHeight) + 6),
      };
      setGrid((prev) => (prev.cols === next.cols && prev.rows === next.rows ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [cols, rows, fontSize]);

  useEffect(() => {
    const renderCols = grid.cols;
    const renderRows = grid.rows;
    const ramp = "   ..::--==++**##";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let t = 0.35;
    // Lava-lamp drift: the field is ALWAYS in gentle motion. Reduced-motion only
    // slows the flow (it never freezes), honoring "always moving a bit".
    const speed = reduce ? 0.018 : 0.055;
    const frameMs = reduce ? 150 : 90;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < frameMs) return;
      last = now;
      t += speed;

      let out = "";
      for (let y = 0; y < renderRows; y++) {
        const ny = (y / renderRows) * 2 - 1;
        for (let x = 0; x < renderCols; x++) {
          const nx = (x / renderCols) * 2 - 1;
          const rot = t * 0.08;
          const rx = nx * Math.cos(rot) - ny * Math.sin(rot);
          const ry = nx * Math.sin(rot) + ny * Math.cos(rot);
          const diamond = Math.abs(rx * 0.88) + Math.abs(ry * 1.12);
          const d = Math.sqrt(nx * nx + ny * ny);
          let v =
            Math.sin(diamond * 5.2 - t * 0.85) * 0.78 +
            Math.sin(d * 8.5 - t * 0.7) * 0.56 +
            Math.sin((nx - ny) * 3.8 + t * 0.55) * 0.36;
          v = (v + 1.7) / 3.4;
          const i = Math.max(0, Math.min(ramp.length - 1, Math.floor(v * ramp.length)));
          out += ramp[i];
        }
        out += "\n";
      }
      if (ref.current) ref.current.textContent = out;
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [grid.cols, grid.rows]);

  const masks: Record<ShaderMask, string> = {
    hero: "linear-gradient(100deg, transparent 6%, rgba(0,0,0,.26) 32%, #000 60%), radial-gradient(120% 120% at 80% 50%, #000 55%, transparent 100%)",
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

export function Mark({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 6.2a4.2 4.2 0 1 0 0 7.6" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6" y="9.2" width="8" height="1.7" rx="0.85" fill="var(--green)" />
    </svg>
  );
}

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
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }} aria-hidden="true">
      {fill && <path d={line + ` L${w} ${h} L0 ${h} Z`} fill={color} opacity="0.12" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(14,35,27,0.12)" strokeWidth={stroke} />
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
    Low: ["var(--green)", "rgba(4, 255, 0,.32)", "rgba(4, 255, 0,.08)"],
    Med: ["var(--amber)", "rgba(196,126,23,.32)", "rgba(196,126,23,.08)"],
    High: ["var(--red)", "rgba(220,51,76,.32)", "rgba(220,51,76,.08)"],
  };
  const [color, borderColor, background] = m[level] || m.Med;
  return (
    <span className="chip lq-chip" style={{ color, borderColor, background }}>
      {level} risk
    </span>
  );
}

export function SourceBadge() {
  return <span className="srcbadge lq-chip">Pump.fun-origin</span>;
}

export function riskFromScore(score: number): "Low" | "Med" | "High" {
  return score >= 76 ? "Low" : score >= 60 ? "Med" : "High";
}
