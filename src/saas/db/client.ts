import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config'

/**
 * Remote persistence client. Clerk is registered as a Supabase Third-Party Auth
 * provider — we pass Clerk's raw session token via the modern `accessToken` option
 * (no JWT template). Supabase validates it against Clerk's JWKS and RLS keys off
 * `auth.jwt() ->> 'sub'` (the Clerk user id stored as owner_id).
 */
export type Db = SupabaseClient

/** Build a client whose every request carries the current Clerk session token. */
export function getSupabase(getToken: () => Promise<string | null>): Db {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('getSupabase() called without Supabase env. Guard with remoteEnabled.')
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    accessToken: async () => (await getToken()) ?? null,
  })
}

/** An anon client (no Clerk token) — used by the public published-funnel page for its RPCs. */
export function getAnonSupabase(): Db {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('getAnonSupabase() called without Supabase env.')
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
