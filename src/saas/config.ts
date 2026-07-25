// Feature flags derived from env. The SaaS runs in demo mode (localStorage + no auth)
// unless Clerk is configured, at which point real auth activates.
//
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is the canonical shared name across every MBAI
// product (see ~/projects/mbai-ecosystem/docs/ENV-CONTRACT.md) — do not rename or add a
// VITE_ variant. Vite only exposes VITE_-prefixed vars to client code by default, so
// vite.config.ts adds 'NEXT_PUBLIC_' to envPrefix to make this one available via
// import.meta.env too.
// This is a pure client-side SPA: only the publishable key belongs here. CLERK_SECRET_KEY
// is server-only (used by api/*, never bundled here) and must never appear in this file.
export const CLERK_PUBLISHABLE_KEY = import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined

/** Clerk drives auth when its publishable key is present. */
export const clerkEnabled = !!CLERK_PUBLISHABLE_KEY

/**
 * Funnels/leads persist to the shared Neon backend (via api/*) once Clerk is on —
 * but unlike the old Supabase integration, there's no client-visible env var that
 * proves the Neon backend is actually configured (DATABASE_URL / CLERK_SECRET_KEY
 * are server-only secrets). So this is NOT a static "is it configured" flag: the
 * store probes the backend at runtime on sign-in (see store.ts `bridgeClerkSession`)
 * and falls back to localStorage if it's unreachable or not yet deployed.
 *
 * `remoteEnabled` below is unrelated to that probe — it gates features that were
 * Supabase-backed before Phase 2 and had to be rebuilt on Neon.
 *
 * WhatsApp was rebuilt 2026-07-21: `autoleadss.whatsapp_connections` /
 * `whatsapp_messages` tables plus `api/whatsapp/{webhook,send,connection}`.
 * Custom domains were rebuilt 2026-07-25 (Phase 4c): `autoleadss.domains` +
 * `api/domains/{index,[id],verify}` — real DNS TXT verification, no checkbox
 * (see api/domains/verify.ts). That was the last feature still gated by this
 * flag, so it's now unconditionally on; kept as a named export (rather than
 * deleted) so Editor.tsx's DomainPanel still reads a single, greppable switch
 * if a future feature ever needs the same "was Supabase-backed" gate again.
 */
export const remoteEnabled = true

/**
 * WhatsApp connection + shared inbox, rebuilt on Neon 2026-07-21
 * (`autoleadss.whatsapp_connections` / `whatsapp_messages` +
 * `api/whatsapp/{webhook,send,connection}`).
 *
 * SPLIT OUT of `remoteEnabled` on purpose: that flag also gates custom domains,
 * which are still NOT migrated, so flipping the shared flag would have switched
 * on a half-built feature that calls a stub. One flag per feature.
 */
export const whatsappEnabled = true
