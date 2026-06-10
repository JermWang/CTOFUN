import "server-only";
import { PrivyClient } from "@privy-io/server-auth";
import { PublicKey } from "@solana/web3.js";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

let _privy: PrivyClient | null = null;
function privy(): PrivyClient {
  if (!_privy) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const secret = process.env.PRIVY_APP_SECRET;
    if (!appId || !secret) throw new Error("Privy server credentials are not configured");
    _privy = new PrivyClient(appId, secret);
  }
  return _privy;
}

export interface AuthedUser {
  id: string; // internal users.id
  privyId: string;
  wallets: string[];
  wallet: string | null;
  email: string | null;
}

/**
 * Admin allowlist. CTO.fun operators who can vet revival applications, assign
 * bounties, and record payouts. Configured via env (comma-separated):
 *   ADMIN_PRIVY_IDS  - Privy user ids
 *   ADMIN_WALLETS    - Solana wallet addresses
 * With neither set, no one is an admin (review surfaces stay locked).
 */
function allowlist(envValue: string | undefined): string[] {
  return (envValue ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function canonicalSolanaAddress(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    return new PublicKey(value.trim()).toBase58();
  } catch {
    return null;
  }
}

function adminWalletAllowlist(): Set<string> {
  const wallets = allowlist(process.env.ADMIN_WALLETS)
    .map(canonicalSolanaAddress)
    .filter((wallet): wallet is string => Boolean(wallet));
  return new Set(wallets);
}

export function isAdmin(user: Pick<AuthedUser, "privyId" | "wallet" | "wallets">): boolean {
  const ids = allowlist(process.env.ADMIN_PRIVY_IDS);
  if (ids.includes(user.privyId)) return true;
  const wallets = adminWalletAllowlist();
  if (wallets.size === 0) return false;
  return user.wallets.some((wallet) => wallets.has(wallet));
}

/**
 * Verifies a Privy access token (sent from the client) and upserts the matching
 * row in `users`, returning the internal user. Throws if the token is missing
 * or invalid - callers should treat a throw as "unauthenticated".
 */
export async function getOrCreateUser(accessToken: string | null | undefined): Promise<AuthedUser> {
  if (!accessToken) throw new Error("Not authenticated");

  const { userId: privyId } = await privy().verifyAuthToken(accessToken);

  // Never trust wallet addresses sent by the browser. Admin checks use only
  // server-fetched Solana wallets bound to the verified Privy access token.
  let wallets: string[] | null = null;
  let email: string | null | undefined;
  try {
    const user = await privy().getUser(privyId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const acct of (user.linkedAccounts ?? []) as any[]) {
      if (acct.type === "wallet" && acct.chainType === "solana") {
        const address = canonicalSolanaAddress(acct.address);
        if (address) wallets = [...(wallets ?? []), address];
      }
      if (email === undefined && acct.type === "email" && acct.address) email = acct.address;
    }
  } catch {
    // Token verified but profile fetch failed. Keep existing DB profile data
    // instead of overwriting wallet/email with null values.
  }

  const admin = createSupabaseAdminClient();
  const profilePatch: { privy_id: string; wallet_address?: string | null; email?: string | null } = { privy_id: privyId };
  if (wallets !== null) profilePatch.wallet_address = wallets[0] ?? null;
  if (email !== undefined) profilePatch.email = email;

  const { data, error } = await admin
    .from("users")
    .upsert(profilePatch, { onConflict: "privy_id", ignoreDuplicates: false })
    .select("id,wallet_address,email")
    .single();

  if (error || !data) throw new Error(`Failed to upsert user: ${error?.message ?? "unknown"}`);

  const storedWallet = canonicalSolanaAddress(data.wallet_address);
  const userWallets = wallets ?? (storedWallet ? [storedWallet] : []);
  return {
    id: data.id,
    privyId,
    wallets: [...new Set(userWallets)],
    wallet: userWallets[0] ?? null,
    email: email === undefined ? (data.email ?? null) : email,
  };
}
