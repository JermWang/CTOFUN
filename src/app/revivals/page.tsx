import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, PhaseTracker, RevivalScore, DeadCoinCard } from "@/components/blocks";
import { getCampaigns, getDeadCoins } from "@/lib/data";
import { formatUsd } from "@/lib/utils";
import { REVIVAL_PHASES } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Current Revivals",
  description: "Coins actively being revived by the community, plus candidates up for vote.",
};

export default async function RevivalsPage() {
  const [campaigns, deadCoins] = await Promise.all([getCampaigns(), getDeadCoins()]);
  const upForVote = deadCoins.filter(
    (c) => c.status === "up_for_vote" || c.status === "candidate",
  );

  return (
    <>
      <PageHeader
        title="Current Revivals"
        subtitle="Coins actively being revived by the community. Every revival is public, bounty-driven, and tracked through proof-of-work."
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
        <section className="space-y-4">
          {campaigns.map((c) => {
            const phaseLabel = REVIVAL_PHASES.find((p) => p.key === c.phase)?.label ?? c.phase;
            return (
              <Card key={c.id} className="overflow-hidden transition-colors hover:border-primary/40">
                <CardContent className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                  <RevivalScore score={c.revivalScore} />
                  <div>
                    <div className="flex items-center gap-3">
                      <Link href={`/revivals/${c.slug}`} className="text-xl font-bold hover:text-primary">
                        {c.coinName}
                      </Link>
                      <span className="font-mono text-sm text-primary">${c.ticker}</span>
                      <Badge variant="primary">{phaseLabel} Phase</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-muted-foreground">{c.manifesto}</p>
                    <div className="mt-4">
                      <PhaseTracker phase={c.phase} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-6 text-sm">
                      <KV label="Active bounties" value={c.activeBounties} />
                      <KV label="Completed" value={c.completedBounties} />
                      <KV label="Contributors" value={c.contributorsCount} />
                      <KV label="Spend" value={formatUsd(c.totalBountySpend)} />
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/revivals/${c.slug}`}>
                      Open <ArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section id="vote">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Vote on the next revival</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                No staking required. Influence = token participation, reputation,
                contribution history, and anti-sybil checks.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upForVote.map((coin) => (
              <DeadCoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </section>
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
