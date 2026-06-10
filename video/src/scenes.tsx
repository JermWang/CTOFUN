import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_MONO, FONT_SANS } from "./theme";
import { BrandBackground, Dot, Eyebrow, PipelineFooter, SoftCard, useEntrance } from "./components";

const CONTENT_PAD = 150;

// Shared layout: brand bg + left-aligned content block + optional pipeline.
const Stage: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <AbsoluteFill style={{ fontFamily: FONT_SANS }}>
    <BrandBackground dark={dark} />
    <AbsoluteFill style={{ padding: `120px ${CONTENT_PAD}px`, justifyContent: "center" }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

const Headline: React.FC<{ children: React.ReactNode; delay?: number; color?: string; size?: number }> = ({
  children,
  delay = 4,
  color = COLORS.ink,
  size = 92,
}) => {
  const e = useEntrance(delay);
  return (
    <h1
      style={{
        fontFamily: FONT_SANS,
        fontSize: size,
        fontWeight: 600,
        lineHeight: 1.05,
        letterSpacing: "-0.025em",
        color,
        margin: "22px 0 0",
        maxWidth: 1300,
        opacity: e,
        transform: `translateY(${interpolate(e, [0, 1], [26, 0])}px)`,
      }}
    >
      {children}
    </h1>
  );
};

const Sub: React.FC<{ children: React.ReactNode; delay?: number; color?: string }> = ({
  children,
  delay = 12,
  color = COLORS.dim,
}) => {
  const e = useEntrance(delay);
  return (
    <p
      style={{
        fontFamily: FONT_SANS,
        fontSize: 36,
        lineHeight: 1.5,
        color,
        margin: "26px 0 0",
        maxWidth: 1080,
        opacity: e,
        transform: `translateY(${interpolate(e, [0, 1], [18, 0])}px)`,
      }}
    >
      {children}
    </p>
  );
};

// ---------------------------------------------------------------------------
// 1 · Brand open
// ---------------------------------------------------------------------------
export const IntroScene: React.FC = () => {
  const mark = useEntrance(0, 180);
  const word = useEntrance(12);
  const tag = useEntrance(26);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_SANS }}>
      <BrandBackground />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile("skull-logo.png")}
          style={{
            width: 240,
            height: 240,
            objectFit: "contain",
            transform: `scale(${interpolate(mark, [0, 1], [0.7, 1])})`,
            opacity: mark,
          }}
        />
        <Img
          src={staticFile("text-logo.png")}
          style={{
            width: 520,
            objectFit: "contain",
            marginTop: 24,
            opacity: word,
            transform: `translateY(${interpolate(word, [0, 1], [20, 0])}px)`,
          }}
        />
        <div
          style={{
            marginTop: 30,
            fontSize: 38,
            fontWeight: 500,
            color: COLORS.dim,
            opacity: tag,
            transform: `translateY(${interpolate(tag, [0, 1], [16, 0])}px)`,
          }}
        >
          Bring dead Pump.fun tokens{" "}
          <span style={{ color: COLORS.green }}>back to life.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 2 · The problem
