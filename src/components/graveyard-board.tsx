"use client";

import * as React from "react";
import { DeadCoinCard } from "@/components/blocks";
import { cn } from "@/lib/utils";
import type { DeadCoin } from "@/lib/mock-data";
import { MEME_CATEGORIES } from "@/lib/domain";

export function GraveyardBoard({ coins }: { coins: DeadCoin[] }) {
  const [active, setActive] = React.useState<string>("all");

  // Only show category chips that at least one coin actually uses.
  const present = new Set(coins.flatMap((c) => c.categories));
  const categories = MEME_CATEGORIES.filter((c) => present.has(c.slug));

  const filtered =
    active === "all" ? coins : coins.filter((c) => c.categories.includes(active));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap gap-2">
        <Chip label="All" active={active === "all"} onClick={() => setActive("all")} />
        {categories.map((c) => (
          <Chip
            key={c.slug}
            label={`${c.emoji} ${c.label}`}
            active={active === c.slug}
            onClick={() => setActive(c.slug)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No coins in this category yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((coin) => (
            <DeadCoinCard key={coin.id} coin={coin} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
