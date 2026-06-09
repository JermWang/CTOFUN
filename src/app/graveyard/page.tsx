import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/blocks";
import { GraveyardBoard } from "@/components/graveyard-board";
import { getDeadCoins } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Graveyard",
  description: "A public list of dead and abandoned meme coins submitted by the community.",
};

export default async function GraveyardPage() {
  const deadCoins = await getDeadCoins();
  const sorted = [...deadCoins].sort((a, b) => b.revivalScore - a.revivalScore);

  return (
    <>
      <PageHeader
        title="The Graveyard"
        subtitle="Abandoned meme coins submitted by the community. Filter by origin — 4chan/OG, animals, frogs, TikTok, the 2024 meta — and sort by revival score."
      >
        <Button asChild>
          <Link href="/submit">Submit a Dead Coin</Link>
        </Button>
      </PageHeader>

      <GraveyardBoard coins={sorted} />
    </>
  );
}
