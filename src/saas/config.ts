// Feature flags derived from env. The SaaS runs in demo mode (localStorage + no auth)
// unless these are set, at which point real Clerk auth + Supabase persistence activate.

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** Clerk drives auth when its publishable key is present. */
export const clerkEnabled = !!CLERK_PUBLISHABLE_KEY

/** Funnels/leads persist to Supabase (RLS-scoped by Clerk user) only when all three are set. */
export const remoteEnabled = !!(CLERK_PUBLISHABLE_KEY && SUPABASE_URL && SUPABASE_ANON_KEY)
