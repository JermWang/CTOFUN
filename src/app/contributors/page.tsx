import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/blocks";
import { getContributors } from "@/lib/data";
import { formatUsd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contributors",
  description: "The open network of scouts, creators, moderators, designers, and community operators rebuilding dead coins.",
};

export default async function ContributorsPage() {
  const contributors = await getContributors();
  const ranked = [...contributors].sort((a, b) => b.reputation - a.reputation);

  return (
    <>
      <PageHeader
        title="Contributors"
        subtitle="Scouts, meme medics, lore priests, designers, and operators. Every contributor builds public reputation through proof-of-work."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ranked.map((c, i) => (
            <Link key={c.id} href={`/contributors/${c.username}`}>
              <Card className="p-5 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-11 place-items-center rounded-full text-base font-bold text-background"
                    style={{ background: c.avatarColor }}
                  >
                    {c.displayName.slice(0, 1)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 font-semibold leading-tight">
                      {c.displayName}
                      {i === 0 && <Badge variant="primary">Top</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">@{c.username}</div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{c.bio}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-sm">
                  <KV label="Bounties" value={c.completedBounties} />
                  <KV label="Earned" value={formatUsd(c.totalEarned)} />
                  <KV label="Rep" value={c.reputation} />
                </div>
              </Card>
            </Link>
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
