"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrivyConfigured } from "@/components/providers";
import { shortAddress } from "@/lib/utils";

function ConnectedAuthButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <Button size="sm" variant="outline" disabled>
        …
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button size="sm" onClick={() => login()}>
        <Wallet /> Connect
      </Button>
    );
  }

  const address =
    user?.wallet?.address ??
    (user?.email?.address as string | undefined) ??
    "account";

  return (
    <div className="flex items-center gap-2">
      <span className="hidden rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-xs text-muted-foreground sm:inline">
        {shortAddress(address)}
      </span>
      <Button size="icon" variant="outline" onClick={() => logout()} title="Log out">
        <LogOut />
      </Button>
    </div>
  );
}

export function AuthButton() {
  const configured = usePrivyConfigured();

  if (!configured) {
    return (
      <Button
        size="sm"
        variant="outline"
        title="Set NEXT_PUBLIC_PRIVY_APP_ID to enable login"
        disabled
      >
        <Wallet /> Connect
      </Button>
    );
  }

  return <ConnectedAuthButton />;
}
