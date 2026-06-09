"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyConfigured } from "@/components/providers";

export interface PrivyAccess {
  /** Returns a fresh access token, or null when Privy isn't configured. */
  getToken: () => Promise<string | null>;
  authenticated: boolean;
  configured: boolean;
  login: (() => void) | null;
}

function Inner({ children }: { children: (a: PrivyAccess) => React.ReactNode }) {
  const { getAccessToken, authenticated, login } = usePrivy();
  return (
    <>
      {children({
        getToken: getAccessToken,
        authenticated,
        configured: true,
        login: () => login(),
      })}
    </>
  );
}

/**
 * Render-prop wrapper that exposes a Privy access-token getter. When Privy is
 * not configured (no app ID) it renders children with a null token and
 * `configured: false`, so callers never call `usePrivy` outside the provider.
 */
export function WithPrivy({ children }: { children: (a: PrivyAccess) => React.ReactNode }) {
  const configured = usePrivyConfigured();
  if (!configured) {
    return (
      <>
        {children({
          getToken: async () => null,
          authenticated: false,
          configured: false,
          login: null,
        })}
      </>
    );
  }
  return <Inner>{children}</Inner>;
}
