# AutoLeadss Neon migrations

Table migrations for this app's `autoleadss` schema in the shared MBAI Neon Postgres
project. See `~/projects/mbai-ecosystem/docs/SHARED-DB-DESIGN.md` for the full
cross-app design (schema-per-app boundary, roles/grants, `public.users` identity
mirror).

**Prerequisite:** the gateway's bootstrap (`gateway/db/bootstrap.sql` in the
`mbai-ecosystem` repo) must already have run against the target Neon project — it
creates `public.users`, the `autoleadss` schema, and the `autoleadss_app` role +
grants. These migrations only add tables inside `autoleadss`; they never touch
`public.*` or another app's schema.

**Apply a migration** (uses `DIRECT_URL` — the non-pooled connection, required for
DDL/migrations per the shared-DB design; `DATABASE_URL`, the pooled connection, is
for runtime queries only):

```bash
psql "$DIRECT_URL" -f api/db/migrations/0001_autoleadss_schema.sql
psql "$DIRECT_URL" -f api/db/migrations/0002_usage_counters.sql
```

Each file is idempotent (`create table/schema/index if not exists`) — safe to re-run.

| File | Adds |
|---|---|
| `0001_autoleadss_schema.sql` | `autoleadss.funnels`, `autoleadss.leads` — the funnel/lead persistence backing `api/funnels/*`, `api/leads/*`, `api/published/*` |
| `0002_usage_counters.sql` | `autoleadss.usage_counters` — per-user, per-month WhatsApp-AI/AI-action usage counts backing `api/usage` and the entitlement caps in `src/saas/entitlements.ts` |

Not yet migrated (see `docs/SETUP.md` "Out of scope"): workspaces, agency settings,
sub-accounts, domains, WhatsApp connections/messages, top-up grants (`TOPUP_PACKS`
in `src/saas/pricing.ts` stay localStorage-only — see `src/saas/billing/usage.ts`'s
`purchaseTopup` doc comment for why). These stay in localStorage until a future
migration adds tables + `api/` routes for them.

This has not been run against the real Neon project as part of this change — no
live database credentials exist yet. Applying it is a manual step for whoever
provisions the shared Neon project.
