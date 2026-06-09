"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Skull } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  computeRevivalScore,
  CTO_DISCLAIMER,
  MEME_CATEGORIES,
  type RevivalScoreInput,
} from "@/lib/domain";
import { scoreTone } from "@/components/blocks";
import { cn } from "@/lib/utils";
import { WithPrivy } from "@/components/with-privy";
import { submitDeadCoin } from "@/app/actions";
import { useRouter } from "next/navigation";

const SCORE_FIELDS: { key: keyof RevivalScoreInput; label: string }[] = [
  { key: "meme", label: "Meme" },
  { key: "community", label: "Community" },
  { key: "safety", label: "Safety" },
  { key: "liquidity", label: "Liquidity" },
  { key: "lore", label: "Lore" },
  { key: "ticker", label: "Ticker" },
  { key: "contributorInterest", label: "Contributor interest" },
];

export default function SubmitPage() {
  const [scores, setScores] = React.useState<RevivalScoreInput>({
    meme: 7,
    community: 5,
    safety: 7,
    liquidity: 5,
    lore: 6,
    ticker: 7,
    contributorInterest: 6,
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const toggleCategory = (slug: string) =>
    setCategories((cur) =>
      cur.includes(slug) ? cur.filter((c) => c !== slug) : [...cur, slug],
    );

  const revivalScore = computeRevivalScore(scores);

  const num = (formData: FormData, name: string): number | undefined => {
    const v = String(formData.get(name) ?? "");
    return v ? Number(v) : undefined;
  };
  const str = (formData: FormData, name: string): string => String(formData.get(name) ?? "");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    getToken: () => Promise<string | null>,
  ) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    setPending(true);
    const token = await getToken();
    const res = await submitDeadCoin(token, {
      name: str(formData, "name"),
      ticker: str(formData, "ticker"),
      contractAddress: str(formData, "contract"),
      chain: str(formData, "chain") || "solana",
      chartUrl: str(formData, "chart"),
      marketCap: num(formData, "mcap"),
      liquidity: num(formData, "liq"),
      holderCount: num(formData, "holders"),
      oldSocials: str(formData, "socials"),
      reasonDied: str(formData, "died"),
      reasonRevive: str(formData, "revive"),
      riskNotes: str(formData, "risks"),
      categories,
      scores,
    });
    setPending(false);
    if (res.ok) {
      setSubmitted(true);
      router.refresh();
    } else {
      setError(res.error ?? "Submission failed");
    }
  };
  const tone = scoreTone(revivalScore);

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Submitted to the Graveyard</h1>
        <p className="mt-2 text-muted-foreground">
          Your candidate has entered the Graveyard at status{" "}
          <span className="text-foreground">Newly Submitted</span>. Scouts and the
          Revival Council will review it next.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/graveyard">View the Graveyard</Link>
          </Button>
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <WithPrivy>
      {({ getToken, authenticated, configured, login }) => (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2">
        <Skull className="size-5 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Submit a Dead Coin</h1>
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Found an abandoned meme coin with a second life in it? Fill out the scout
        submission template. High-potential candidates go up for a community vote.
      </p>

      <form
        className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]"
        onSubmit={(e) => handleSubmit(e, getToken)}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The coin</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FieldInput id="name" label="Coin name" placeholder="Rugzilla" required />
              <FieldInput id="ticker" label="Ticker" placeholder="RUGZ" required />
              <div className="sm:col-span-2">
                <Label htmlFor="contract">Contract address</Label>
                <Input id="contract" name="contract" placeholder="Solana mint address" className="mt-1.5 font-mono" required />
              </div>
              <div>
                <Label htmlFor="chain">Chain</Label>
                <Select id="chain" name="chain" className="mt-1.5" defaultValue="solana">
                  <option value="solana">Solana</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="base">Base</option>
                  <option value="bsc">BSC</option>
                </Select>
              </div>
              <FieldInput id="chart" label="Chart link" placeholder="https://dexscreener.com/…" />
              <FieldInput id="mcap" label="Market cap (USD)" type="number" placeholder="41200" />
              <FieldInput id="liq" label="Liquidity (USD)" type="number" placeholder="9800" />
              <FieldInput id="holders" label="Holder count" type="number" placeholder="2143" />
              <FieldInput id="socials" label="Old socials" placeholder="t.me/…, x.com/…" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tag the coin&apos;s origin and theme. Pick all that fit.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {MEME_CATEGORIES.map((c) => {
                  const on = categories.includes(c.slug);
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => toggleCategory(c.slug)}
                      aria-pressed={on}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        on
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {c.emoji} {c.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>The story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="died">Why it died</Label>
                <Textarea id="died" name="died" className="mt-1.5" placeholder="Dev left, Telegram died, website expired…" required />
              </div>
              <div>
                <Label htmlFor="revive">Why it could be revived</Label>
                <Textarea id="revive" name="revive" className="mt-1.5" placeholder="Strong meme, loyal holders, memorable ticker…" required />
              </div>
              <div>
                <Label htmlFor="risks">Risks</Label>
                <Textarea id="risks" name="risks" className="mt-1.5" placeholder="Liquidity, distribution, contract concerns…" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scout scorecard</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {SCORE_FIELDS.map((f) => (
                <div key={f.key}>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={f.key}>{f.label}</Label>
                    <span className="text-sm font-medium tabular-nums">{scores[f.key]}/10</span>
                  </div>
                  <input
                    id={f.key}
                    type="range"
                    min={0}
                    max={10}
                    value={scores[f.key]}
                    onChange={(e) =>
                      setScores((s) => ({ ...s, [f.key]: Number(e.target.value) }))
                    }
                    className="mt-2 w-full accent-[var(--color-primary)]"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Side: live score + disclaimer */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Projected revival score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div
                  className={`text-5xl font-bold tabular-nums ${
                    tone === "primary"
                      ? "text-primary"
                      : tone === "secondary"
                        ? "text-secondary"
                        : tone === "warning"
                          ? "text-warning"
                          : "text-danger"
                  }`}
                >
                  {revivalScore}
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
              </div>
              <Progress className="mt-4" value={revivalScore} tone={tone} />
              <p className="mt-3 text-xs text-muted-foreground">
                Weighted from meme, community, safety, liquidity, lore, ticker, and
                contributor interest. 75+ is a strong candidate.
              </p>
              {!configured ? (
                <Button type="button" className="mt-5 w-full" disabled>
                  Connect to submit
                </Button>
              ) : !authenticated ? (
                <Button type="button" className="mt-5 w-full" onClick={() => login?.()}>
                  Connect wallet to submit
                </Button>
              ) : (
                <Button type="submit" className="mt-5 w-full" disabled={pending}>
                  {pending ? "Submitting…" : "Submit to the Graveyard"}
                </Button>
              )}
              {error && <p className="mt-2 text-xs text-danger">{error}</p>}
              <p className="mt-3 rounded-md border border-warning/20 bg-warning/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
                {CTO_DISCLAIMER}
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
      )}
    </WithPrivy>
  );
}

function FieldInput({
  id,
  label,
  name,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name ?? id} className="mt-1.5" {...props} />
    </div>
  );
}
