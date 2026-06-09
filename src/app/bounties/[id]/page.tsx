import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BountySubmitForm } from "@/components/bounty-submit-form";
import { getBountyById } from "@/lib/data";
import {
  BOUNTY_CATEGORY_LABELS,
  BOUNTY_STATUS_LABELS,
  bountyFee,
  PLATFORM_FEE_RATE,
} from "@/lib/domain";
import { formatUsd, formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const b = await getBountyById(id);
  return { title: b?.title ?? "Bounty" };
}

export default async function BountyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bounty = await getBountyById(id);
  if (!bounty) notFound();

  const fee = bountyFee(bounty.rewardAmount);
  const perWinner = bounty.rewardAmount / bounty.maxWinners;
  const acceptsSubmissions = bounty.status === "open";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/bounties" className="text-sm text-muted-foreground hover:text-foreground">
        ← All bounties
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{BOUNTY_CATEGORY_LABELS[bounty.category]}</Badge>
        <Badge variant={bounty.status === "open" ? "primary" : "warning"}>
          {BOUNTY_STATUS_LABELS[bounty.status]}
        </Badge>
        {bounty.campaignId && (
          <span className="text-xs text-muted-foreground">
            for the <span className="font-mono text-primary">${bounty.coinTicker}</span> revival
          </span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-bold tracking-tight">{bounty.title}</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {bounty.description}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deliverables &amp; proof</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {bounty.proofRequirements}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Judging criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {bounty.judgingCriteria.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {c}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="pt-5 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-warning">Rules.</span> No fake claims,
              no price promises, no impersonation, no harassment, no copyrighted assets
              unless allowed. Submissions that break these are rejected without payout.
            </CardContent>
          </Card>

          {acceptsSubmissions ? (
            <BountySubmitForm bountyId={bounty.id} bountyTitle={bounty.title} />
          ) : (
            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="pt-5 text-sm text-muted-foreground">
                This bounty is not accepting new submissions.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="ring-glow">
            <CardContent className="space-y-3 pt-6">
              <div>
                <div className="text-3xl font-bold text-primary tabular-nums">
                  {formatUsd(bounty.rewardAmount)}
                </div>
                <div className="text-xs text-muted-foreground">{bounty.rewardToken} reward pool</div>
              </div>
              <Row label="Winners" value={String(bounty.maxWinners)} />
              {bounty.maxWinners > 1 && (
                <Row label="Per winner" value={formatUsd(perWinner)} />
              )}
              <Row label="Deadline" value={formatDate(bounty.deadline)} />
              <Row label="Submissions" value={String(bounty.submissionsCount)} />
              <div className="border-t border-border pt-3">
                <Row
                  label={`Platform fee (${Math.round(PLATFORM_FEE_RATE * 100)}%)`}
                  value={formatUsd(fee)}
                  hint="→ token buyback"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">
        {value}
        {hint && <span className="ml-1 text-xs text-muted-foreground">{hint}</span>}
      </span>
    </div>
  );
}
