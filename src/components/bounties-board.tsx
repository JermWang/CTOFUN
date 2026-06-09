"use client";

import * as React from "react";
import { BountyCard } from "@/components/blocks";
import { cn } from "@/lib/utils";
import type { Bounty } from "@/lib/mock-data";
import {
  BOUNTY_CATEGORY_LABELS,
  MVP_BOUNTY_CATEGORIES,
  type BountyCategory,
} from "@/lib/domain";

type Filter = "all" | BountyCategory;

export function BountiesBoard({ bounties }: { bounties: Bounty[] }) {
  const [filter, setFilter] = React.useState<Filter>("all");

  const filtered = filter === "all" ? bounties : bounties.filter((b) => b.category === filter);
  const filters: Filter[] = ["all", ...MVP_BOUNTY_CATEGORIES];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === f
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "all" ? "All" : BOUNTY_CATEGORY_LABELS[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No bounties in this category yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BountyCard key={b.id} bounty={b} />
          ))}
        </div>
      )}
    </div>
  );
}
