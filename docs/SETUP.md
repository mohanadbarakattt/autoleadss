# AutoLeadss — Production Setup Runbook

The app ships in **demo mode** (works with zero config — see "What works without
configuration" below). Every phase past that is real, production-grade code that
stays dormant until you add its keys — then it activates automatically. Nothing
here changes the design.

---

## 0 · Hard prerequisite — read this before you migrate or set a single env var

Every table in the `autoleadss` schema (all 14 of them) has a foreign key on
`clerk_user_id` pointing at **`public.users`**:

```sql
clerk_user_id text not null references public.users (clerk_user_id)
```

`public.users` is **not created by anything in this repo.** It is created and kept
in sync by the MBAI gateway's Clerk webhook, which lives in a different repo
(`mbai-ecosystem`) and writes one row per Clerk user (keyed by Clerk's `sub` claim
— the same id `api/_lib/auth.ts`'s `requireClerkUser` returns). This repo's
migrations (`api/db/migrations/`) only ever create objects inside the
`autoleadss` schema; none of them can create that row, and there is no fallback
path in this codebase that creates it either.

**What this means in practice:** you can migrate every table correctly, set every
env var below correctly, and deploy — and if the gateway's Clerk webhook has
never fired for a given user, every write this app attempts for that user still
fails at the foreign key. That failure is not loud. The client's existing
graceful-degradation behavior (falls back to localStorage on *any* backend
failure — see "Phase 2" below) means a failed write looks identical to "backend
not configured": funnels, leads, orders, everything *appears* to save, and
nothing lands in Neon. There is no error banner. The only way to know is to
check the database directly.

**Before trusting a deploy, verify the row exists.** Sign in once through this
app's Clerk flow, note the Clerk user id (e.g. from the browser's network tab on
any `/api/*` call, or from Clerk's own dashboard), then check Neon directly:

```bash
psql "$DIRECT_URL" -c "select clerk_user_id, created_at from public.users where clerk_user_id = '<clerk-user-id>';"
```

One row back = the prerequisite is satisfied for that user and writes will
persist. No row = the gateway webhook hasn't run for this user yet; that is an
issue in the `mbai-ecosystem` repo/deployment, not in this one — this repo has
no visibility into why it didn't fire and no step here can fix it. Do not
attempt to insert the row by hand from this repo; the gateway owns that table.

---

## 1 · What works without configuration (demo mode)

The whole app runs keyless, out of the box:

- **Funnel wizard, editor, publishing** — client-side template generation,
  localStorage persistence, `/p/:slug` publishing (same-browser).
- **Ads, Social, Insights, per-funnel analytics** — computed from local lead
  data, no backend dependency.
- **WhatsApp connect UI, shared inbox UI** — demo-mode copy and local state;
  honest "not connected" rather than a broken live view.
- **Agency / white-label settings, sub-accounts** — persist to a
  per-Clerk-user-namespaced localStorage blob.
- **Custom domains UI** — reachable, but nothing verifies without the Neon
  backend (DNS TXT verification is a real lookup, not a checkbox, and needs a
  `domains` row to check against).
- **Sell mode storefront** — browsable, cart works; checkout is reachable and
  correctly refuses (see Payments below) rather than faking a charge.

Nothing above needs `public.users`, Clerk, or Neon. It degrades honestly, not
silently, wherever it's genuinely disconnected — the only exception is the
scenario in section 0, where persistence looks connected but isn't.

**Once Clerk + Neon (`CLERK_SECRET_KEY` + `DATABASE_URL`/`DIRECT_URL`) are
configured, migrated, and `public.users` is populated for a given user**, these
move from localStorage to real server-side persistence: funnels/leads, usage
counters, payment connections/orders, custom domains, WhatsApp connections +
shared inbox, and agency/white-label settings.

**Dead without keys** (no local fallback, returns a clear "not configured"
error instead of silently doing nothing):
- Real (non-template) AI copy generation — `MBAI_GATEWAY_URL` + `MBAI_GATEWAY_KEY`.
- WhatsApp send/receive against Meta — `WHATSAPP_ACCESS_TOKEN` (or a per-connection
  token), `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`.
- Payment gateway connections — `PAYMENTS_ENCRYPTION_KEY`.

**Gated off regardless of keys** — see "Payments" below: no live checkout is
possible today, by design, not by missing config.

---

## 2 · Go-live runbook

Do these in order. Steps 1–2 are prerequisites you verify, not steps you run
from this repo.

### Step 1 — confirm the `public.users` prerequisite (see section 0)

Confirm the MBAI gateway's Clerk webhook is live against the target Neon
project before doing anything else. If you can't confirm it yet, you can still
migrate (step 2) — migrations don't depend on any user rows existing — but do
not consider the deploy trustworthy until you've verified at least one row per
section 0.

### Step 2 — apply all 8 migrations, in order

Every migration is idempotent (`create table/schema/index if not exists`) and
safe to re-run. They use `DIRECT_URL` — the non-pooled connection, required for
DDL per the shared-DB design (`DATABASE_URL`, the pooled connection, is for
runtime queries only — see `api/db/migrations/README.md`):

```bash
psql "$DIRECT_URL" -f api/db/migrations/0001_autoleadss_schema.sql
psql "$DIRECT_URL" -f api/db/migrations/0002_usage_counters.sql
psql "$DIRECT_URL" -f api/db/migrations/0003_visits_by_day.sql
psql "$DIRECT_URL" -f api/db/migrations/0004_payments.sql
psql "$DIRECT_URL" -f api/db/migrations/0005_sell.sql
psql "$DIRECT_URL" -f api/db/migrations/0006_domains.sql
psql "$DIRECT_URL" -f api/db/migrations/0007_whatsapp.sql
psql "$DIRECT_URL" -f api/db/migrations/0008_agency.sql
```

Running only `0001` — as this runbook used to say — leaves 12 of the 14 tables
missing and every feature past funnels/leads (usage caps, payments, sell,
domains, WhatsApp, agency) fails at runtime the first time it's queried. See
`api/db/migrations/README.md` for what each file adds and which feature it backs.

This has not been run against any real database as part of writing this doc —
no live Neon credentials exist in this session. Applying it is a manual step
for whoever provisions the shared Neon project.

### Step 3 — set env vars on Vercel (and `.env.local` locally), then redeploy

See `.env.example` for the complete, grouped, commented list — every variable
the code reads, with what breaks without it. At minimum for a working deploy:
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`,
`DIRECT_URL`. Add the others as you turn on the features they back.

See `~/projects/mbai-ecosystem/docs/ENV-CONTRACT.md` for the canonical Clerk/DB
variable names shared across MBAI products — never rename them or add
`VITE_`/local variants.

### Step 4 — spot-check

Sign in, create a funnel, refresh in a different browser (or clear
localStorage) and confirm it's still there — that only happens if step 1 was
actually satisfied for your test user, not just steps 2–3.

---

## 3 · Payments — status as of this doc

The payments **core** (connections, orders, ledger, webhook dispatch) is built
and migrated (`0004_payments.sql`), but **no real gateway adapter is
implemented**. All nine listed gateways — Tap, PayTabs, Telr, Checkout.com,
Tabby, Tamara, Stripe, PayPal, Apple Pay — are registered with
`implemented: false` (`api/_lib/payments/registry.ts`); Phase 3b (building each
against its own live docs and real credentials) is parked. The only adapter
that actually works is `fake`, a test double gated behind
`PAYMENTS_FAKE_ADAPTER=1`, which must never be set in production.

**Concretely:** `POST /api/published/order` always responds `409
payments_not_connected` for a real storefront until a real adapter ships —
there is no configuration that makes a live gateway work today. Do not
represent checkout as functional to a merchant.

`src/saas/billing/checkout.ts`'s `billingEnabled` is also still hardcoded
`false` — this app's own subscription billing (as opposed to a merchant's
storefront payments, above) has no live path either; "Choose plan" sets the
plan locally, same as full demo mode.

---

## 4 · Owner-side blockers (nothing here is fixable from this repo)

- **Gateway merchant accounts + KYC** — even once Phase 3b ships adapters, each
  gateway needs its own merchant account and approval before it can go live:
  Gulf — Tap, PayTabs, Telr, Checkout.com, Tabby, Tamara; global — Stripe,
  PayPal, Apple Pay. KYC takes days–weeks per provider and is paperwork, not
  code — start early for whichever gateways you actually need.
- **Meta WhatsApp (WABA) approval** — a Business account and phone number need
  Meta's approval before `WHATSAPP_ACCESS_TOKEN` et al. can be real; until then
  the WhatsApp tool stays in demo mode regardless of what you set.
- **DNS** — register `autoleadss.site` and point a **wildcard** record at this
  deploy for customer subdomains (`{slug}.autoleadss.site`); `api/domains/*`'s
  custom-domain flow additionally needs each merchant's own domain to resolve
  before its DNS TXT check can pass.
- **Rotate the old Supabase anon key** that is in this repo's git history from
  the pre-Neon implementation. Supabase is fully removed from the live code
  (nothing under `src/` or `api/` references it), but the key itself was
  committed historically and git history is not rewritten — rotate it in
  Supabase regardless of whether the project is still in use.

---

## 5 · Env var reference

See `.env.example` — it is the source of truth, grouped by purpose, every
variable annotated with what breaks without it. Do not duplicate that list
here; keep it in one place so it can't drift out of sync with the code again.

---

_Historical note: everything below predates the Neon migration and Phases
3b–8's actual landing. It's kept for context on what shipped and when, not as
current-state documentation — the numbering wasn't renumbered to avoid
rewriting history that other docs may reference. For current state, see
sections 0–5 above._

## Phase 2 — Shared Neon backend (funnels, leads, published pages) ✅ shipped

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
501 not configured, or the function not deployed yet. This is also what makes the
section 0 failure mode silent: an FK failure on write is "any failure" too.

The public `/p/:slug` page (`src/saas/pages/Published.tsx`) works the same way: it
always tries `GET /api/published?slug=...` first and only falls back to localStorage
if that call fails. When the backend is reachable, this fixes publishing being
limited to the browser that created the funnel.

## Phase 3b (historical/parked) — Real payment gateway adapters

See "Payments" above — this is current status, not history, but flagged here too
since the phase numbering below still calls out "Phase 4" for billing.

## Phase 4c — Custom domains / real publishing ✅ shipped

`autoleadss.domains` + `api/domains/{index,[id],verify}`, with real DNS TXT
verification (never a checkbox — see `api/domains/verify.ts`) and
`api/published/index.ts`'s `?host=` path, which only ever resolves a **verified**
domain. Migrate with `api/db/migrations/0006_domains.sql`.

## Phase 5c — WhatsApp Cloud API (BYO WABA) ✅ shipped

Each funnel connects the customer's own WhatsApp number
(`autoleadss.whatsapp_connections`, `api/whatsapp/connection.ts`) with a real
shared inbox (`autoleadss.whatsapp_messages`, `api/whatsapp/{send,webhook}.ts`),
migrated by `0007_whatsapp.sql`. Outbound send requires
`WHATSAPP_ACCESS_TOKEN`/a per-connection token; inbound requires
`WHATSAPP_VERIFY_TOKEN` + `WHATSAPP_APP_SECRET` for Meta's webhook handshake and
signature check. Without any of those, the tool stays fully demo-mode (UI works,
nothing reaches Meta) — see "What works without configuration" above.

## Phase 6 — White-label / agency mode ✅ shipped

Agencies' sub-accounts + branding persist to Neon
(`autoleadss.agency_settings`, `autoleadss.sub_accounts`, `api/agency/*`),
migrated by `0008_agency.sql`. This is what makes a published funnel's brand
join real — previously nothing set it, so a visitor to a paying agency's site
always saw "Made with AutoLeadss" regardless of the owner's settings.

## Phase 3 (historical) — Real AI generation

`api/ai-generate.ts` now proxies the wizard's AI-copy path through the shared
MBAI Model Gateway (`MBAI_GATEWAY_URL` + `MBAI_GATEWAY_KEY`), requiring a valid
Clerk session. When either var is unset, it responds 503 and the wizard falls
back to the on-device template generator — that fallback stays byte-for-byte
identical to the original demo experience.

## Phase 2 (historical) — Real AI generation (streaming, Supabase-era)

The funnel wizard used to stream from a Supabase Edge Function
(`generate-funnel`). Removed in the Neon migration — superseded by "Phase 3"
above.

## Phase 3 (historical) — Database & Clerk auth via Supabase

Funnels/leads used to persist to Supabase (RLS-scoped by Clerk user id).
Superseded by "Phase 2 — Shared Neon backend" above.

## Phase 4 (historical) — Billing (Stripe + Paymob)

Plan entitlements, usage meters, and contextual upgrade gates still work today
(client-side, local). Real checkout (`create-checkout` Supabase Edge Function)
was removed; see "Payments" above for current status.

## Phase 5 (historical) — WhatsApp Cloud API (BYO WABA, Supabase-era)

Each funnel used to connect the customer's own WhatsApp number via a Supabase
webhook. Removed; superseded by "Phase 5c" above.

## Phase 5.5 (historical) — Gemma-powered WhatsApp bot

Depended on Phase 5's webhook (removed, Supabase-era).

## Phase 8 (historical) — Analytics, inbox, billing webhook & hardening

- **Per-funnel analytics** (editor → Insights tab) still works — it's computed from
  local lead data, no backend dependency.
- **WhatsApp lite inbox** was Supabase-backed and removed; superseded by "Phase 5c"
  above. **Billing webhook** (this app's own subscription billing, not merchant
  payments) was Supabase-backed and removed — see "Payments" above for current
  status of merchant payments; this app's own billing has no live path.
