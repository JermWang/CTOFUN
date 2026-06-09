import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/blocks";
import { BOUNTY_CATEGORY_LABELS } from "@/lib/domain";
import { getGuilds } from "@/lib/data";
import { formatUsd, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Guilds",
  description: "Specialized groups that help revive coins. Join one, claim bounties, build a reputation.",
};

export default async function GuildsPage() {
  const guilds = await getGuilds();
  const ranked = [...guilds].sort((a, b) => b.reputation - a.reputation);

  return (
    <>
      <PageHeader
        title="Guilds"
        subtitle="Specialized groups that revive coins together. Claim bounties as a guild, coordinate work, and climb the weekly rankings."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ranked.map((g, i) => (
            <Card key={g.slug} id={g.slug} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{g.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {BOUNTY_CATEGORY_LABELS[g.category]}
                  </Badge>
                </div>
                {i < 3 && <Badge variant="primary">#{i + 1}</Badge>}
              </div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{g.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                <KV label="Members" value={formatNumber(g.members)} />
                <KV label="Bounties" value={formatNumber(g.completedBounties)} />
                <KV label="Earned" value={formatUsd(g.totalEarned)} />
                <KV label="Win rate" value={`${g.winRate}%`} />
              </div>
              <Button variant="outline" className="mt-4 w-full" size="sm">
                Join {g.name}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
