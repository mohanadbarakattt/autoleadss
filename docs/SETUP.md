# AutoLeadss — Production Setup Runbook

The app ships in **demo mode** (works with zero config). Each phase below is real,
production-grade code that stays dormant until you add its keys — then it activates
automatically. Nothing here changes the design.

> **Phase 2 update (this doc's most recent revision):** the SaaS's remote
> persistence moved off Supabase onto the shared MBAI Neon Postgres project. The
> Supabase project, schema, and edge functions that used to back Phases 2–8 below
> are gone; see "Phase 2 — Shared Neon backend" for what replaced them and what's
> temporarily out of scope.

---

## Phase 2 — Shared Neon backend (funnels, leads, published pages)  ✅ code shipped

Funnels and their leads persist to the shared MBAI Neon Postgres project (schema
`autoleadss`, owned solely by this app — see
`~/projects/mbai-ecosystem/docs/SHARED-DB-DESIGN.md`), via this repo's own Vercel
serverless functions under `api/`. No ORM, no persistent pool: plain parameterized
SQL over `@neondatabase/serverless`'s HTTP driver, every statement schema-qualified
against `autoleadss.*`.

Auth for the API is Clerk, verified **server-side**: `api/_lib/auth.ts` checks the
`Authorization: Bearer <token>` header against `CLERK_SECRET_KEY` using
`@clerk/backend`'s `verifyToken`. No token (or no `CLERK_SECRET_KEY`) → the function
refuses (401/501); the client then stays in localStorage mode. There's no
client-visible signal for "is Neon configured" (both secrets are server-only), so the
frontend just probes `GET /api/funnels` once per sign-in
(`src/saas/store.ts` → `bridgeClerkSession`) and falls back to the existing
per-user-namespaced localStorage behavior (with the same one-time
anonymous→first-signed-in-user migration as before) on any failure — network error,
501 not configured, or the function not deployed yet.

The public `/p/:slug` page (`src/saas/pages/Published.tsx`) works the same way: it
always tries `GET /api/published?slug=...` first and only falls back to localStorage
if that call fails. When the backend is reachable, this fixes publishing being
limited to the browser that created the funnel.

**Go live:**
1. Make sure `~/projects/mbai-ecosystem`'s gateway bootstrap has already run against
   the Neon project (creates `public.users`, the `autoleadss` schema, the
   `autoleadss_app` role + grants — see `SHARED-DB-DESIGN.md` §7). This app's
   migration assumes that's already done.
2. Apply this app's table migration (idempotent, safe to re-run):
   ```bash
   psql "$DIRECT_URL" -f api/db/migrations/0001_autoleadss_schema.sql
   ```
   (`DIRECT_URL` — the non-pooled connection — per the shared-DB design's migration
   guidance; see `api/db/migrations/README.md`.)
3. Add env vars to **Vercel** (and `.env.local` locally), then redeploy:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
   CLERK_SECRET_KEY=sk_live_xxxx        # server-only — never in client code
   DATABASE_URL=postgres://autoleadss_app:...@.../mbai?sslmode=require   # pooled
   DIRECT_URL=postgres://autoleadss_app:...@.../mbai?sslmode=require     # direct
   ```
   See `~/projects/mbai-ecosystem/docs/ENV-CONTRACT.md` for the canonical variable
   names — never rename them or add `VITE_`/local variants.

**Out of scope for this phase** (existed as Supabase-backed features in the old
Phases 3–8 below; not carried over — the app degrades gracefully rather than
breaking):
- **Custom domains / host-based publishing** (`src/saas/db/domains.ts`) — the editor's
  Domain tab always shows "not available yet"; no `autoleadss.domains` table exists.
- **WhatsApp remote persistence / shared inbox** (`src/saas/db/whatsapp.ts`) — the
  Connect page always shows demo-mode copy; no `autoleadss.whatsapp_*` tables exist.
- **Agency / white-label settings, sub-accounts, workspace plan & region** — these
  still work, but only ever persist to the per-Clerk-user-namespaced localStorage
  blob (same mechanism as full demo mode), never to Neon.
- **Real (non-template) AI generation** (`src/saas/ai/generateLive.ts`) — always
  falls back to the on-device template generator now; it used to call a Supabase
  Edge Function. Wiring it to the shared MBAI Model Gateway (`MBAI_GATEWAY_URL` /
  `MBAI_GATEWAY_KEY`) is a reasonable follow-up.
- **Billing checkout** (`src/saas/billing/checkout.ts`) — `billingEnabled` is
  hardcoded `false`; "Choose plan" sets the plan locally (demo) as it always did when
  billing wasn't configured. It used to call a Supabase Edge Function
  (`create-checkout`).

Each of these has a short doc comment in its source file pointing back here.

---

### Env reference (`.env.local` / Vercel)
| Var | Used by | Status |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth (`/login`, `/signup`, `/app`) | ⛔ add to go live |
| `CLERK_SECRET_KEY` | `api/*` — verifies Clerk session tokens server-side | ⛔ add to go live |
| `DATABASE_URL` / `DIRECT_URL` | `api/*` — shared Neon Postgres (`autoleadss` schema) | ⛔ add to go live |

_Historical note: Phases "2"–"8" below describe the old Supabase-backed
implementation, kept for context on what shipped and when. The persistence layer
they describe (Supabase tables + edge functions `generate-funnel`,
`create-checkout`, `whatsapp-webhook`, `stripe-webhook`) was removed in the Neon
migration above; the phase numbering wasn't renumbered to avoid rewriting history
that other docs may reference._

## Phase 2 (historical) — Real AI generation (streaming)

The funnel wizard used to stream from a Supabase Edge Function (`generate-funnel`).
Removed — see "Out of scope" above. The wizard always uses the on-device template
generator for now.

## Phase 3 (historical) — Database & Clerk auth via Supabase

Funnels/leads used to persist to Supabase (RLS-scoped by Clerk user id). Superseded
by "Phase 2 — Shared Neon backend" above.

## Phase 4 (historical) — Billing (Stripe + Paymob)

Plan entitlements, usage meters, and contextual upgrade gates still work today
(client-side, local). Real checkout (`create-checkout` Supabase Edge Function) was
removed — see "Out of scope" above.

## Phase 5 (historical) — WhatsApp Cloud API (BYO WABA)

Each funnel used to connect the customer's own WhatsApp number via a Supabase
webhook. Removed — see "Out of scope" above; `src/saas/db/whatsapp.ts` is a stub.

## Phase 5.5 (historical) — Gemma-powered WhatsApp bot

Depended on Phase 5's webhook (removed).

## Phase 6 (historical) — Custom domains / real publishing

`/p/:slug` cross-device publishing is now covered by "Phase 2 — Shared Neon backend"
above. Host-based rendering (subdomains + custom domains) was Supabase-backed and
was not carried over — see "Out of scope" above.

## Phase 7 (historical) — White-label / agency mode

Agencies' sub-accounts + branding still work today, but local-only (see
"Out of scope" above) — no longer synced to a remote database.

## Phase 8 (historical) — Analytics, inbox, billing webhook & hardening

- **Per-funnel analytics** (editor → Insights tab) still works — it's computed from
  local lead data, no backend dependency.
- **WhatsApp lite inbox** and **billing webhook** were Supabase-backed — removed,
  see "Out of scope" above.
