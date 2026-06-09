import type { Metadata } from "next";
import { GraveyardBoard } from "@/components/graveyard-board";
import { AsciiShader } from "@/components/protocol-ui";
import { getDeadCoins } from "@/lib/data";
import { toProtoGrave } from "@/lib/proto-adapters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Graveyard",
  description: "Every revival candidate by status, with council review signals and safety context.",
};

export default async function GraveyardPage() {
  const deadCoins = await getDeadCoins();
  const graves = deadCoins.map(toProtoGrave);

  return (
    <div className="proto">
      <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
        <AsciiShader opacity={0.1} mask="head" cols={170} rows={26} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 44, paddingBottom: 8 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
            GRAVEYARD / REVIVAL PIPELINE
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.025em", margin: "12px 0 8px" }}>
            Every candidate, by status
          </h1>
          <p style={{ color: "var(--dim)", maxWidth: 540, lineHeight: 1.6 }}>
            From newly found to graduated. Each token carries explicit safety context and council review notes before it
            ever reaches a vote.
          </p>
        </div>
      </section>

      <GraveyardBoard graves={graves} />
    </div>
  );
}
