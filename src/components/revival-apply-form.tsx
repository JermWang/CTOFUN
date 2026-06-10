"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { applyToReviveToken } from "@/app/actions";
import { WithPrivy, type PrivyAccess } from "@/components/with-privy";

export interface ApplyTokenInfo {
  mint: string;
  name: string;
  symbol: string;
  imageUrl: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "0 14px",
  borderRadius: 12,
  color: "var(--ink)",
  border: "1px solid var(--line-2)",
  background: "rgba(255,255,255,.62)",
  fontSize: 14,
  outline: "none",
  fontFamily: "var(--sans)",
};

const areaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 96,
  padding: "12px 14px",
  lineHeight: 1.5,
  resize: "vertical",
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <div
        className="mono"
        style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 7 }}
      >
        {label}
      </div>
      {children}
      {hint && (
        <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 6, lineHeight: 1.45 }}>
          {hint}
        </div>
      )}
    </label>
  );
}

export function RevivalApplyForm({ token }: { token: ApplyTokenInfo }) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [form, setForm] = React.useState({
    teamName: "",
    pitch: "",
    plan: "",
    teamSize: "1",
    teamMembers: "",
    priorWork: "",
    payoutWallet: "",
    contact: "",
    ack: false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setError("");
    setForm((f) => ({ ...f, [k]: v }));
  };

  const canSubmit =
    form.teamName.trim().length > 0 &&
    form.pitch.trim().length >= 80 &&
    form.payoutWallet.trim().length >= 32 &&
    form.ack;

  const submit = async (privy: PrivyAccess) => {
    if (!privy.configured) {
      setError("Wallet login is not configured yet.");
      return;
    }
    if (!privy.authenticated) {
      privy.login?.();
      return;
    }
    if (!canSubmit) {
      setError("Add your team name, an 80+ char pitch, a payout wallet, and the acknowledgement.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const accessToken = await privy.getToken();
      const res = await applyToReviveToken(accessToken, {
        mint: token.mint,
        tokenName: token.name,
        tokenSymbol: token.symbol,
        tokenImageUrl: token.imageUrl,
        teamName: form.teamName,
        pitch: form.pitch,
        plan: form.plan,
        teamSize: Number(form.teamSize) || 1,
        teamMembers: form.teamMembers,
        priorWork: form.priorWork,
        payoutWallet: form.payoutWallet,
        contact: form.contact,
      });
      setPending(false);
      if (res.ok) setDone(true);
      else setError(res.error ?? "Application failed.");
    } catch {
      setPending(false);
      setError("Application failed.");
    }
  };

  if (done) {
    return (
      <div className="lq-soft" style={{ padding: 24, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <CheckCircle2 size={22} style={{ color: "var(--green)", flex: "0 0 auto", marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 650, color: "var(--ink)" }}>Application submitted</div>
          <p style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.6, margin: "6px 0 14px" }}>
            Your team&apos;s bid to lead the ${token.symbol} revival is in review. If selected, CTO.fun funds a SOL
            bounty on Pump.fun — deliver the revival and claim it as startup capital. We&apos;ll reach out via your
            contact.
          </p>
          <Link className="btn btn-solid" href="/revivals">
            View active revivals -&gt;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <WithPrivy>
      {(privy) => (
        <form
          className="lq-soft"
          style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}
          onSubmit={(e) => {
            e.preventDefault();
            submit(privy);
          }}
        >
          <Field label="Team / handle">
            <input
              style={inputStyle}
              value={form.teamName}
              onChange={(e) => set("teamName", e.target.value)}
              placeholder="Who's taking this over?"
              maxLength={120}
            />
          </Field>

          <Field label="Why your team" hint="Make the case: who you are, why you can revive this, what you'll ship first.">
            <textarea
              style={areaStyle}
              value={form.pitch}
              onChange={(e) => set("pitch", e.target.value)}
              placeholder={`Pitch your takeover of $${token.symbol}…`}
              maxLength={4000}
            />
          </Field>

          <Field label="Revival plan (optional)" hint="Rough roadmap — identity, socials, community, first 30 days.">
            <textarea
              style={areaStyle}
              value={form.plan}
              onChange={(e) => set("plan", e.target.value)}
              placeholder="Your plan to bring it back…"
              maxLength={4000}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 14 }}>
            <Field label="Team size">
              <input
                type="number"
                min={1}
                max={99}
                style={inputStyle}
                value={form.teamSize}
                onChange={(e) => set("teamSize", e.target.value)}
              />
            </Field>
            <Field label="Team members" hint="X / Telegram handles or links, comma-separated.">
              <input
                style={inputStyle}
                value={form.teamMembers}
                onChange={(e) => set("teamMembers", e.target.value)}
                placeholder="@designer, @dev, @community…"
                maxLength={2000}
              />
            </Field>
          </div>

          <Field label="Proof of competence (optional)" hint="Links to past work, revivals, launches, or portfolios.">
            <textarea
              style={{ ...areaStyle, minHeight: 72 }}
              value={form.priorWork}
              onChange={(e) => set("priorWork", e.target.value)}
              placeholder="https://… , https://…"
              maxLength={2000}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Payout wallet (SOL)" hint="Where the bounty lands if you're selected and deliver.">
              <input
                style={inputStyle}
                value={form.payoutWallet}
                onChange={(e) => set("payoutWallet", e.target.value)}
                placeholder="Solana address"
                maxLength={64}
              />
            </Field>
            <Field label="Contact (optional)" hint="X DM, Telegram, or email so we can reach you.">
              <input
                style={inputStyle}
                value={form.contact}
                onChange={(e) => set("contact", e.target.value)}
                placeholder="@you  /  you@email"
                maxLength={200}
              />
            </Field>
          </div>

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.ack}
              onChange={(e) => set("ack", e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>
              I understand this is a community takeover, not the original team, and not a promise of price recovery.
              Bounties are paid on delivered, reviewed work only.
            </span>
          </label>

          {error && <p style={{ fontSize: 13, color: "var(--red, #ff5d6c)" }}>{error}</p>}

          {!privy.configured ? (
            <button type="button" className="btn btn-solid" disabled style={{ alignSelf: "flex-start", opacity: 0.6 }}>
              Connect to apply
            </button>
          ) : !privy.authenticated ? (
            <button type="button" className="btn btn-solid" onClick={() => privy.login?.()} style={{ alignSelf: "flex-start" }}>
              Connect to apply
            </button>
          ) : (
            <button type="submit" className="btn btn-solid" disabled={pending} style={{ alignSelf: "flex-start" }}>
              {pending ? "Submitting…" : "Submit application"}
            </button>
          )}
        </form>
      )}
    </WithPrivy>
  );
}
