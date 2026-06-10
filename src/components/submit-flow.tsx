"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitDeadCoin } from "@/app/actions";
import { AsciiShader, fmtNum, fmtUsd, SourceBadge } from "@/components/protocol-ui";
import { WithPrivy, type PrivyAccess } from "@/components/with-privy";

export interface KnownToken {
  mint: string;
  sym: string;
  name: string;
  ath: number;
  replies: number;
  dormant: number;
  migrated: boolean;
  last: string;
  chartUrl?: string;
  marketCap?: number;
}

const CATS = [
  "OG / 4chan",
  "Classic",
  "Animals",
  "Dogs",
  "Cats",
  "Frogs",
  "TikTok",
  "2024 Meta",
  "AI",
  "Politics",
  "Anime",
  "Gaming",
  "Celebrities",
  "Absurdist",
];

const CAT_SLUG: Record<string, string> = {
  "OG / 4chan": "og",
  Classic: "classic",
  Animals: "animals",
  Dogs: "dogs",
  Cats: "cats",
  Frogs: "frogs",
  TikTok: "tiktok",
  "2024 Meta": "y2024",
  AI: "ai",
  Politics: "politics",
  Anime: "anime",
  Gaming: "gaming",
  Celebrities: "celebs",
  Absurdist: "absurd",
};

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

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--faint)",
          marginBottom: 7,
        }}
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

