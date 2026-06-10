"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import {
  collectCreatorFeesNow,
  getCreatorFeeAutomationStatus,
  getReviewQueue,
  getRevivalTargetQueue,
  reviewRevivalApplication,
  recordRevivalPayout,
  setRevivalTarget,
} from "@/app/actions";
import { WithPrivy, type PrivyAccess } from "@/components/with-privy";
import { REVIVAL_APPLICATION_STATUS_LABELS } from "@/lib/domain";
import { fmtSol, fmtUsd } from "@/lib/format";
import type { RevivalApplication } from "@/lib/types";
import type { CollectCreatorFeesResult, CreatorFeeAutomationStatus } from "@/lib/pumpportal";

const inputStyle: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: 9,
  color: "var(--ink)",
  border: "1px solid var(--line-2)",
  background: "rgba(255,255,255,.62)",
  fontSize: 13,
  outline: "none",
  fontFamily: "var(--sans)",
};

interface TargetToken {
  mint: string;
  name: string;
  symbol: string;
  imageUrl: string;
  marketCapUsd: number;
  dormantDays: number;
  qualificationScore: number;
  status: string;
}

export function AdminReviewPanel() {
  return <WithPrivy>{(privy) => <Panel privy={privy} />}</WithPrivy>;
}

function Panel({ privy }: { privy: PrivyAccess }) {
  const [queue, setQueue] = React.useState<RevivalApplication[] | null>(null);
  const [targets, setTargets] = React.useState<TargetToken[] | null>(null);
  const [feeStatus, setFeeStatus] = React.useState<CreatorFeeAutomationStatus | null>(null);
  const [feeResult, setFeeResult] = React.useState<CollectCreatorFeesResult | null>(null);
  const [error, setError] = React.useState("");
  const started = React.useRef(false);

  const load = React.useCallback(async () => {
    const token = await privy.getToken();
    const [queueRes, targetsRes, statusRes] = await Promise.all([
      getReviewQueue(token),
      getRevivalTargetQueue(token),
      getCreatorFeeAutomationStatus(token),
    ]);

    if (queueRes.ok) setQueue(queueRes.data ?? []);
    else setError(queueRes.error ?? "Could not load review queue.");

    if (targetsRes.ok) setTargets(targetsRes.data ?? []);
    else setError(targetsRes.error ?? "Could not load revival targets.");

    if (statusRes.ok) setFeeStatus(statusRes.data ?? null);
    if (queueRes.ok && targetsRes.ok) setError("");
  }, [privy]);

  React.useEffect(() => {
    if (privy.authenticated && !started.current) {
      started.current = true;
      load();
    }
  }, [privy.authenticated, load]);

  if (!privy.configured) return <Notice text="Wallet login isn't configured yet." />;
  if (!privy.authenticated) {
    return (
      <div className="lq-soft" style={{ padding: 24, textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--dim)", marginBottom: 14 }}>Connect an admin wallet to review applications.</p>
        <button type="button" className="btn btn-solid" onClick={() => privy.login?.()}>
          Connect
        </button>
      </div>
    );
  }
  if (error) return <Notice text={error} />;
  if (queue === null || targets === null) return <Notice text="Loading review queue..." />;

  const groups = groupApplications(queue);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <CreatorFeeControl
        privy={privy}
        status={feeStatus}
        result={feeResult}
        onResult={setFeeResult}
        onStatus={setFeeStatus}
      />
      <TargetControl targets={targets} privy={privy} onDone={load} />
      <section className="admin-review-section">
        <div className="admin-section-head">
          <div>
            <strong>Team approvals</strong>
            <span>Pick one team per token, then manually create/fund the bounty and record the payout tx.</span>
          </div>
          <span className="admin-count-pill">{queue.length} applications</span>
        </div>
        {queue.length === 0 && <Notice text="No applications yet." />}
        {groups.map((group) => (
          <ReviewGroup key={group.mint} group={group} privy={privy} onDone={load} />
        ))}
      </section>
    </div>
  );
}

function groupApplications(queue: RevivalApplication[]) {
  const byMint = new Map<string, { mint: string; tokenName: string; tokenSymbol: string; apps: RevivalApplication[] }>();
  for (const app of queue) {
    const group = byMint.get(app.mint) ?? {
      mint: app.mint,
      tokenName: app.tokenName,
      tokenSymbol: app.tokenSymbol,
      apps: [],
    };
    group.apps.push(app);
    byMint.set(app.mint, group);
  }
  return [...byMint.values()];
}

