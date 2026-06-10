import Link from "next/link";
import { cn, formatUsd, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BOUNTY_CATEGORY_LABELS,
  BOUNTY_STATUS_LABELS,
  DEAD_COIN_STATUS_LABELS,
  REVIVAL_PHASES,
  memeCategoryLabel,
  memeCategoryEmoji,
  type DeadCoinStatus,
  type RevivalPhase,
} from "@/lib/domain";
import type { Bounty, DeadCoin } from "@/lib/types";

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------
export function scoreTone(score: number): "primary" | "secondary" | "warning" | "danger" {
  if (score >= 75) return "primary";
  if (score >= 60) return "secondary";
  if (score >= 45) return "warning";
  return "danger";
}

export function RevivalScore({ score, className }: { score: number; className?: string }) {
  const tone = scoreTone(score);
  const ring =
    tone === "primary"
      ? "text-primary"
      : tone === "secondary"
        ? "text-secondary"
        : tone === "warning"
          ? "text-warning"
          : "text-danger";
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn(
          "grid size-16 place-items-center rounded-full border-2 border-current text-xs font-bold uppercase tracking-wide",
          ring,
        )}
      >
        Review
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        Signal
      </span>
    </div>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}/10</span>
      </div>
      <Progress value={value * 10} tone={scoreTone(value * 10)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="text-2xl font-bold tabular-nums text-glow">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground/70">{hint}</div>}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Status / category badges
// ---------------------------------------------------------------------------
const STATUS_VARIANT: Record<DeadCoinStatus, "default" | "primary" | "secondary" | "warning" | "danger" | "outline"> = {
  newly_submitted: "outline",
  under_review: "warning",
  candidate: "secondary",
  up_for_vote: "secondary",
  selected_for_revival: "primary",
  active_revival: "primary",
  graduated: "primary",
  failed_revival: "danger",
  blacklisted: "danger",
};

export function StatusBadge({ status }: { status: DeadCoinStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{DEAD_COIN_STATUS_LABELS[status]}</Badge>;
}

export function CategoryChip({ slug }: { slug: string }) {
  const emoji = memeCategoryEmoji(slug);
  return (
    <Badge variant="outline" className="gap-1">
      {emoji && <span aria-hidden>{emoji}</span>}
      {memeCategoryLabel(slug)}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Phase tracker
// ---------------------------------------------------------------------------
export function PhaseTracker({ phase }: { phase: RevivalPhase }) {
  const current = REVIVAL_PHASES.find((p) => p.key === phase)?.index ?? 0;
  return (
    <div className="flex flex-wrap gap-1.5">
      {REVIVAL_PHASES.map((p) => {
        const done = p.index < current;
        const active = p.index === current;
        return (
          <div
            key={p.key}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset",
              active && "bg-primary/15 text-primary ring-primary/40",
              done && "bg-muted text-foreground/70 ring-border",
              !done && !active && "text-muted-foreground/50 ring-border",
            )}
          >
            {p.index}. {p.label}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
export function DeadCoinCard({ coin }: { coin: DeadCoin }) {
  return (
    <Link href={`/graveyard/${coin.id}`} className="group block">
      <Card className="h-full p-5 transition-colors hover:border-primary/40 hover:bg-surface-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold leading-tight">{coin.name}</h3>
              <span className="font-mono text-xs text-primary">${coin.ticker}</span>
            </div>
            <div className="mt-1">
              <StatusBadge status={coin.status} />
            </div>
          </div>
          <RevivalScore score={coin.revivalScore} />
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{coin.reasonRevive}</p>
        {coin.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {coin.categories.map((c) => (
              <CategoryChip key={c} slug={c} />
            ))}
          </div>
        )}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <MiniStat label="Mkt Cap" value={formatUsd(coin.marketCap)} />
          <MiniStat label="Liquidity" value={formatUsd(coin.liquidity)} />
          <MiniStat label="Holders" value={formatNumber(coin.holderCount)} />
        </div>
      </Card>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 py-2">
      <div className="font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const statusVariant =
    bounty.status === "open" ? "primary" : bounty.status === "in_review" ? "warning" : "outline";
  return (
    <Link href={`/bounties/${bounty.id}`} className="group block">
      <Card className="h-full p-5 transition-colors hover:border-primary/40 hover:bg-surface-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{BOUNTY_CATEGORY_LABELS[bounty.category]}</Badge>
          <Badge variant={statusVariant}>{BOUNTY_STATUS_LABELS[bounty.status]}</Badge>
        </div>
        <h3 className="mt-3 font-semibold leading-snug group-hover:text-primary">{bounty.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{bounty.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="font-bold text-primary tabular-nums">
            {formatUsd(bounty.rewardAmount)}
          </span>
          <span className="text-xs text-muted-foreground">
            {bounty.maxWinners > 1 ? `${bounty.maxWinners} winners · ` : ""}
            {bounty.submissionsCount} submissions
          </span>
        </div>
      </Card>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page header
// ---------------------------------------------------------------------------
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-grid">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
