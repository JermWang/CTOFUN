"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Loader2, Search } from "lucide-react";
import { lookupTokenForSubmission, submitDeadCoin, type SubmissionTokenLookup } from "@/app/actions";
import { AsciiShader, fmtNum, fmtUsd, SourceBadge } from "@/components/protocol-ui";
import { WithPrivy, type PrivyAccess } from "@/components/with-privy";

export type KnownToken = SubmissionTokenLookup;

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

const CAT_BY_SLUG = new Map(Object.entries(CAT_SLUG).map(([label, slug]) => [slug, label]));

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

function LookupStatus({ state }: { state: "idle" | "checking" | "found" | "missing" }) {
  if (state === "found") {
    return (
      <span className="submit-lookup-pill found">
        <CheckCircle2 size={14} /> Detected
      </span>
    );
  }
  if (state === "checking") {
    return (
      <span className="submit-lookup-pill">
        <Loader2 size={14} className="submit-spin" /> Detecting
      </span>
    );
  }
  if (state === "missing") {
    return (
      <span className="submit-lookup-pill missing">
        <Search size={14} /> Check CA
      </span>
    );
  }
  return (
    <span className="submit-lookup-pill idle">
      <Search size={14} /> Auto
    </span>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="submit-token-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TokenLink({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="submit-token-link">
      {label} <ExternalLink size={12} />
    </a>
  );
}

