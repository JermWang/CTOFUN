"use client";

import * as React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

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
            accentColor: "#04ff00",
            logo: undefined,
            walletChainType: "solana-only",
            walletList: ["detected_solana_wallets", "phantom", "solflare", "backpack", "jupiter"],
          },
          loginMethods: ["wallet"],
          externalWallets: {
            walletConnect: { enabled: false },
            solana: {
              connectors: toSolanaWalletConnectors({ shouldAutoConnect: false }),
            },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </PrivyConfiguredContext.Provider>
  );
}