// ---------------------------------------------------------------------------
export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tiles = new Array(40).fill(0);
  return (
    <Stage>
      <AbsoluteFill style={{ opacity: 0.5 }}>
        <div
          style={{
            position: "absolute",
            inset: "80px 120px",
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 22,
            alignContent: "center",
          }}
        >
          {tiles.map((_, i) => {
            const die = interpolate(frame, [10 + (i % 8) * 4, 46 + (i % 8) * 4], [1, 0.12], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  height: 64,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.line2}`,
                  background: "rgba(255,255,255,0.6)",
                  opacity: die,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "relative" }}>
        <Eyebrow color={COLORS.red}>THE PROBLEM</Eyebrow>
        <Headline>
          Thousands of Pump.fun
          <br />
          tokens die every week.
        </Headline>
        <Sub>Real communities, real art, real holders — abandoned the moment the chart went quiet.</Sub>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------------------
// Reusable step scene
// ---------------------------------------------------------------------------
const StepScene: React.FC<{
  index: number;
  eyebrow: string;
  headline: React.ReactNode;
  sub: React.ReactNode;
  visual: React.ReactNode;
}> = ({ index, eyebrow, headline, sub, visual }) => {
  return (
    <Stage>
      <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
        <div style={{ flex: 1 }}>
          <Eyebrow>{`STEP 0${index + 1} · ${eyebrow}`}</Eyebrow>
          <Headline size={80}>{headline}</Headline>
          <Sub>{sub}</Sub>
        </div>
        <div style={{ flex: "0 0 560px", display: "flex", justifyContent: "center" }}>{visual}</div>
      </div>
      <PipelineFooter active={index} appear={6} />
    </Stage>
  );
};

// Staggered list rows — each component calls the entrance hook at top level
// (never inside a loop) so we stay within the rules of hooks.
const ApplyRow: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const re = useEntrance(delay);
  return (
    <div
      style={{
        marginTop: 18,
        padding: "20px 22px",
        borderRadius: 14,
        border: `1px solid ${COLORS.line2}`,
        background: COLORS.bg2,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: re,
        transform: `translateX(${interpolate(re, [0, 1], [24, 0])}px)`,
      }}
    >
      <Dot />
      <span style={{ fontSize: 26, color: COLORS.ink, fontWeight: 500 }}>{label}</span>
    </div>
  );
};

const DeliverRow: React.FC<{ label: string; delay: number; first: boolean }> = ({ label, delay, first }) => {
  const re = useEntrance(delay);
  return (
    <div
      style={{
        marginTop: first ? 0 : 16,
        padding: "20px 22px",
        borderRadius: 14,
        border: `1px solid rgba(0,191,122,0.28)`,
        background: "rgba(0,191,122,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: re,
      }}
    >
      <span style={{ color: COLORS.green, fontSize: 30 }}>✓</span>
      <span style={{ fontSize: 26, color: COLORS.ink, fontWeight: 500 }}>{label}</span>
    </div>
  );
};

// 3 · Discover — a real-looking discover card.
export const DiscoverScene: React.FC = () => {
  const e = useEntrance(14, 160);
  return (
    <StepScene
      index={0}
      eyebrow="DISCOVER"
      headline={
        <>
          We surface the dead
          <br />
          ones worth saving.
        </>
      }
      sub="A daily on-chain sweep scores real Pump.fun tokens by community, lost market cap, and revival potential."
      visual={
        <SoftCard
          style={{
            width: 460,
            padding: 0,
            overflow: "hidden",
            opacity: e,
            transform: `translateY(${interpolate(e, [0, 1], [30, 0])}px)`,
          }}
        >
          <div style={{ height: 210, position: "relative" }}>
            <Img
              src={staticFile("gog.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                fontFamily: FONT_MONO,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "6px 12px",
                borderRadius: 999,
                background: COLORS.white,
                color: COLORS.greenDim,
                border: `1px solid rgba(4,255,0,0.4)`,
              }}
            >
              PUMP.FUN
            </div>
          </div>
          <div style={{ padding: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.ink }}>gog</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.ink }}>$31k</div>
            </div>
            <div style={{ fontSize: 22, color: COLORS.dim, marginTop: 4 }}>$gog</div>
            <div style={{ display: "flex", gap: 22, marginTop: 22 }}>
              {[
                ["ATH", "$128k"],
                ["Off ATH", "4x"],
                ["Replies", "148"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.faint }}>{k}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.ink, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </SoftCard>
      }
    />
  );
};

// 4 · Apply — a team applies to lead.
export const ApplyScene: React.FC = () => {
  const e = useEntrance(14, 160);
  const rows = ["Your team", "Why you'll win", "Proof of past work"];
  return (
    <StepScene
      index={1}
      eyebrow="APPLY"
      headline={
        <>
          Bring a team. Apply
          <br />
          to lead the revival.
        </>
      }
      sub="You don't need to be the original dev — just prove you can run the takeover. Pitch your crew and get vetted."
      visual={
        <SoftCard style={{ width: 460, padding: 30, opacity: e, transform: `translateY(${interpolate(e, [0, 1], [30, 0])}px)` }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 16, letterSpacing: "0.16em", color: COLORS.faint, textTransform: "uppercase" }}>
            Revival application
          </div>
          {rows.map((label, i) => (
            <ApplyRow key={label} label={label} delay={22 + i * 8} />
          ))}
        </SoftCard>
      }
    />
  );
};

// 5 · Get funded — the SOL bounty from fees.
export const FundedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = useEntrance(14, 160);
  const amount = Math.round(interpolate(frame, [Math.round(0.6 * fps), Math.round(2.2 * fps)], [0, 25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  return (
    <StepScene
      index={2}
      eyebrow="GET FUNDED"
      headline={
        <>
          We fund the bounty
          <br />
          in SOL. You don&apos;t pay.
        </>
      }
      sub="CTO.fun's own token fees bankroll a bounty on Pump.fun. The reward is locked in before you start."
      visual={
        <SoftCard
          style={{
            width: 460,
            padding: 40,
            textAlign: "center",
            opacity: e,
            transform: `scale(${interpolate(e, [0, 1], [0.92, 1])})`,
          }}
        >
          <div style={{ fontFamily: FONT_MONO, fontSize: 16, letterSpacing: "0.16em", color: COLORS.faint, textTransform: "uppercase" }}>
            Revival bounty
          </div>
          <div style={{ fontSize: 120, fontWeight: 700, color: COLORS.green, marginTop: 14, lineHeight: 1, fontFamily: FONT_SANS }}>
            {amount}
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color: COLORS.ink, marginTop: 2 }}>SOL</div>
          <div
            style={{
              marginTop: 26,
              padding: "14px 18px",
              borderRadius: 999,
              background: "rgba(0,191,122,0.08)",
              border: "1px solid rgba(0,191,122,0.28)",
              color: COLORS.greenDim,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Funded by token fees
          </div>
        </SoftCard>
      }
    />
  );
};

// 6 · Deliver & earn.
export const DeliverScene: React.FC = () => {
  const e = useEntrance(14, 160);
  const items = ["New identity & art", "Site + socials relaunched", "Community back online"];
  return (
    <StepScene
      index={3}
      eyebrow="DELIVER & EARN"
      headline={
        <>
          Ship the takeover.
          <br />
          Earn the bounty.
        </>
      }
      sub="Rebuild the token in public, submit proof, and the SOL is yours — real startup capital to run it right."
      visual={
        <SoftCard style={{ width: 460, padding: 30, opacity: e, transform: `translateY(${interpolate(e, [0, 1], [30, 0])}px)` }}>
          {items.map((label, i) => (
            <DeliverRow key={label} label={label} delay={20 + i * 9} first={i === 0} />
          ))}
        </SoftCard>
      }
    />
  );
};

// 7 · Proof + CTA (dark close).
export const ProofScene: React.FC = () => {
  const word = useEntrance(8, 180);
  const line = useEntrance(20);
  const cta = useEntrance(34);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_SANS }}>
      <BrandBackground dark />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: 120 }}>
        <Img
          src={staticFile("white-text-logo.png")}
          style={{
            width: 560,
            objectFit: "contain",
            opacity: word,
            transform: `translateY(${interpolate(word, [0, 1], [20, 0])}px)`,
          }}
        />
        <div
          style={{
            marginTop: 30,
            fontSize: 46,
            fontWeight: 500,
            color: "#dCEbe3",
            opacity: line,
            transform: `translateY(${interpolate(line, [0, 1], [18, 0])}px)`,
          }}
        >
          Every revival — <span style={{ color: COLORS.green }}>public, on-chain proof.</span>
        </div>
        <div
          style={{
            marginTop: 46,
            padding: "22px 44px",
            borderRadius: 999,
            background: COLORS.green,
            color: COLORS.greenDeep,
            fontSize: 34,
            fontWeight: 700,
            boxShadow: "0 0 60px -12px rgba(0,191,122,0.8)",
            opacity: cta,
            transform: `scale(${interpolate(cta, [0, 1], [0.9, 1])})`,
          }}
        >
          Start at ctoit.fun
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
