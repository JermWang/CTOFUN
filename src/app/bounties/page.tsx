import type { Metadata } from "next";
import { BountiesBoard } from "@/components/bounties-board";
import { getBounties } from "@/lib/data";
import { toProtoBounty } from "@/lib/proto-adapters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bounties — Get Funded to Revive",
  description:
    "You don't pay to play. CTO.fun's token fees fund a SOL bounty for every revival. Prove your team, deliver the takeover, and the bounty is yours.",
};

export default async function BountiesPage() {
  const bounties = await getBounties();
  const proto = bounties.map(toProtoBounty);
  const totalReward = proto.reduce((s, b) => s + b.reward, 0);

  return <BountiesBoard bounties={proto} totalReward={totalReward} />;
}
