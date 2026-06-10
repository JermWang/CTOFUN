"use client";

import * as React from "react";
import { markRevivalDelivered } from "@/app/actions";
import { WithPrivy } from "@/components/with-privy";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  color: "var(--ink)",
  border: "1px solid var(--line-2)",
  background: "rgba(255,255,255,.62)",
  fontSize: 13,
  outline: "none",
  fontFamily: "var(--sans)",
};

/**
 * Owner-gated: anyone can open this, but the server action only accepts the
 * team that actually owns the application. Keeps the revivals board simple
 * without needing per-viewer identity on the server render.
 */
export function RevivalDeliverForm({ applicationId, symbol }: { applicationId: string; symbol: string }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [proof, setProof] = React.useState("");
  const [links, setLinks] = React.useState("");

  if (done) {
    return (
      <div className="mono" style={{ fontSize: 11, color: "var(--green-dim)", marginTop: 12 }}>
        Delivery submitted for review.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-outline btn-sm"
        style={{ marginTop: 12 }}
        onClick={() => setOpen(true)}
      >
        Are you this team? Submit delivery
      </button>
    );
  }

  return (
    <WithPrivy>
      {(privy) => (
        <form
          style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!privy.configured) return setError("Wallet login isn't configured.");
            if (!privy.authenticated) return privy.login?.();
            setPending(true);
            setError("");
            const token = await privy.getToken();
            const res = await markRevivalDelivered(token, {
              applicationId,
              proof,
              links: links.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
            });
            setPending(false);
            if (res.ok) setDone(true);
            else setError(res.error ?? "Delivery failed.");
          }}
        >
          <textarea
            style={{ ...inputStyle, minHeight: 80, lineHeight: 1.5 }}
            placeholder={`What did your team ship for $${symbol}?`}
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            required
          />
          <input
            style={inputStyle}
            placeholder="Proof links (new site, X, Telegram…), comma-separated"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
          />
          {error && <span style={{ fontSize: 12, color: "var(--red, #ff5d6c)" }}>{error}</span>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn-solid btn-sm" disabled={pending}>
              {pending ? "Submitting…" : privy.authenticated ? "Submit delivery" : "Connect"}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </WithPrivy>
  );
}
