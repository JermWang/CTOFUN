import Link from "next/link";
import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/blocks";
import { getGraduatedCampaigns } from "@/lib/data";
import { CORE_GUILDS } from "@/lib/domain";
import { formatUsd, formatNumber, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hall of Revival",
  description: "Successful community takeovers. Dead coins that came back with living communities.",
};

export default async function HallPage() {
  const graduatedCampaigns = await getGraduatedCampaigns();
  return (
    <>
      <PageHeader
        title="Hall of Revival"
        subtitle="Dead coins that came back. Each entry graduated with an active community, rebuilt presence, and a public proof-of-work history."
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        {graduatedCampaigns.map((g) => {
          const guilds = CORE_GUILDS.filter((x) => g.guilds.includes(x.slug));
          return (
            <Card key={g.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <Trophy className="size-5 text-warning" />
                  <CardTitle className="text-xl">{g.coinName}</CardTitle>
                  <span className="font-mono text-primary">${g.ticker}</span>
                  <Badge variant="primary">Graduated</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(g.startDate)} → {formatDate(g.graduationDate)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="max-w-3xl text-sm text-muted-foreground">{g.manifesto}</p>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <KV label="Contributors" value={formatNumber(g.contributorsCount)} />
                  <KV label="Bounties completed" value={formatNumber(g.completedBounties)} />
                  <KV label="Bounty spend" value={formatUsd(g.totalBountySpend)} />
                  <KV
                    label="Holders"
                    value={`${formatNumber(g.before.holders)} → ${formatNumber(g.after.holders)}`}
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {guilds.map((x) => (
                    <Link key={x.slug} href={`/guilds#${x.slug}`}>
                      <Badge variant="secondary">{x.name}</Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-muted/50 p-3">
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
