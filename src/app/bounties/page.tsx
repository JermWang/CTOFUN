import type { Metadata } from "next";
import { PageHeader } from "@/components/blocks";
import { BountiesBoard } from "@/components/bounties-board";
import { getBounties } from "@/lib/data";

export const metadata: Metadata = {
  title: "Bounties",
  description: "Complete tasks to rebuild dead coins, earn rewards, and build reputation.",
};

export default async function BountiesPage() {
  const bounties = await getBounties();

  return (
    <>
      <PageHeader
        title="Bounties"
        subtitle="The labor engine. Complete tasks to rebuild dead coins, earn rewards, and build reputation. A 5% platform fee on completed bounties funds transparent token buybacks."
      />
      <BountiesBoard bounties={bounties} />
    </>
  );
}
