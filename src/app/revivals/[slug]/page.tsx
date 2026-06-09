import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, Send, MessageCircle, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PhaseTracker,
  RevivalScore,
  BountyCard,
  Stat,
} from "@/components/blocks";
import { getCampaignBySlug, getCampaignBounties } from "@/lib/data";
import { CORE_GUILDS, CTO_DISCLAIMER } from "@/lib/domain";
import { formatUsd, formatNumber, shortAddress } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCampaignBySlug(slug);
  return { title: c ? `Reviving ${c.coinName} ($${c.ticker})` : "Revival" };
}

export default async function RevivalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) notFound();

  const campaignBounties = await getCampaignBounties(campaign.id);
  const guilds = CORE_GUILDS.filter((g) => campaign.guilds.includes(g.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/revivals" className="text-sm text-muted-foreground hover:text-foreground">
        ← All revivals
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{campaign.coinName}</h1>
            <span className="font-mono text-lg text-primary">${campaign.ticker}</span>
            <Badge variant={campaign.status === "graduated" ? "primary" : "secondary"}>
              {campaign.status === "graduated" ? "Graduated" : "Active Revival"}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {shortAddress(campaign.contractAddress, 8)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {campaign.newTelegram && (
              <SocialLink href={campaign.newTelegram} icon={MessageCircle} label="Telegram" />
            )}
            {campaign.newX && <SocialLink href={campaign.newX} icon={Send} label="X" />}
            {campaign.newWebsite && (
              <SocialLink href={campaign.newWebsite} icon={Globe} label="Website" />
            )}
          </div>
        </div>
        <RevivalScore score={campaign.revivalScore} className="scale-110" />
      </div>

      {/* Phase */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Revival phase</div>
        <PhaseTracker phase={campaign.phase} />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Bounty spend" value={formatUsd(campaign.totalBountySpend)} />
        <Stat label="Active bounties" value={campaign.activeBounties} />
        <Stat label="Completed" value={campaign.completedBounties} />
        <Stat label="Contributors" value={campaign.contributorsCount} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Manifesto */}
          <Card>
            <CardHeader>
              <CardTitle>CTO Manifesto</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {campaign.manifesto}
            </CardContent>
          </Card>

          {/* Active bounties */}
          {campaignBounties.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Active bounties</h2>
                <Link href="/bounties" className="text-sm text-primary hover:underline">
                  All bounties →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {campaignBounties.map((b) => (
                  <BountyCard key={b.id} bounty={b} />
                ))}
              </div>
            </div>
          )}

          {/* Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle>Public roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {campaign.roadmap.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Side */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Before / After</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <BeforeAfter label="Holders" before={formatNumber(campaign.before.holders)} after={formatNumber(campaign.after.holders)} />
              <BeforeAfter label="Telegram" before={formatNumber(campaign.before.telegram)} after={formatNumber(campaign.after.telegram)} />
              <BeforeAfter label="Website" before={campaign.before.website} after={campaign.after.website} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guilds involved</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {guilds.map((g) => (
                <Link key={g.slug} href={`/guilds#${g.slug}`}>
                  <Badge variant="secondary">{g.name}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="pt-5 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-warning">Risk disclosure.</span> {CTO_DISCLAIMER}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon className="size-3.5" />
      {label}
      <ExternalLink className="size-3" />
    </a>
  );
}

function BeforeAfter({ label, before, after }: { label: string; before: string; after: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        <span className="text-muted-foreground/70 line-through">{before}</span>
        <span className="mx-1.5 text-muted-foreground">→</span>
        <span className="text-primary">{after}</span>
      </span>
    </div>
  );
}
