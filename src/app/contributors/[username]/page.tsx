import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/blocks";
import { getContributorByUsername } from "@/lib/data";
import { CORE_GUILDS } from "@/lib/domain";
import { formatUsd } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const c = await getContributorByUsername(decodeURIComponent(username));
  return { title: c ? `${c.displayName} (@${c.username})` : "Contributor" };
}

export default async function ContributorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const c = await getContributorByUsername(decodeURIComponent(username));
  if (!c) notFound();

  const guilds = CORE_GUILDS.filter((g) => c.guilds.includes(g.slug));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/contributors" className="text-sm text-muted-foreground hover:text-foreground">
        ← All contributors
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span
          className="grid size-16 place-items-center rounded-full text-2xl font-bold text-background"
          style={{ background: c.avatarColor }}
        >
          {c.displayName.slice(0, 1)}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{c.displayName}</h1>
          <div className="text-sm text-muted-foreground">@{c.username}</div>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{c.bio}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Bounties completed" value={c.completedBounties} />
        <Stat label="Total earned" value={formatUsd(c.totalEarned)} />
        <Stat label="Revivals helped" value={c.revivalsHelped} />
        <Stat label="Reputation" value={c.reputation} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Guilds</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {guilds.map((g) => (
              <Link key={g.slug} href={`/guilds#${g.slug}`}>
                <Badge variant="secondary">{g.name}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {c.specialties.map((s) => (
              <Badge key={s} variant="outline">{s}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {c.badges.map((b) => (
              <Badge key={b} variant="primary">
                {b.replace(/-/g, " ")}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
