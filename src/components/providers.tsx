"use client";

import * as React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

/**
 * Context flag so UI can tell whether Privy is actually configured. When the
 * NEXT_PUBLIC_PRIVY_APP_ID env var is missing (e.g. before keys are added),
 * we skip mounting PrivyProvider entirely so the app still builds and runs.
 */
export const PrivyConfiguredContext = React.createContext(false);

export function usePrivyConfigured() {
  return React.useContext(PrivyConfiguredContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <PrivyConfiguredContext.Provider value={false}>
        {children}
      </PrivyConfiguredContext.Provider>
    );
  }

  return (
    <PrivyConfiguredContext.Provider value={true}>
      <PrivyProvider
        appId={appId}
        config={{
          appearance: {
            theme: "dark",
            accentColor: "#2dd47e",
            logo: undefined,
            walletChainType: "solana-only",
          },
          loginMethods: ["email", "wallet", "twitter"],
          embeddedWallets: {
            // Create a Solana embedded wallet for users who log in without one.
            solana: { createOnLogin: "users-without-wallets" },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </PrivyConfiguredContext.Provider>
  );
}