function DetectedTokenCard({
  token,
  state,
  message,
}: {
  token: KnownToken | null;
  state: "idle" | "checking" | "found" | "missing";
  message: string;
}) {
  if (!token) {
    return (
      <div className={"submit-token-empty " + (state === "missing" ? "missing" : "")}>
        <div className="submit-token-empty-icon">
          {state === "checking" ? <Loader2 size={18} className="submit-spin" /> : <Search size={18} />}
        </div>
        <div>
          <strong>
            {state === "missing" ? "Token not detected" : state === "checking" ? "Waiting for token details" : "Drop in a CA"}
          </strong>
          <span>{message || "The token name, ticker, artwork, and market details will appear here automatically."}</span>
        </div>
      </div>
    );
  }

  const description = token.description || "Pump.fun token profile detected from the contract address.";
  return (
    <article className="submit-token-card">
      <div className="submit-token-art">
        <img src={token.imageUrl} alt={`${token.name} token artwork`} />
        <div className="submit-token-art-badge">
          <SourceBadge />
        </div>
      </div>

      <div className="submit-token-body">
        <div className="submit-token-head">
          <div>
            <h3>{token.name}</h3>
            <p>${token.sym}</p>
          </div>
          <span className="submit-token-fit">{token.qual > 0 ? `${token.qual} fit` : token.migrated ? "Graduated" : "Detected"}</span>
        </div>

        <p className="submit-token-desc">{description}</p>

        <div className="submit-token-links">
          <TokenLink href={token.pumpUrl} label="Pump" />
          <TokenLink href={token.chartUrl} label="Chart" />
          <TokenLink href={token.twitterUrl} label="X/Twitter" />
          <TokenLink href={token.telegramUrl} label="Telegram" />
          <TokenLink href={token.websiteUrl} label="Website" />
        </div>

        <div className="submit-token-metrics">
          <DetailMetric label="Market cap" value={token.marketCap ? fmtUsd(token.marketCap) : "-"} />
          <DetailMetric label="ATH" value={token.ath ? fmtUsd(token.ath) : "-"} />
          <DetailMetric label="Dormant" value={token.dormant ? `${token.dormant}d` : "-"} />
          <DetailMetric label={token.holders != null ? "Holders" : "Replies"} value={token.holders != null ? fmtNum(token.holders) : fmtNum(token.replies)} />
        </div>

        {(token.reasons.length > 0 || token.categories.length > 0) && (
          <div className="submit-token-tags">
            {[...token.categories, ...token.reasons].slice(0, 5).map((item) => (
              <span key={item}>{CAT_BY_SLUG.get(item) ?? item}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function SubmitFlow({ known }: { known: KnownToken[] }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [submittedName, setSubmittedName] = React.useState("");
  const [detected, setDetected] = React.useState<KnownToken | null>(null);
  const [lookupState, setLookupState] = React.useState<"idle" | "checking" | "found" | "missing">("idle");
  const [lookupMessage, setLookupMessage] = React.useState("");
  const lookupRun = React.useRef(0);
  const [form, setForm] = React.useState({
    address: "",
    why: "",
    risk: "",
    cats: [] as string[],
    ack: false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setError("");
    setForm((f) => ({ ...f, [k]: v }));
  };

  const applyDetectedToken = React.useCallback((token: KnownToken) => {
    setDetected(token);
    setLookupState("found");
    setLookupMessage("");
    setForm((f) => ({
      ...f,
      cats: token.categories
        .map((category) => CAT_BY_SLUG.get(category) ?? category)
        .filter((category) => CATS.includes(category))
        .slice(0, 4),
    }));
  }, []);

  const detect = React.useCallback(async () => {
    const raw = form.address.trim();
    const needle = raw.toLowerCase();
    if (needle.length < 32) {
      setDetected(null);
      setLookupState("idle");
      setLookupMessage("");
      return;
    }

    const run = ++lookupRun.current;
    const hit = known.find((c) => c.mint.toLowerCase() === needle);
    if (hit) {
      applyDetectedToken(hit);
      return;
    }

    setDetected(null);
    setLookupState("checking");
    setLookupMessage("Detecting token profile...");
    const res = await lookupTokenForSubmission(raw);
    if (run !== lookupRun.current) return;
    if (res.ok && res.data) {
      applyDetectedToken(res.data);
      return;
    }
    setLookupState("missing");
    setLookupMessage(res.error ?? "We couldn't find this token yet. Check the address and try again.");
  }, [applyDetectedToken, form.address, known]);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      void detect();
    }, 450);
    return () => window.clearTimeout(id);
  }, [detect]);

  const toggleCat = (v: string) =>
    setForm((f) => ({ ...f, cats: f.cats.includes(v) ? f.cats.filter((x) => x !== v) : [...f.cats, v] }));

  const canSubmit =
    form.address.trim().length >= 8 &&
    Boolean(detected) &&
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
    if (!detected) {
      setError("Paste a token address so we can detect the token profile first.");
      return;
    }
    if (!canSubmit) {
      setError("Add your revival note and acknowledgement.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const token = await privy.getToken();
      const res = await submitDeadCoin(token, {
        name: detected.name,
        ticker: detected.sym,
        contractAddress: detected.mint,
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
      setSubmittedName(detected.name);
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
    setLookupState("idle");
    setLookupMessage("");
    setForm({ address: "", why: "", risk: "", cats: [], ack: false });
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
                Paste a Solana mint, tell us why the community wants it back, and submit it for the revival queue.
                Token holders are fast-tracked, while everyone else can still send a request for review.
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
                    REQUEST REVIEW
                  </div>
                  <div className="lq-soft" style={{ padding: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 650 }}>How submissions get approved</div>
                    <p style={{ margin: "8px 0 0", color: "var(--dim)", fontSize: 12.5, lineHeight: 1.55 }}>
                      CTO token holders get their token requests approved automatically. If you do not hold the token yet,
                      your request goes to review and appears on the site after approval.
                    </p>
                  </div>
                  <div className="lq-soft" style={{ padding: 14, marginTop: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 650 }}>What you still add</div>
                    <p style={{ margin: "8px 0 0", color: "var(--dim)", fontSize: 12.5, lineHeight: 1.55 }}>
                      We detect the token profile from the address. You add the revival case, social context, and any
                      safety notes the council should know.
                    </p>
                  </div>
                </aside>

                <div className="lq-glass" style={{ padding: 22, order: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <Field label="Token contract address" hint="Paste the CA. We'll detect the token profile and artwork automatically.">
                      <div className="submit-ca-row">
                        <input
                          style={inputStyle}
                          value={form.address}
                          onChange={(e) => {
                            set("address", e.target.value);
                            setDetected(null);
                            setLookupState(e.target.value.trim() ? "checking" : "idle");
                            setLookupMessage(e.target.value.trim() ? "Waiting for a full token address..." : "");
                          }}
                          placeholder="Solana mint address"
                        />
                        <LookupStatus state={lookupState} />
                      </div>
                    </Field>

                    <DetectedTokenCard token={detected} state={lookupState} message={lookupMessage} />

                    <Field label="Why should holders revive it?">
                      <textarea
                        value={form.why}
                        onChange={(e) => set("why", e.target.value)}
                        placeholder="Tell the council why this token still has holders, lore, memes, or a community worth organizing."
                        style={{ ...inputStyle, minHeight: 108, padding: "12px 14px", resize: "vertical", lineHeight: 1.5 }}
                      />
                    </Field>

                    <Field label="Social context and risk notes" hint="Keep Twitter/X, Telegram, holder group, or safety context here. Optional, but useful.">
                      <textarea
                        value={form.risk}
                        onChange={(e) => set("risk", e.target.value)}
                        placeholder="Links, X/Twitter context, community notes, thin liquidity, holder concentration, or suspicious history."
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
                        original launch team, and not a promise of price recovery.
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