function CreatorFeeControl({
  privy,
  status,
  result,
  onResult,
  onStatus,
}: {
  privy: PrivyAccess;
  status: CreatorFeeAutomationStatus | null;
  result: CollectCreatorFeesResult | null;
  onResult: (result: CollectCreatorFeesResult | null) => void;
  onStatus: (status: CreatorFeeAutomationStatus | null) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const ready = Boolean(status?.configured);

  const collect = async () => {
    setBusy(true);
    setError("");
    onResult(null);
    const token = await privy.getToken();
    const res = await collectCreatorFeesNow(token);
    const nextStatus = await getCreatorFeeAutomationStatus(token);
    if (nextStatus.ok) onStatus(nextStatus.data ?? null);
    setBusy(false);
    if (res.ok && res.data) onResult(res.data);
    else setError(res.error ?? "Creator-fee collection failed.");
  };

  return (
    <section className="lq-soft" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <strong style={{ color: "var(--ink)", fontSize: 14 }}>Creator fees</strong>
          <div className="mono" style={{ fontSize: 11, color: "var(--faint)", marginTop: 4, wordBreak: "break-all" }}>
            {status?.publicKey ? status.publicKey : "treasury signer not configured"}
          </div>
        </div>
        <button type="button" className="btn btn-solid btn-sm" disabled={!ready || busy} onClick={collect}>
          {busy ? "Collecting..." : "Collect creator fees"}
        </button>
      </div>
      {!ready && (
        <span style={{ fontSize: 12, color: "var(--dim)" }}>
          Set TREASURY_SIGNER_ENABLED, TREASURY_SIGNER_SECRET, and SOLANA_RPC_URL to enable.
        </span>
      )}
      {error && <span style={{ fontSize: 12, color: "var(--red, #ff5d6c)" }}>{error}</span>}
      {result && (
        <a className="mono" style={{ fontSize: 12, color: "var(--green)", wordBreak: "break-all" }} href={result.explorerUrl} target="_blank" rel="noreferrer">
          {result.signature}
        </a>
      )}
    </section>
  );
}

function TargetControl({
  targets,
  privy,
  onDone,
}: {
  targets: TargetToken[];
  privy: PrivyAccess;
  onDone: () => void;
}) {
  const [busyMint, setBusyMint] = React.useState("");
  const [error, setError] = React.useState("");
  const pinned = targets.filter((t) => t.status === "targeted").length;

  const toggle = async (target: TargetToken, next: boolean) => {
    setBusyMint(target.mint);
    setError("");
    const res = await setRevivalTarget(await privy.getToken(), {
      mint: target.mint,
      targeted: next,
      notes: next ? "Marked from admin review." : undefined,
    });
    setBusyMint("");
    if (res.ok) onDone();
    else setError(res.error ?? "Could not update target.");
  };

  return (
    <section className="admin-review-section">
      <div className="admin-section-head">
        <div>
          <strong>Revival targets</strong>
          <span>Signal which discovered tokens the community is set on reviving. This does not create a bounty.</span>
        </div>
        <span className="admin-count-pill">{pinned} targeted</span>
      </div>
      {error && <span style={{ fontSize: 12, color: "var(--red, #ff5d6c)" }}>{error}</span>}
      {targets.length === 0 ? (
        <Notice text="No discovered tokens are ready to target yet." />
      ) : (
        <div className="admin-target-grid">
          {targets.slice(0, 12).map((target) => {
            const selected = target.status === "targeted";
            return (
              <article className={"admin-target-card" + (selected ? " selected" : "")} key={target.mint}>
                {target.imageUrl && <img src={target.imageUrl} alt="" />}
                <div className="admin-target-main">
                  <div>
                    <strong>{target.name}</strong>
                    <span className="mono">${target.symbol}</span>
                  </div>
                  <p>{fmtUsd(target.marketCapUsd)} MC / {target.dormantDays}d dormant / fit {target.qualificationScore}</p>
                </div>
                <button
                  type="button"
                  className={"btn btn-sm " + (selected ? "btn-outline" : "btn-solid")}
                  disabled={busyMint === target.mint}
                  onClick={() => toggle(target, !selected)}
                >
                  {busyMint === target.mint ? "Saving..." : selected ? "Unmark" : "Mark target"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ReviewGroup({
  group,
  privy,
  onDone,
}: {
  group: ReturnType<typeof groupApplications>[number];
  privy: PrivyAccess;
  onDone: () => void;
}) {
  const selected = group.apps.find((app) => ["approved", "funded", "delivered", "paid"].includes(app.status));
  const pending = group.apps.filter((app) => app.status === "pending").length;

  return (
    <article className="admin-app-group">
      <div className="admin-app-group-head">
        <div>
          <strong>{group.tokenName}</strong>
          <span className="mono">${group.tokenSymbol}</span>
        </div>
        <span>{selected ? `${selected.teamName} selected` : `${pending} pending`}</span>
      </div>
      <div className="admin-app-list">
        {group.apps.map((app) => (
          <ReviewRow key={app.id} app={app} privy={privy} onDone={onDone} />
        ))}
      </div>
    </article>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="lq-soft" style={{ padding: 22, textAlign: "center", fontSize: 13.5, color: "var(--dim)" }}>
      {text}
    </div>
  );
}

function ReviewRow({ app, privy, onDone }: { app: RevivalApplication; privy: PrivyAccess; onDone: () => void }) {
  const [bounty, setBounty] = React.useState(app.bountyAmountSol ? String(app.bountyAmountSol) : "");
  const [pumpUrl, setPumpUrl] = React.useState(app.bountyPumpfunUrl);
  const [payoutTx, setPayoutTx] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [rowError, setRowError] = React.useState("");

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    setRowError("");
    const res = await fn();
    setBusy(false);
    if (res.ok) onDone();
    else setRowError(res.error ?? "Action failed.");
  };

  const token = () => privy.getToken();

  return (
    <article className="admin-review-row">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <div>
          <span style={{ fontWeight: 650, color: "var(--ink)" }}>{app.teamName}</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--green)", marginLeft: 8 }}>
            ${app.tokenSymbol}
          </span>
        </div>
        <span className="statuspill" style={{ borderColor: "var(--line-2)" }}>
          {REVIVAL_APPLICATION_STATUS_LABELS[app.status]}
        </span>
      </div>

      <p style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.55, margin: 0 }}>{app.pitch}</p>

      <div className="mono" style={{ fontSize: 11, color: "var(--faint)", lineHeight: 1.6, wordBreak: "break-all" }}>
        team: {app.teamSize} / {app.teamMembers || "-"}
        <br />
        payout wallet: {app.payoutWallet}
        {app.contact && <> / contact: {app.contact}</>}
        {app.priorWork && (
          <>
            <br />
            prior work: {app.priorWork}
          </>
        )}
        {app.deliveryProof && (
          <>
            <br />
            delivered: {app.deliveryProof}
          </>
        )}
      </div>

      {rowError && <span style={{ fontSize: 12, color: "var(--red, #ff5d6c)" }}>{rowError}</span>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {app.status === "pending" && (
          <>
            <input
              style={{ ...inputStyle, width: 130 }}
              placeholder="Bounty SOL"
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-solid btn-sm"
              disabled={busy}
              onClick={() =>
                run(async () =>
                  reviewRevivalApplication(await token(), {
                    applicationId: app.id,
                    decision: "approve",
                    bountyAmountSol: Number(bounty),
                  }),
                )
              }
            >
              Approve team
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={busy}
              onClick={() =>
                run(async () =>
                  reviewRevivalApplication(await token(), { applicationId: app.id, decision: "reject" }),
                )
              }
            >
              Reject
            </button>
          </>
        )}

        {app.status === "approved" && (
          <>
            <input
              style={{ ...inputStyle, flex: 1, minWidth: 200 }}
              placeholder="Pump.fun bounty URL (optional)"
              value={pumpUrl}
              onChange={(e) => setPumpUrl(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-solid btn-sm"
              disabled={busy}
              onClick={() =>
                run(async () =>
                  reviewRevivalApplication(await token(), {
                    applicationId: app.id,
                    decision: "fund",
                    bountyPumpfunUrl: pumpUrl,
                  }),
                )
              }
            >
              Mark bounty funded
            </button>
          </>
        )}

        {(app.status === "delivered" || app.status === "funded") && (
          <>
            <input
              style={{ ...inputStyle, flex: 1, minWidth: 200 }}
              placeholder="Payout tx signature"
              value={payoutTx}
              onChange={(e) => setPayoutTx(e.target.value)}
            />
            <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
              {fmtSol(app.bountyAmountSol)}
            </span>
            <button
              type="button"
              className="btn btn-solid btn-sm"
              disabled={busy}
              onClick={() =>
                run(async () =>
                  recordRevivalPayout(await token(), {
                    applicationId: app.id,
                    payoutTx,
                    amountSol: app.bountyAmountSol ?? 0,
                  }),
                )
              }
            >
              Record payout
            </button>
          </>
        )}
      </div>
    </article>
  );
}
