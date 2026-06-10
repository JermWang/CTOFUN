"use client";

import * as React from "react";
import { DiscoverCoinCard } from "@/components/discover-board";
import type { ProtoCandidate } from "@/components/protocol-blocks";

const VISIBLE_TOKENS = 5;
const AUTO_SPIN_MS = 5200;
// Trackpads emit dozens of small wheel deltas per gesture; accumulate until a
// threshold so one swipe advances exactly one card.
const WHEEL_THRESHOLD = 90;
const WHEEL_COOLDOWN_MS = 420;
const DRAG_THRESHOLD_PX = 48;

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export function SplashTokenCarousel({ tokens }: { tokens: ProtoCandidate[] }) {
  const cards = tokens.slice(0, VISIBLE_TOKENS);
  const cardCount = cards.length;
  const [rotation, setRotation] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const wheelAccum = React.useRef(0);
  const lastSpinAt = React.useRef(0);
  const dragX = React.useRef<number | null>(null);
  const dragAccum = React.useRef(0);
  const dragSpun = React.useRef(false);

  const angle = cardCount ? 360 / cardCount : 0;
  const active = cardCount ? wrapIndex(Math.round(-rotation / angle), cardCount) : 0;

  const spin = React.useCallback(
    (direction: number) => {
      if (!angle) return;
      setRotation((value) => value + direction * angle);
    },
    [angle],
  );

  // React registers wheel listeners as passive, so preventDefault() inside
  // onWheel is a no-op that logs errors. Attach a native non-passive listener.
  React.useEffect(() => {
    const node = wheelRef.current;
    if (!node || !angle) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const now = performance.now();
      if (now - lastSpinAt.current < WHEEL_COOLDOWN_MS) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      wheelAccum.current += delta;
      if (Math.abs(wheelAccum.current) >= WHEEL_THRESHOLD) {
        spin(wheelAccum.current > 0 ? -1 : 1);
        wheelAccum.current = 0;
        lastSpinAt.current = now;
      }
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [angle, spin]);

  // Slow auto-rotation so the splash feels alive; pause while the user is
  // hovering/focusing the wheel and skip entirely under reduced motion.
  React.useEffect(() => {
    if (!angle || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => spin(-1), AUTO_SPIN_MS);
    return () => clearInterval(id);
  }, [angle, paused, spin]);

  if (cardCount === 0) return null;

  return (
    <div
      ref={wheelRef}
      className="splash-token-wheel"
      aria-label="Featured revival candidates"
      role="region"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          spin(-1);
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          spin(1);
        }
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        dragX.current = event.clientX;
        dragAccum.current = 0;
        dragSpun.current = false;
      }}
      onPointerMove={(event) => {
        if (dragX.current === null) return;
        dragAccum.current += event.clientX - dragX.current;
        dragX.current = event.clientX;
        if (Math.abs(dragAccum.current) >= DRAG_THRESHOLD_PX) {
          spin(dragAccum.current > 0 ? 1 : -1);
          dragAccum.current = 0;
          dragSpun.current = true;
        }
      }}
      onPointerUp={() => {
        dragX.current = null;
      }}
      onPointerCancel={() => {
        dragX.current = null;
      }}
      onClickCapture={(event) => {
        // A drag that spun the wheel shouldn't also follow a card link.
        if (dragSpun.current) {
          event.preventDefault();
          event.stopPropagation();
          dragSpun.current = false;
        }
      }}
      tabIndex={0}
    >
      <div className="splash-wheel-scene">
        <div
          className="splash-wheel-ring"
          style={{ transform: `translateZ(calc(-1 * var(--wheel-r, 220px))) rotateY(${rotation}deg)` }}
        >
          {cards.map((token, index) => (
            <div
              key={token.id}
              className={"splash-wheel-card" + (index === active ? " is-active" : "")}
              style={{ transform: `rotateY(${index * angle}deg) translateZ(var(--wheel-r, 220px))` }}
              aria-current={index === active ? "true" : undefined}
              aria-hidden={index === active ? undefined : "true"}
            >
              <DiscoverCoinCard c={token} />
            </div>
          ))}
        </div>
      </div>
      <div
        className="splash-wheel-hint"
        aria-hidden="true"
        style={{ "--p": cardCount > 1 ? active / (cardCount - 1) : 0 } as React.CSSProperties}
      >
        <span />
      </div>
    </div>
  );
}
