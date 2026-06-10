import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_MONO, FONT_SANS, PIPELINE } from "./theme";

// A calm spring entrance (0 -> 1), matching the site's soft "Liquid" easing.
export function useEntrance(delay = 0, damping = 200) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.7 }, durationInFrames: 22 });
}

// On-brand light background: faint mono grid + a soft green corner glow.
export const BrandBackground: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const base = dark ? COLORS.greenDeep : COLORS.bg;
  const gridColor = dark ? "rgba(0,191,122,0.06)" : "rgba(12,23,18,0.035)";
  const glow = dark ? "rgba(0,191,122,0.20)" : "rgba(0,191,122,0.12)";
  return (
    <AbsoluteFill style={{ backgroundColor: base }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(720px 520px at 12% 0%, ${glow}, transparent 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(680px 480px at 100% 100%, rgba(118,92,255,0.10), transparent 62%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Small uppercase mono eyebrow, exactly like the site's .eyebrow.
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color = COLORS.green,
  delay = 0,
}) => {
  const e = useEntrance(delay);
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 26,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        opacity: e,
        transform: `translateY(${interpolate(e, [0, 1], [12, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};

// A live status dot (the site's .dot-live).
export const Dot: React.FC<{ color?: string; size?: number }> = ({ color = COLORS.green, size = 12 }) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: 999,
      background: color,
      boxShadow: `0 0 14px ${color}`,
    }}
  />
);

// The persistent footer pipeline (Discover -> Apply -> Bounty -> Revive),
// highlighting the active stage. Mirrors the home-page Pipeline block.
export const PipelineFooter: React.FC<{ active: number; appear?: number }> = ({ active, appear = 0 }) => {
  const e = useEntrance(appear);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 72,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 16,
        opacity: e,
      }}
    >
      {PIPELINE.map((label, i) => {
        const on = i <= active;
        const current = i === active;
        return (
          <React.Fragment key={label}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 22px",
                borderRadius: 16,
                border: `1px solid ${current ? "rgba(0,191,122,0.45)" : COLORS.line2}`,
                background: current ? "rgba(0,191,122,0.08)" : "rgba(255,255,255,0.62)",
                transition: "all 0.2s",
              }}
            >
              <Dot color={on ? COLORS.green : COLORS.faint} size={11} />
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 22,
                  fontWeight: 600,
                  color: on ? COLORS.ink : COLORS.faint,
                }}
              >
                {label}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div style={{ alignSelf: "center", width: 26, height: 2, background: i < active ? COLORS.green : COLORS.line2 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// A soft card matching .lq-soft / .lq-glass.
export const SoftCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      borderRadius: 22,
      border: `1px solid ${COLORS.line2}`,
      background: "rgba(255,255,255,0.72)",
      boxShadow: "0 40px 90px -70px rgba(0,74,46,0.4)",
      ...style,
    }}
  >
    {children}
  </div>
);
