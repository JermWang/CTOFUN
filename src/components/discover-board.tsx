"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ExternalLink,
  Flame,
  Search,
  TimerReset,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatNumber, formatUsd } from "@/lib/utils";

interface DiscoveryCandidate {
  id: string;
  source: "pump.fun";
  mint: string;
  name: string;
  symbol: string;
  description: string;
  pumpUrl: string;
  chartUrl: string;
  createdAt: string;
  lastTradeAt: string;
  dormantDays: number;
  replyCount: number;
  migrated: boolean;
  marketCapUsd: number;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  athMarketCapUsd: number | null;
  athMarketCapAt: string;
  qualificationScore: number;
  revivalScore: number;
  qualificationReasons: string[];
  sweptAt: string;
}

const FILTERS = [
  { key: "all", label: "All candidates" },
  { key: "dormant", label: "Dormant" },
  { key: "migrated", label: "Graduated" },
  { key: "heat", label: "Past heat" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export function DiscoverBoard({ candidates }: { candidates: DiscoveryCandidate[] }) {
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return candidates
      .filter((candidate) => {
        if (filter === "dormant") return candidate.dormantDays >= 90;
        if (filter === "migrated") return candidate.migrated;
        if (filter === "heat") return candidate.replyCount >= 35 || candidate.qualificationScore >= 70;
        return true;
      })
      .filter((candidate) => {
        if (!needle) return true;
        return [candidate.name, candidate.symbol, candidate.mint]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      });
  }, [candidates, filter, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Card className="liquid-glass mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, ticker, or mint"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  filter === item.key
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No candidates matched this filter.
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((candidate) => (
            <CandidateCard key={candidate.mint} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: DiscoveryCandidate }) {
  return (
    <Card className="group overflow-hidden p-5 transition-colors hover:border-primary/40 hover:bg-surface-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold leading-tight">{candidate.name}</h3>
            <span className="font-mono text-sm text-primary">${candidate.symbol}</span>
            <Badge variant="primary">Pump.fun</Badge>
            {candidate.migrated && <Badge variant="secondary">Graduated</Badge>}
          </div>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-muted-foreground">
            {candidate.description || "No Pump.fun description available."}
          </p>
        </div>
        <div className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-right">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            qualify
          </div>
          <div className="text-2xl font-semibold tabular-nums text-primary">
            {candidate.qualificationScore}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        <MiniMetric
          icon={<TimerReset className="size-4" />}
          label="Dormant"
          value={`${formatNumber(candidate.dormantDays)}d`}
        />
        <MiniMetric
          icon={<Flame className="size-4" />}
          label="Replies"
          value={formatNumber(candidate.replyCount)}
        />
        <MiniMetric
          icon={<WalletCards className="size-4" />}
          label="Mkt cap"
          value={formatUsd(candidate.marketCapUsd)}
        />
        <MiniMetric
          icon={<ArrowUpDown className="size-4" />}
          label="ATH cap"
          value={candidate.athMarketCapUsd == null ? "Untracked" : formatUsd(candidate.athMarketCapUsd)}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {candidate.qualificationReasons.map((reason) => (
          <Badge key={reason} variant="outline">
            {reason}
          </Badge>
        ))}
      </div>

      <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="text-xs text-muted-foreground">
          <span className="font-mono text-foreground">{shortMint(candidate.mint)}</span>
          <span className="mx-2">/</span>
          Last trade {formatDate(candidate.lastTradeAt)}
          {candidate.volume24hUsd != null && (
            <>
              <span className="mx-2">/</span>
              24h vol {formatUsd(candidate.volume24hUsd)}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={candidate.pumpUrl} target="_blank" rel="noreferrer">
              Pump source <ExternalLink />
            </a>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <a href={candidate.chartUrl} target="_blank" rel="noreferrer">
              Chart <ExternalLink />
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link href="/bounties">Fund CTO bounties</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[0.65rem] uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function shortMint(mint: string) {
  return `${mint.slice(0, 5)}...${mint.slice(-5)}`;
}

function formatDate(value: string) {
  if (!value) return "unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
