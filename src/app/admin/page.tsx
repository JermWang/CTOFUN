import type { Metadata } from "next";
import { AsciiShader } from "@/components/protocol-ui";
import { AdminReviewPanel } from "@/components/admin-review-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review queue",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="proto">
      <section className="hero lq-frame" style={{ paddingBottom: 6 }}>
        <AsciiShader opacity={0.08} mask="head" cols={170} rows={18} fontSize={13} />
        <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 40, paddingBottom: 14 }}>
          <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
            ADMIN · REVIVAL REVIEW
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 650, letterSpacing: "-.02em", margin: "12px 0 6px" }}>
            Vet teams, fund bounties, record payouts
          </h1>
          <p style={{ color: "var(--dim)", maxWidth: 560, lineHeight: 1.6 }}>
            Approve a team and set its SOL bounty, mark the Pump.fun bounty funded, then record the payout once the
            revival is delivered. Visible to admin wallets only.
          </p>
        </div>
      </section>

      <section className="section tight wrap" style={{ maxWidth: 820 }}>
        <AdminReviewPanel />
      </section>
    </div>
  );
}
