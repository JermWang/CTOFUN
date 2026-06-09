import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Read-only server client using the anon key. Safe for rendering public data
 * in Server Components.
 */
export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Server-only read client for public DTO rendering. Prefer service-role on the
 * server so public RLS does not need to expose raw tables/columns to browsers.
 */
export function createSupabaseReadClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createSupabaseAdminClient();
  }
  return createSupabaseServerClient();
}

/**
 * Privileged server client using the service-role key. Bypasses RLS — only use
 * inside server actions / route handlers AFTER verifying the caller's Privy
 * identity. Never import this into a Client Component.
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
