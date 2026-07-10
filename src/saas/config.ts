// Feature flags derived from env. The SaaS runs in demo mode (localStorage + no auth)
// unless these are set, at which point real Clerk auth + Supabase persistence activate.
//
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is the canonical shared name across every MBAI product
// (see ~/projects/mbai-ecosystem/docs/ENV-CONTRACT.md) — do not rename or add a VITE_ variant.
// Vite only exposes VITE_-prefixed vars to client code by default, so vite.config.ts adds
// 'NEXT_PUBLIC_' to envPrefix to make this one available via import.meta.env too.
// This is a pure client-side SPA: only the publishable key belongs here. CLERK_SECRET_KEY is
// server-only and must never appear in this repo.
export const CLERK_PUBLISHABLE_KEY = import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** Clerk drives auth when its publishable key is present. */
export const clerkEnabled = !!CLERK_PUBLISHABLE_KEY

/** Funnels/leads persist to Supabase (RLS-scoped by Clerk user) only when all three are set. */
export const remoteEnabled = !!(CLERK_PUBLISHABLE_KEY && SUPABASE_URL && SUPABASE_ANON_KEY)
