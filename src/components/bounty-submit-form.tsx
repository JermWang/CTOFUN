"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { WithPrivy } from "@/components/with-privy";
import { submitBountyWork } from "@/app/actions";

export function BountySubmitForm({
  bountyId,
  bountyTitle,
}: {
  bountyId: string;
  bountyTitle: string;
}) {
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  if (done) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle2 className="size-6 text-primary" />
          <div>
            <div className="font-semibold">Submission received</div>
            <div className="text-sm text-muted-foreground">
              It’s now pending review. You’ll be notified when it’s approved or needs changes.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <WithPrivy>
      {({ getToken, authenticated, configured, login }) => (
        <Card>
          <CardHeader>
            <CardTitle>Submit your work</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                const form = e.currentTarget;
                const fd = new FormData(form);
                setPending(true);
                const token = await getToken();
                const res = await submitBountyWork(token, {
                  bountyId,
                  submissionText: String(fd.get("text") ?? ""),
                  fileUrl: String(fd.get("file") ?? ""),
                  linkUrl: String(fd.get("link") ?? ""),
                });
                setPending(false);
                if (res.ok) setDone(true);
                else setError(res.error ?? "Submission failed");
              }}
            >
              <div>
                <Label htmlFor="text">Description</Label>
                <Textarea
                  id="text"
                  name="text"
                  className="mt-1.5"
                  placeholder={`Describe your deliverable for "${bountyTitle}"`}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="file">File / asset URL</Label>
                  <Input id="file" name="file" className="mt-1.5" placeholder="https://… (drive, ipfs, etc.)" />
                </div>
                <div>
                  <Label htmlFor="link">Proof link</Label>
                  <Input id="link" name="link" className="mt-1.5" placeholder="https://x.com/…  or  t.me/…" />
                </div>
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              {!configured ? (
                <Button type="button" disabled className="w-full sm:w-auto">
                  Connect to submit
                </Button>
              ) : !authenticated ? (
                <Button type="button" onClick={() => login?.()} className="w-full sm:w-auto">
                  Connect to submit
                </Button>
              ) : (
                <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                  {pending ? "Submitting…" : "Submit for review"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </WithPrivy>
  );
}
