import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
/* eslint-disable @next/next/no-img-element */
import { AsciiShader } from "@/components/protocol-ui";
import { RevivalApplyForm } from "@/components/revival-apply-form";
import { getDiscoveredTokenByMint, getRevivalApplicationsByMint } from "@/lib/data";
import { ACTIVE_REVIVAL_STATUSES, CTO_DISCLAIMER } from "@/lib/domain";
import { fmtUsd, fmtSol } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mint: string }>;
}): Promise<Metadata> {
  const { mint } = await params;
  const token = await getDiscoveredTokenByMint(mint);
  return {
    title: token ? `Apply to revive ${token.name} ($${token.symbol})` : "Apply to revive",
    description: "Pitch your team to lead a community takeover. CTO.fun funds the bounty — you deliver and earn it.",
  };
}

export default async function RevivePage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;
  const [token, applications] = await Promise.all([
    getDiscoveredTokenByMint(mint),
    getRevivalApplicationsByMint(mint),
  ]);
  if (!token) notFound();

  const selected = applications.find((a) => ACTIVE_REVIVAL_STATUSES.includes(a.status));
  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="proto">
      <section className="hero lq-frame" style={{ paddingBottom: 6 }}>
        <AsciiShader opacity={0.08} mask="head" cols={170} rows={20} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 34, paddingBottom: 14 }}>
          <Link href="/discover" className="mono" style={{ fontSize: 12, color: "var(--dim)" }}>
            &lt;- Back to discover
          </Link>
          <div className="eyebrow" style={{ letterSpacing: ".2em", marginTop: 14 }}>
            REVIVE / APPLY TO LEAD
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 14 }}>
            {token.imageUrl && (
              <img
                src={token.imageUrl}
                alt={`${token.name} token`}
                width={64}
                height={64}
                style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover", border: "1px solid var(--line-2)" }}
              />
            )}
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 650, letterSpacing: "-.02em", margin: 0 }}>{token.name}</h1>
              <div className="mono" style={{ fontSize: 13, color: "var(--green)", marginTop: 4 }}>
                ${token.symbol}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 18, flexWrap: "wrap" }}>
            {([
              [fmtUsd(token.marketCapUsd), "market cap"],
              [`${token.dormantDays}d`, "dormant"],
              [fmtUsd(token.athMarketCapUsd), "ATH cap"],
            ] as [string, string][]).map(([v, k]) => (
              <div className="kv" key={k}>
                <div className="v" style={{ fontSize: 18 }}>
                  {v}
                </div>
                <div className="k">{k}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            {token.pumpUrl && (
              <a className="btn btn-outline" href={token.pumpUrl} target="_blank" rel="noreferrer">
                Pump.fun
              </a>
            )}
            {token.chartUrl && (
              <a className="btn btn-outline" href={token.chartUrl} target="_blank" rel="noreferrer">
                Chart
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="section tight wrap" style={{ maxWidth: 760 }}>
        {selected ? (
          <div className="lq-soft" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ letterSpacing: ".16em", color: "var(--green-dim)" }}>
              REVIVAL CLAIMED
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 650, margin: "10px 0 6px" }}>
              {selected.teamName} is leading this revival
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--dim)", lineHeight: 1.6 }}>
              A team has already been selected to take over ${token.symbol}
              {selected.bountyAmountSol != null && <> for a {fmtSol(selected.bountyAmountSol)} bounty</>}. Follow its
              progress on the revivals board.
            </p>
            <Link className="btn btn-solid" href="/revivals" style={{ marginTop: 16 }}>
              View active revivals -&gt;
            </Link>
          </div>
        ) : (
          <>
            <div className="sechead">
              <h2>Apply to lead this revival</h2>
            </div>
            <p style={{ fontSize: 14, color: "var(--dim)", lineHeight: 1.65, margin: "0 0 18px", maxWidth: 620 }}>
              You don&apos;t fund this — CTO.fun does. Token fees bankroll a SOL bounty on Pump.fun. Pitch your team,
              get vetted, deliver the takeover, and claim the bounty as real startup capital.
              {pendingCount > 0 && (
                <>
                  {" "}
                  <span style={{ color: "var(--faint)" }}>
                    {pendingCount} team{pendingCount === 1 ? "" : "s"} already in the running.
                  </span>
                </>
              )}
            </p>
            <RevivalApplyForm
              token={{ mint: token.mint, name: token.name, symbol: token.symbol, imageUrl: token.imageUrl }}
            />
            <p className="mono" style={{ fontSize: 10.5, color: "var(--faint)", lineHeight: 1.5, marginTop: 16 }}>
              {CTO_DISCLAIMER}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
