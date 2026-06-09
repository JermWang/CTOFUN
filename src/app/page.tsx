import Link from "next/link";
import {
  ArrowRight,
  Vote,
  Hammer,
  Trophy,
  Search,
  Coins,
  ShieldCheck,
  ClipboardCheck,
  Radar,
  WalletCards,
} from "lucide-react";
import { HeroBrandPanel } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BountyCard, RevivalScore, PhaseTracker, Stat } from "@/components/blocks";
import {
  getCampaigns,
  getGraduatedCampaigns,
  getBounties,
  getContributors,
  getGlobalMetrics,
} from "@/lib/data";
import { formatUsd, formatNumber } from "@/lib/utils";

export default async function Home() {
  const [campaigns, graduatedCampaigns, bounties, contributors, globalMetrics] = await Promise.all([
    getCampaigns(),
    getGraduatedCampaigns(),
    getBounties(),
    getContributors(),
    getGlobalMetrics(),
  ]);
  const featured = campaigns[0];
  const featuredBounties = bounties.filter((b) => b.status === "open").slice(0, 3);
  const topContributors = [...contributors].sort((a, b) => b.reputation - a.reputation).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="tech-hero-bg relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-35" />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-4 py-16 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] md:items-center md:py-24">
          <div className="relative min-w-0">
            <div className="mb-8 h-px w-24 bg-primary/70" />
            <h1 className="max-w-full text-3xl font-semibold leading-tight tracking-tight sm:text-5xl md:max-w-4xl md:text-7xl">
              <span className="block">Community takeovers,</span>
              <span className="block">run like infrastructure.</span>
            </h1>
            <p className="mt-6 max-w-full text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 md:max-w-2xl">
              CTO.fun coordinates discovery, voting, bounties, and public proof for
              abandoned meme-coin revivals. Cleaner signals, tighter execution, and
              contributor reputation in one command layer.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href={`/revivals/${featured.slug}`}>
                  View Current Revival <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/submit">Submit a Dead Coin</Link>
              </Button>
              <Button size="lg" variant="ghost" className="w-full sm:w-auto" asChild>
                <Link href="/bounties">Complete Bounties</Link>
              </Button>
            </div>

            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Dead coins submitted" value={formatNumber(globalMetrics.deadCoinsSubmitted)} />
              <Stat label="Coins revived" value={globalMetrics.coinsRevived} />
              <Stat label="Bounties completed" value={formatNumber(globalMetrics.bountiesCompleted)} />
              <Stat label="Rewards paid" value={formatUsd(globalMetrics.rewardsPaid)} />
            </div>
          </div>

          <div className="relative min-w-0">
            <HeroBrandPanel
              className="w-full"
              coinName={featured.coinName}
              ticker={featured.ticker}
              score={featured.revivalScore}
            />
          </div>
        </div>
      </section>

      {/* Pump-born discovery / bounty execution */}
      <Section title="From Pump.fun Dormant to CTO-Funded">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <Card className="liquid-glass overflow-hidden p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                  Discovery sweeper
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Find old Pump.fun launches the market forgot.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                  CTO.fun scans Pump.fun-origin tokens for age, dormancy, bonding-curve
                  graduation, old replies, ATH market cap, and low current volume.
                  Candidates stay in review until a scout or council bounty validates them.
                </p>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                <Radar className="size-6" />
              </span>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <ProcessStat label="Origin" value="Pump.fun" />
              <ProcessStat label="Gate" value="Dormant" />
              <ProcessStat label="Output" value="CTO brief" />
            </div>
            <Button className="mt-6" asChild>
              <Link href="/discover">
                Explore candidates <ArrowRight />
              </Link>
            </Button>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {BOUNTY_LOOP.map((step, index) => (
              <Card key={step.title} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/30">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Current revival */}
      <Section
        title="Current Revival"
        action={<Link href="/revivals" className="text-sm text-primary hover:underline">All revivals →</Link>}
      >
        <Card className="liquid-glass ring-glow overflow-hidden">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">{featured.coinName}</h3>
                <span className="font-mono text-primary">${featured.ticker}</span>
                <Badge variant="primary">Rebuild Phase</Badge>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{featured.manifesto}</p>
              <div className="mt-5">
                <PhaseTracker phase={featured.phase} />
              </div>
              <div className="mt-5 flex flex-wrap gap-6 text-sm">
                <KV label="Active bounties" value={featured.activeBounties} />
                <KV label="Completed" value={featured.completedBounties} />
                <KV label="Contributors" value={featured.contributorsCount} />
                <KV label="Bounty spend" value={formatUsd(featured.totalBountySpend)} />
              </div>
              <Button className="mt-6" asChild>
                <Link href={`/revivals/${featured.slug}`}>
                  Join the revival <ArrowRight />
                </Link>
              </Button>
            </div>
            <RevivalScore score={featured.revivalScore} className="md:scale-125" />
          </CardContent>
        </Card>
      </Section>

      {/* Active bounties */}
      <Section
        title="Active Bounties"
        action={<Link href="/bounties" className="text-sm text-primary hover:underline">All bounties →</Link>}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {featuredBounties.map((b) => (
            <BountyCard key={b.id} bounty={b} />
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section title="How It Works" id="how-it-works">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="p-5">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/30">
                <s.icon className="size-5" />
              </div>
              <div className="mt-4 font-mono text-xs text-muted-foreground">0{i + 1}</div>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Top contributors */}
      <Section title="Top Contributors">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topContributors.map((c) => (
            <Link key={c.id} href={`/contributors/${c.username}`}>
              <Card className="p-5 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 place-items-center rounded-full text-sm font-bold text-background"
                    style={{ background: c.avatarColor }}
                  >
                    {c.displayName.slice(0, 1)}
                  </span>
                  <div>
                    <div className="font-semibold leading-tight">{c.displayName}</div>
                    <div className="text-xs text-muted-foreground">@{c.username}</div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <KV label="Bounties" value={c.completedBounties} />
                  <KV label="Earned" value={formatUsd(c.totalEarned)} />
                  <KV label="Rep" value={c.reputation} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      {/* Hall of revival teaser */}
      <Section
        title="Hall of Revival"
        action={<Link href="/hall" className="text-sm text-primary hover:underline">Full hall →</Link>}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {graduatedCampaigns.map((g) => (
            <Card key={g.id} className="p-5">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-warning" />
                <h3 className="font-semibold">{g.coinName}</h3>
                <span className="font-mono text-xs text-primary">${g.ticker}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <KV label="Contributors" value={g.contributorsCount} />
                <KV label="Bounties" value={g.completedBounties} />
                <KV label="Holders" value={`${formatNumber(g.before.holders)} → ${formatNumber(g.after.holders)}`} />
                <KV label="Spend" value={formatUsd(g.totalBountySpend)} />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <Card className="ring-glow overflow-hidden bg-grid p-10 text-center">
          <Coins className="mx-auto size-8 text-primary" />
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">The graveyard is open.</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Submit a dead coin, complete a bounty, or join a guild. Every revival is
            public. Every contributor earns reputation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/submit">Submit a Dead Coin</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/guilds">Join a Guild</Link>
            </Button>
          </div>
        </Card>
      </section>
    </>
  );
}

const STEPS = [
  { icon: Search, title: "Discover", body: "Scouts submit abandoned coins with revival potential to the Graveyard." },
  { icon: ShieldCheck, title: "Review", body: "Each coin is scored for memes, safety, liquidity, and community." },
  { icon: Vote, title: "Vote", body: "The community votes on which dead coin to revive next." },
  { icon: Hammer, title: "Rebuild", body: "Bounties fund memes, lore, design, websites, and community ops." },
  { icon: Trophy, title: "Graduate", body: "Revived coins with living communities enter the Hall of Revival." },
];

const BOUNTY_LOOP = [
  {
    icon: Search,
    title: "Sweep",
    body: "Surface dormant Pump.fun-origin tokens with old attention and low current activity.",
  },
  {
    icon: ClipboardCheck,
    title: "Scope",
    body: "Turn promising finds into public research, safety, lore, design, and community-op bounties.",
  },
  {
    icon: WalletCards,
    title: "Pay CTOs",
    body: "Contributors earn for the real takeover work: audits, assets, socials, moderation, and proof.",
  },
];

function Section({
  title,
  children,
  action,
  id,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
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

function ProcessStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
