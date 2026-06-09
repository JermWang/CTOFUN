import "server-only";
import { PrivyClient } from "@privy-io/server-auth";
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
  wallet: string | null;
  email: string | null;
}

/**
 * Verifies a Privy access token (sent from the client) and upserts the matching
 * row in `users`, returning the internal user. Throws if the token is missing
 * or invalid — callers should treat a throw as "unauthenticated".
 */
export async function getOrCreateUser(accessToken: string | null | undefined): Promise<AuthedUser> {
  if (!accessToken) throw new Error("Not authenticated");

  const { userId: privyId } = await privy().verifyAuthToken(accessToken);

  // Pull wallet/email from the Privy user record (best-effort).
  let wallet: string | null = null;
  let email: string | null = null;
  try {
    const user = await privy().getUser(privyId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const acct of (user.linkedAccounts ?? []) as any[]) {
      if (!wallet && acct.type === "wallet" && acct.address) wallet = acct.address;
      if (!email && acct.type === "email" && acct.address) email = acct.address;
    }
  } catch {
    // Token verified but profile fetch failed — proceed with what we have.
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("users")
    .upsert(
      { privy_id: privyId, wallet_address: wallet, email },
      { onConflict: "privy_id", ignoreDuplicates: false },
    )
    .select("id")
    .single();

  if (error || !data) throw new Error(`Failed to upsert user: ${error?.message ?? "unknown"}`);
  return { id: data.id, privyId, wallet, email };
}
