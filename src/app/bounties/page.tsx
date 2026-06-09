import type { Metadata } from "next";
import { BountiesBoard } from "@/components/bounties-board";
import { getBounties } from "@/lib/data";
import { toProtoBounty } from "@/lib/proto-adapters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bounties — CTO Work Queue",
  description:
    "Funded takeover work. Pick up a bounty, submit proof, get paid on approval. A 5% fee funds token buybacks.",
};

export default async function BountiesPage() {
  const bounties = await getBounties();
  const proto = bounties.map(toProtoBounty);
  const totalReward = proto.reduce((s, b) => s + b.reward, 0);

  return <BountiesBoard bounties={proto} totalReward={totalReward} />;
}
