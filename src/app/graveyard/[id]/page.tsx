import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RevivalScore, ScoreBar, StatusBadge, CategoryChip } from "@/components/blocks";
import { VoteWidget } from "@/components/vote-widget";
import { getDeadCoinById } from "@/lib/data";
import { formatUsd, formatNumber, formatDate, shortAddress } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const coin = await getDeadCoinById(id);
  return { title: coin ? `${coin.name} ($${coin.ticker})` : "Dead coin" };
}

export default async function DeadCoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coin = await getDeadCoinById(id);
  if (!coin) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/graveyard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to the Graveyard
      </Link>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{coin.name}</h1>
            <span className="font-mono text-lg text-primary">${coin.ticker}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={coin.status} />
            {coin.categories.map((c) => (
              <CategoryChip key={c} slug={c} />
            ))}
            <span className="text-xs text-muted-foreground">
              Submitted by {coin.submittedBy} · {formatDate(coin.submittedAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <RevivalScore score={coin.revivalScore} className="scale-110" />
          <Button variant="outline" asChild>
            <a href={coin.chartUrl} target="_blank" rel="noreferrer">
              Chart <ExternalLink />
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Market snapshot */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle>Market snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Market cap" value={formatUsd(coin.marketCap)} />
              <Field label="Liquidity" value={formatUsd(coin.liquidity)} />
              <Field label="Holders" value={formatNumber(coin.holderCount)} />
              <Field label="Launched" value={formatDate(coin.launchDate)} />
              <Field label="Chain" value={coin.chain} />
              <Field label="Telegram" value={coin.telegramStatus} className="col-span-2 sm:col-span-3" />
              <Field label="Website" value={coin.websiteStatus} />
              <Field label="Last dev activity" value={formatDate(coin.lastDevActivity)} />
              <Field
                label="Contract"
                value={<span className="font-mono">{shortAddress(coin.contractAddress, 6)}</span>}
                className="col-span-2 sm:col-span-2"
              />
            </CardContent>
          </Card>

          {/* Story */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle>Why it died</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{coin.reasonDied}</CardContent>
          </Card>
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle>Why it could be revived</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{coin.reasonRevive}</CardContent>
          </Card>

          {/* Risk */}
          <Card className="liquid-glass border-warning/30 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="size-4" /> Risk notes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{coin.riskNotes}</CardContent>
          </Card>
        </div>

        {/* Side: scorecard + votes */}
        <div className="space-y-6">
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle>Revival scorecard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScoreBar label="Meme" value={coin.memeScore} />
              <ScoreBar label="Community" value={coin.communityScore} />
              <ScoreBar label="Safety" value={coin.safetyScore} />
              <ScoreBar label="Liquidity" value={coin.liquidityScore} />
              <ScoreBar label="Lore" value={coin.loreScore} />
              <ScoreBar label="Ticker" value={coin.tickerScore} />
              <ScoreBar label="Contributor interest" value={coin.contributorInterest} />
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle>Community vote</CardTitle>
            </CardHeader>
            <CardContent>
              <VoteWidget coinId={coin.id} initial={coin.votes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
