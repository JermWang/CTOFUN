import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Stat } from "@/components/blocks";
import { getGlobalMetrics, getBuybacks } from "@/lib/data";
import { formatUsd, formatNumber, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Proof of Revival",
  description: "Transparent metrics for the revival machine — work done, rewards paid, and token buybacks.",
};

export default async function DashboardPage() {
  const [m, buybacks] = await Promise.all([getGlobalMetrics(), getBuybacks()]);

  return (
    <>
      <PageHeader
        title="Proof of Revival"
        subtitle="The dashboard proves that work happened. Every revival, bounty, and buyback is tracked publicly."
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
        {/* Revivals */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Revivals</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Stat label="Submitted" value={formatNumber(m.deadCoinsSubmitted)} />
            <Stat label="Reviewed" value={formatNumber(m.coinsReviewed)} />
            <Stat label="Revived" value={m.coinsRevived} />
            <Stat label="Active" value={m.activeRevivals} />
            <Stat label="Graduated" value={m.graduatedRevivals} />
            <Stat label="Failed" value={m.failedRevivals} />
          </div>
        </section>

        {/* Work */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Work &amp; rewards</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Stat label="Bounties created" value={formatNumber(m.bountiesCreated)} />
            <Stat label="Bounties completed" value={formatNumber(m.bountiesCompleted)} />
            <Stat label="Rewards paid" value={formatUsd(m.rewardsPaid)} />
            <Stat label="Contributors" value={formatNumber(m.contributors)} />
            <Stat label="Memes created" value={formatNumber(m.memesCreated)} />
            <Stat label="Communities relaunched" value={m.communitiesRelaunched} />
          </div>
        </section>

        {/* Buybacks */}
        <section id="buybacks">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">Token buybacks</h2>
              <p className="text-sm text-muted-foreground">
                100% of platform fees are used according to the published buyback policy.
                Bought tokens are transparently burned or recycled into future revival bounties.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Fees collected" value={formatUsd(m.totalFeesCollected)} />
            <Stat label="Token bought" value={formatNumber(m.totalTokenBought)} />
            <Stat label="Token burned" value={formatNumber(m.totalTokenBurned)} />
            <Stat label="Recycled to bounties" value={formatNumber(m.totalTokenRecycled)} />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Recent buybacks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Source</th>
                      <th className="px-5 py-3 text-right font-medium">Fee</th>
                      <th className="px-5 py-3 text-right font-medium">Token bought</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buybacks.map((b) => (
                      <tr key={b.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-3 text-muted-foreground">{formatDate(b.date)}</td>
                        <td className="px-5 py-3">{b.source}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{formatUsd(b.feeAmount)}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{formatNumber(b.tokenAmount)}</td>
                        <td className="px-5 py-3">
                          <Badge variant={b.status === "burned" ? "primary" : "secondary"}>
                            {b.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{b.tx}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <p className="mt-3 text-xs text-muted-foreground">
            Buybacks are not a promise of profit or price increase. Platform fees are used
            according to the published policy. Not financial advice.
          </p>
        </section>
      </div>
    </>
  );
}
