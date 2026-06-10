"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Flame,
  Gem,
  Grid2X2,
  MessageCircle,
  Rows3,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ProtoCandidate } from "@/components/protocol-blocks";
import { MEME_CATEGORY_LABELS } from "@/lib/domain";
import { fmtNum, fmtUsd } from "@/lib/format";

const FILTERS = [
  { k: "all", label: "All dead coins" },
  { k: "gems", label: "Gems" },
  { k: "dormant", label: "Dormant" },
  { k: "graduated", label: "Graduated" },
  { k: "heat", label: "Past heat" },
  { k: "review", label: "Needs review" },
] as const;

const SORTS = [
  { k: "score", label: "Best match" },
  { k: "mcap", label: "Market cap" },
  { k: "ath", label: "ATH" },
  { k: "dormant", label: "Oldest" },
  { k: "replies", label: "Replies" },
] as const;

type SortKey = (typeof SORTS)[number]["k"];

export function DiscoverBoard({ candidates }: { candidates: ProtoCandidate[] }) {
  const [filter, setFilter] = React.useState<string>("all");
  const [sort, setSort] = React.useState<SortKey>("score");
  const [q, setQ] = React.useState("");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Client-only platform read with a stable server snapshot, so the kbd hint
  // hydrates cleanly and switches to ⌘K on macOS.
  const isMac = React.useSyncExternalStore(
    React.useCallback(() => () => {}, []),
    () => /mac/i.test(navigator.platform),
    () => false,
  );
  const shortcutHint = isMac ? "⌘ K" : "Ctrl K";

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === "Escape" && target === searchRef.current) {
        setQ("");
        searchRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const categoryFilters = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const candidate of candidates) {
      for (const category of candidate.categories ?? []) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([slug, count]) => ({ slug, count, label: MEME_CATEGORY_LABELS[slug] ?? slug }));
  }, [candidates]);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return candidates
      .filter((c) => {
        if (filter === "gems" && !c.gem) return false;
        if (filter === "dormant" && c.dormant < 150) return false;
        if (filter === "graduated" && !c.migrated) return false;
        if (filter === "heat" && (c.ath ?? 0) < 50_000 && c.replies < 250) return false;
        if (filter === "review" && !(c.qual >= 60 && c.qual < 76)) return false;
        if (filter.startsWith("cat:") && !(c.categories ?? []).includes(filter.slice(4))) return false;
        if (
          needle &&
          !(c.name + " " + c.sym + " " + c.blurb + " " + (c.categories ?? []).join(" "))
            .toLowerCase()
            .includes(needle)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => metricFor(b, sort) - metricFor(a, sort));
  }, [candidates, filter, q, sort]);

  const top = filtered.slice(0, 3);

  return (
    <section className="discover-shell wrap">
      <div className="discover-topbar">
        <div className="discover-search">
          <Search size={18} />
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dead coins..."
          />
          <kbd>{shortcutHint}</kbd>
        </div>
        <div className="discover-actions" aria-label="Display controls">
          <button
            type="button"
            className={"discover-icon-btn" + (view === "grid" ? " active" : "")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <Grid2X2 size={17} />
          </button>
          <button
            type="button"
            className={"discover-icon-btn" + (view === "list" ? " active" : "")}
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <Rows3 size={17} />
          </button>
        </div>
      </div>

      <div className="discover-hero-strip">
        <div>
          <span className="eyebrow">EXPLORE DEAD COINS</span>
          <h2>Dormant Pump.fun launches with real revival signals</h2>
        </div>
        <div className="discover-strip-stats">
          <StatPill label="Candidates" value={fmtNum(candidates.length)} />
          <StatPill label="Qualified" value={fmtNum(candidates.filter((c) => c.qual >= 60).length)} />
          <StatPill label="Categories" value={fmtNum(categoryFilters.length)} />
        </div>
      </div>

      {top.length > 0 && (
        <div className="discover-featured">
          {top.map((c) => (
            <FeaturedCoin key={c.id} c={c} />
          ))}
        </div>
      )}

      <div className="discover-filterbar">
        <div className="discover-tabs" role="tablist" aria-label="Discover filters">
          {FILTERS.map((f) => (
            <button
              key={f.k}
              type="button"
              role="tab"
              aria-selected={filter === f.k}
              className={filter === f.k ? "active" : ""}
              onClick={() => setFilter(f.k)}
            >
              {f.label}
            </button>
          ))}
          {categoryFilters.map((category) => (
            <button
              key={category.slug}
              type="button"
              role="tab"
              aria-selected={filter === `cat:${category.slug}`}
              className={filter === `cat:${category.slug}` ? "active" : ""}
              onClick={() => setFilter(`cat:${category.slug}`)}
            >
              {category.label} <span className="tab-count">{category.count}</span>
            </button>
          ))}
        </div>
        <div className="discover-sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort coins">
            {SORTS.map((s) => (
              <option key={s.k} value={s.k}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="discover-count">
        <span>{fmtNum(filtered.length)} results</span>
        <span>Category and market signals update from token sources.</span>
      </div>

      {filtered.length === 0 ? (
        <div className="discover-empty">No dead coins matched this browse state.</div>
      ) : view === "list" ? (
        <div className="discover-list">
          {filtered.map((c) => (
            <DiscoverCoinRow key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <div className="discover-grid">
          {filtered.map((c) => (
            <DiscoverCoinCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}

function metricFor(c: ProtoCandidate, sort: SortKey): number {
  if (sort === "mcap") return c.mcap ?? 0;
  if (sort === "ath") return c.ath ?? 0;
  if (sort === "dormant") return c.dormant ?? 0;
  if (sort === "replies") return c.replies ?? 0;
  // Best match: verified gems outrank everything, ordered by gem score.
  if (c.gem) return 1_000 + (c.gemScore ?? 0);
  return c.qual ?? 0;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="discover-stat-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FeaturedCoin({ c }: { c: ProtoCandidate }) {
  return (
    <Link className="discover-feature-card" href="/bounties">
      <TokenImage c={c} />
      <div>
        <span className="discover-chip">Top revival fit</span>
        <h3>{c.name}</h3>
        <p>
          ${c.sym} / {fmtUsd(c.mcap)} MC / {c.dormant}d dormant
        </p>
      </div>
      <ArrowUpRight size={17} />
    </Link>
  );
}

export function DiscoverCoinCard({ c }: { c: ProtoCandidate }) {
  const progress = Math.max(12, Math.min(100, c.qual));
  return (
    <article className="discover-card">
      <div className="discover-art">
        <TokenImage c={c} />
        <div className="discover-score">Fit</div>
        {c.gem ? (
          <div className="discover-gem">
            <Gem size={11} /> Gem
          </div>
        ) : (
          c.migrated && <div className="discover-live">Graduated</div>
        )}
      </div>

      <div className="discover-card-body">
        <div className="discover-card-head">
          <div>
            <h3>{c.name}</h3>
            <p>${c.sym}</p>
          </div>
          <strong>{fmtUsd(c.mcap)} <span>MC</span></strong>
        </div>

        <div className="discover-minirow">
          <span>
            <Clock3 size={13} /> {c.dormant}d
          </span>
          {c.holders != null ? (
            <span>
              <Users size={13} /> {fmtNum(c.holders)}
              {c.holders >= 1000 ? "+" : ""}
            </span>
          ) : (
            <span>
              <MessageCircle size={13} /> {fmtNum(c.replies)}
            </span>
          )}
          <span>
            <ShieldCheck size={13} /> {c.risk}
          </span>
        </div>

        <p className="discover-blurb">{c.blurb}</p>

        {(c.categories ?? []).length > 0 && (
          <div className="discover-category-row">
            {(c.categories ?? []).slice(0, 3).map((category) => (
              <span key={category}>{MEME_CATEGORY_LABELS[category] ?? category}</span>
            ))}
          </div>
        )}

        <div className="discover-metrics">
          <Metric label="ATH" value={fmtUsd(c.ath)} />
          <Metric label="Liq" value={fmtUsd(c.liquidityUsd)} />
          <Metric label="24h Vol" value={fmtUsd(c.volume24hUsd)} />
        </div>

        <div className="discover-progress" aria-label="Review fit">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="discover-reasons">
          {c.reasons.slice(0, 2).map((r) => (
            <span key={r}>{r}</span>
          ))}
        </div>

        <div className="discover-card-actions">
          <ExternalCoinLink href={c.pumpUrl} label="Pump" />
          <ExternalCoinLink href={c.chartUrl} label="Chart" />
          <Link href="/bounties">
            Fund CTO <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function DiscoverCoinRow({ c }: { c: ProtoCandidate }) {
  const progress = Math.max(12, Math.min(100, c.qual));
  return (
    <article className="discover-row">
      <div className="discover-row-art">
        <TokenImage c={c} />
      </div>
      <div className="discover-row-id">
        <h3>{c.name}</h3>
        <p>
          ${c.sym}
          {c.migrated && <span className="discover-row-flag">Graduated</span>}
        </p>
      </div>
      <div className="discover-row-metrics">
        <Metric label="MC" value={fmtUsd(c.mcap)} />
        <Metric label="ATH" value={fmtUsd(c.ath)} />
        <Metric label="Dormant" value={`${c.dormant}d`} />
        <Metric label="Replies" value={fmtNum(c.replies)} />
        <Metric label="Risk" value={c.risk} />
      </div>
      <div className="discover-row-fit">
        <div className="discover-progress" aria-label="Review fit">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="discover-row-qual tnum">{c.qual}</span>
      </div>
      <div className="discover-row-actions">
        <ExternalCoinLink href={c.pumpUrl} label="Pump" />
        <ExternalCoinLink href={c.chartUrl} label="Chart" />
        <Link href="/bounties">
          Fund CTO <ArrowUpRight size={13} />
        </Link>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ExternalCoinLink({ href, label }: { href?: string; label: string }) {
  if (!href) return <span className="disabled-link">{label}</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {label} <ArrowUpRight size={13} />
    </a>
  );
}

function TokenImage({ c }: { c: ProtoCandidate }) {
  const [failed, setFailed] = React.useState(false);
  if (!c.imageUrl || failed) {
    return (
      <div className="token-fallback" aria-label={`${c.name} token art fallback`}>
        <Flame size={24} />
        <span>{c.sym.slice(0, 3).toUpperCase()}</span>
      </div>
    );
  }

  return <img src={c.imageUrl} alt={`${c.name} token artwork`} loading="lazy" onError={() => setFailed(true)} />;
}