export function SubmitFlow({ known }: { known: KnownToken[] }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [submittedName, setSubmittedName] = React.useState("");
  const [detected, setDetected] = React.useState<KnownToken | null>(null);
  const [form, setForm] = React.useState({
    address: "",
    name: "",
    ticker: "",
    why: "",
    risk: "",
    cats: [] as string[],
    ack: false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setError("");
    setForm((f) => ({ ...f, [k]: v }));
  };

  const detect = React.useCallback(() => {
    const needle = form.address.trim().toLowerCase();
    if (needle.length < 8) return;
    const hit = known.find((c) => c.mint.toLowerCase() === needle || needle.includes(c.sym.toLowerCase()));
    if (hit) {
      setDetected(hit);
      setForm((f) => ({ ...f, name: hit.name, ticker: hit.sym }));
      return;
    }
    const fallback: KnownToken = {
      mint: form.address.trim(),
      name: "Token revival request",
      sym: form.address.trim().slice(0, 4).toUpperCase(),
      ath: 0,
      replies: 0,
      dormant: 0,
      migrated: false,
      last: "-",
    };
    setDetected(fallback);
    setForm((f) => ({ ...f, name: f.name || fallback.name, ticker: f.ticker || fallback.sym }));
  }, [form.address, known]);

  const toggleCat = (v: string) =>
    setForm((f) => ({ ...f, cats: f.cats.includes(v) ? f.cats.filter((x) => x !== v) : [...f.cats, v] }));

  const canSubmit =
    form.address.trim().length >= 8 &&
    form.name.trim().length > 0 &&
    form.ticker.trim().length > 0 &&
    form.why.trim().length >= 12 &&
    form.ack;

  const persist = async (privy: PrivyAccess) => {
    if (!privy.configured) {
      setError("Wallet login is not configured yet.");
      return;
    }
    if (!privy.authenticated) {
      privy.login?.();
      return;
    }
    if (!canSubmit) {
      setError("Add the mint, token name, ticker, revival note, and acknowledgement.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const token = await privy.getToken();
      const res = await submitDeadCoin(token, {
        name: form.name,
        ticker: form.ticker,
        contractAddress: form.address,
        chain: "solana",
        chartUrl: detected?.chartUrl,
        marketCap: detected?.marketCap ?? detected?.ath,
        reasonDied: detected?.dormant
          ? `Holder requested revival. Last known activity: ${detected.last}; dormant for ${detected.dormant} days.`
          : "Holder requested revival. Dormancy should be reviewed by the council.",
        reasonRevive: form.why,
        riskNotes: form.risk,
        categories: form.cats.map((c) => CAT_SLUG[c]).filter(Boolean),
      });
      if (!res.ok) {
        setError(res.error ?? "Could not submit this token.");
        return;
      }
      setSubmittedName(form.name);
      router.refresh();
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const resetAll = () => {
    setSubmittedName("");
    setDetected(null);
    setError("");
    setForm({ address: "", name: "", ticker: "", why: "", risk: "", cats: [], ack: false });
  };

  return (
    <WithPrivy>
      {(privy) => (
        <div className="proto">
          <section className="hero lq-frame" style={{ paddingBottom: 4 }}>
            <AsciiShader opacity={0.08} mask="head" cols={170} rows={22} fontSize={13} />
            <div className="wrap" style={{ position: "relative", zIndex: 1, paddingTop: 38, paddingBottom: 12 }}>
              <div className="eyebrow" style={{ letterSpacing: ".2em" }}>
                REQUEST A REVIVAL
              </div>
              <h1 style={{ fontSize: 38, fontWeight: 650, letterSpacing: "0", margin: "12px 0 8px" }}>
                Ask the council to revive a token
              </h1>
              <p style={{ color: "var(--dim)", maxWidth: 620, lineHeight: 1.6 }}>
                Paste a Solana mint, tell us why holders want it back, and submit. The server verifies your connected
                wallet holds that exact SPL token before accepting the request.
              </p>
            </div>
          </section>

          <section className="section tight wrap">
            {submittedName ? (
              <div className="lq-glass" style={{ padding: "42px 30px", textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
                <div className="eyebrow" style={{ letterSpacing: ".16em" }}>
                  REQUEST RECEIVED
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 650, margin: "12px 0 0" }}>
                  {submittedName} is in the review queue
                </h2>
                <p style={{ color: "var(--dim)", maxWidth: 480, margin: "12px auto 0", lineHeight: 1.6 }}>
                  The council can now check token safety, holder interest, and whether a bounty-backed CTO campaign makes sense.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
                  <Link className="btn btn-solid" href="/graveyard">
                    View graveyard
                  </Link>
                  <button className="btn btn-outline" onClick={resetAll}>
                    Request another
                  </button>
                </div>
              </div>
            ) : (
              <div className="detail">
                <aside className="lq-glass" style={{ padding: 20, alignSelf: "start", order: 2 }}>
                  <div className="eyebrow" style={{ letterSpacing: ".16em", marginBottom: 12 }}>
                    HOLDER GATE
                  </div>
                  <div className="lq-soft" style={{ padding: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 650 }}>Token-holder requests</div>
                    <p style={{ margin: "8px 0 0", color: "var(--dim)", fontSize: 12.5, lineHeight: 1.55 }}>
                      Submissions require wallet login. Your connected Solana wallet must hold the token mint you are
                      asking CTO.fun to revive.
                    </p>
                  </div>
                  {detected && (
                    <div className="lq-soft" style={{ padding: 14, marginTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{detected.name}</div>
                          <div className="mono" style={{ fontSize: 11, color: "var(--green)", marginTop: 2 }}>
                            ${detected.sym}
                          </div>
                        </div>
                        <SourceBadge />
                      </div>
                      <div className="mtiles" style={{ marginTop: 12 }}>
                        {([
                          ["Dormant", detected.dormant ? detected.dormant + "d" : "-"],
                          ["ATH", detected.ath ? fmtUsd(detected.ath) : "-"],
                          ["Replies", fmtNum(detected.replies)],
                          ["Graduated", detected.migrated ? "Yes" : "No"],
                        ] as [string, string][]).map(([k, v]) => (
                          <div key={k} className="lq-soft mtile">
                            <div className="k">{k}</div>
                            <div className="v">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>

                <div className="lq-glass" style={{ padding: 22, order: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <Field label="Token mint" hint="Paste the Solana mint for the token holders want revived.">
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          style={inputStyle}
                          value={form.address}
                          onChange={(e) => {
                            set("address", e.target.value);
                            setDetected(null);
                          }}
                          placeholder="Solana mint address"
                        />
                        <button
                          className="btn btn-outline"
                          style={{ flexShrink: 0 }}
                          onClick={detect}
                          disabled={form.address.trim().length < 8}
                        >
                          Lookup
                        </button>
                      </div>
                    </Field>

                    <div className="grid g2" style={{ gap: 14 }}>
                      <Field label="Token name">
                        <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Token name" />
                      </Field>
                      <Field label="Ticker">
                        <input style={inputStyle} value={form.ticker} onChange={(e) => set("ticker", e.target.value)} placeholder="TICKER" />
                      </Field>
                    </div>

                    <Field label="Why should holders revive it?">
                      <textarea
                        value={form.why}
                        onChange={(e) => set("why", e.target.value)}
                        placeholder="Tell the council why this token still has holders, lore, memes, or a community worth organizing."
                        style={{ ...inputStyle, minHeight: 108, padding: "12px 14px", resize: "vertical", lineHeight: 1.5 }}
                      />
                    </Field>

                    <Field label="Risk notes" hint="Optional, but useful: flag thin liquidity, holder concentration, or suspicious history.">
                      <textarea
                        value={form.risk}
                        onChange={(e) => set("risk", e.target.value)}
                        placeholder="Optional safety context"
                        style={{ ...inputStyle, minHeight: 76, padding: "12px 14px", resize: "vertical", lineHeight: 1.5 }}
                      />
                    </Field>

                    <Field label="Category">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {CATS.map((c) => (
                          <button
                            key={c}
                            onClick={() => toggleCat(c)}
                            className="lq-chip"
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "8px 13px",
                              borderRadius: 999,
                              cursor: "pointer",
                              fontFamily: "var(--sans)",
                              border: "1px solid " + (form.cats.includes(c) ? "rgba(118,92,255,.36)" : "var(--line-2)"),
                              background: form.cats.includes(c) ? "rgba(118,92,255,.1)" : "rgba(255,255,255,.5)",
                              color: form.cats.includes(c) ? "var(--violet)" : "var(--dim)",
                            }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <label
                      className="lq-soft"
                      style={{ display: "flex", gap: 12, padding: 14, cursor: "pointer", alignItems: "flex-start" }}
                    >
                      <input
                        type="checkbox"
                        checked={form.ack}
                        onChange={(e) => set("ack", e.target.checked)}
                        style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--green)" }}
                      />
                      <span style={{ fontSize: 12.5, color: "var(--dim)", lineHeight: 1.5 }}>
                        I understand this is a community takeover request, not financial advice, not affiliated with the
                        original developer, and not a promise of price recovery.
                      </span>
                    </label>

                    {error && (
                      <div
                        className="lq-soft"
                        style={{ padding: 13, borderColor: "rgba(217,47,80,.24)", color: "var(--red)", fontSize: 13 }}
                      >
                        {error}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <Link className="btn btn-outline" href="/discover">
                        Cancel
                      </Link>
                      <button
                        className="btn btn-solid"
                        disabled={pending || (!privy.authenticated ? false : !canSubmit)}
                        style={{ opacity: pending || (!privy.authenticated ? false : canSubmit) ? 1 : 0.45 }}
                        onClick={() => void persist(privy)}
                      >
                        {!privy.authenticated ? "Connect wallet" : pending ? "Submitting..." : "Request revival"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </WithPrivy>
  );
}
