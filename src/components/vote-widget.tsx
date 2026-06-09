"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WithPrivy } from "@/components/with-privy";
import { castVote, type VoteChoiceInput } from "@/app/actions";

interface Tally {
  revive: number;
  skip: number;
  research: number;
}

export function VoteWidget({ coinId, initial }: { coinId: string; initial: Tally }) {
  const [tally, setTally] = React.useState<Tally>(initial);
  const [pending, setPending] = React.useState<VoteChoiceInput | null>(null);
  const [mine, setMine] = React.useState<VoteChoiceInput | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const total = tally.revive + tally.skip + tally.research;
  const revivePct = total ? Math.round((tally.revive / total) * 100) : 0;

  return (
    <WithPrivy>
      {({ getToken, authenticated, configured, login }) => {
        const vote = async (choice: VoteChoiceInput) => {
          setError(null);
          if (!configured) return;
          if (!authenticated) {
            login?.();
            return;
          }
          setPending(choice);
          const token = await getToken();
          const res = await castVote(token, coinId, choice);
          setPending(null);
          if (res.ok && res.data) {
            setTally(res.data);
            setMine(choice);
          } else {
            setError(res.error ?? "Vote failed");
          }
        };

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <VoteButton
                label="Revive"
                count={tally.revive}
                tone="primary"
                active={mine === "revive"}
                pending={pending === "revive"}
                icon={<ThumbsUp />}
                onClick={() => vote("revive")}
              />
              <VoteButton
                label="Skip"
                count={tally.skip}
                tone="ghost"
                active={mine === "skip"}
                pending={pending === "skip"}
                icon={<ThumbsDown />}
                onClick={() => vote("skip")}
              />
              <VoteButton
                label="Research"
                count={tally.research}
                tone="ghost"
                active={mine === "needs_research"}
                pending={pending === "needs_research"}
                icon={<HelpCircle />}
                onClick={() => vote("needs_research")}
              />
            </div>

            <div className="rounded-md bg-muted/50 p-3 text-center">
              <div className="text-2xl font-bold text-primary tabular-nums">{revivePct}%</div>
              <div className="text-xs text-muted-foreground">want to revive · {total} votes</div>
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}
            {!configured && (
              <p className="text-xs text-muted-foreground">
                Connect a wallet to vote (set NEXT_PUBLIC_PRIVY_APP_ID).
              </p>
            )}
            {mine && <p className="text-xs text-primary">Your vote is counted. Tap another to change it.</p>}
          </div>
        );
      }}
    </WithPrivy>
  );
}

function VoteButton({
  label,
  count,
  tone,
  active,
  pending,
  icon,
  onClick,
}: {
  label: string;
  count: number;
  tone: "primary" | "ghost";
  active: boolean;
  pending: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? (tone === "primary" ? "default" : "secondary") : "outline"}
      onClick={onClick}
      disabled={pending}
      className="h-auto flex-col gap-1 py-3"
    >
      {icon}
      <span className="text-xs">{label}</span>
      <span className="text-sm font-bold tabular-nums">{count}</span>
    </Button>
  );
}
