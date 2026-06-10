"use client";

import * as React from "react";
import {
  getReviewQueue,
  reviewRevivalApplication,
  recordRevivalPayout,
} from "@/app/actions";
import { WithPrivy, type PrivyAccess } from "@/components/with-privy";
import { REVIVAL_APPLICATION_STATUS_LABELS } from "@/lib/domain";
import { fmtSol } from "@/lib/format";
import type { RevivalApplication } from "@/lib/types";

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

export function AdminReviewPanel() {
  return <WithPrivy>{(privy) => <Panel privy={privy} />}</WithPrivy>;
}

function Panel({ privy }: { privy: PrivyAccess }) {
  const [queue, setQueue] = React.useState<RevivalApplication[] | null>(null);
  const [error, setError] = React.useState("");
  const started = React.useRef(false);

  // Awaits before any setState, so it never updates state synchronously.
  const load = React.useCallback(async () => {
    const token = await privy.getToken();
    const res = await getReviewQueue(token);
    if (res.ok) {
      setQueue(res.data ?? []);
      setError("");
    } else {
      setError(res.error ?? "Could not load.");
    }
  }, [privy]);

  React.useEffect(() => {
    if (privy.authenticated && !started.current) {
      started.current = true;
      load();
    }
  }, [privy.authenticated, load]);

  if (!privy.configured) {
    return <Notice text="Wallet login isn't configured yet." />;
  }
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
  if (queue === null) return <Notice text="Loading review queue…" />;
  if (queue.length === 0) return <Notice text="No applications yet." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {queue.map((app) => (
        <ReviewRow key={app.id} app={app} privy={privy} onDone={load} />
      ))}
    </div>
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
    <article className="lq-soft" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
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
        team: {app.teamSize} · {app.teamMembers || "—"}
        <br />
        payout wallet: {app.payoutWallet}
        {app.contact && <> · contact: {app.contact}</>}
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
