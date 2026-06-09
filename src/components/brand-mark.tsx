import * as React from "react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="CTO.fun mark"
      className={cn("overflow-visible", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="5"
        width="38"
        height="38"
        rx="9"
        className="fill-background/80 stroke-current"
        strokeWidth="1.4"
      />
      <path
        d="M30.5 15.5a10.5 10.5 0 1 0 0 17"
        className="stroke-current"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M20 15.5h17M28.5 15.5v17"
        className="stroke-current"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="36.5" cy="24" r="2.35" className="fill-primary" />
    </svg>
  );
}

export function HeroBrandPanel({
  coinName,
  ticker,
  className,
}: {
  coinName: string;
  ticker: string;
  score?: number;
  className?: string;
}) {
  const rows = [
    ["signal", "community vote"],
    ["status", "rebuild phase"],
    ["surface", "bounties + proof"],
  ];

  return (
    <div
      className={cn(
        "liquid-glass relative overflow-hidden rounded-lg border p-6 shadow-2xl sm:p-7",
        className,
      )}
    >
      <div className="glass-decor absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="glass-decor absolute right-[-5rem] top-[-5rem] size-44 rounded-full border border-primary/10" />
      <div className="glass-decor absolute bottom-[-6rem] left-[-4rem] size-52 rounded-full border border-secondary/10" />

      <div className="flex items-start justify-between gap-6">
        <span className="grid size-14 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          <BrandMark className="size-10" />
        </span>
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          CTO-01
        </div>
      </div>

      <div className="mt-12">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Active revival
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <h2 className="text-3xl font-semibold tracking-tight">{coinName}</h2>
          <span className="font-mono text-sm text-muted-foreground">${ticker}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[5.75rem_1fr] items-center gap-4 border-t border-border/80 pt-3 text-sm sm:grid-cols-[7rem_1fr]"
          >
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </span>
            <span className="text-foreground">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-border/80 pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              review state
            </div>
            <div className="mt-1 text-3xl font-semibold tracking-tight">
              Council queued
            </div>
          </div>
          <div className="mb-2 flex h-12 w-28 items-end gap-1.5" aria-hidden="true">
            {[38, 52, 45, 68, 84, 62, 92].map((height, index) => (
              <span
                key={index}
                className="w-full rounded-sm bg-primary/70"
                style={{ height: `${height}%`, opacity: 0.34 + index * 0.07 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
