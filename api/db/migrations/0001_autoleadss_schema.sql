-- 0001_autoleadss_schema.sql — AutoLeadss tables in the shared MBAI Neon project.
--
-- Scope: this app owns ONLY the `autoleadss` schema. It never creates, alters, or
-- drops anything in `public` (that's the MBAI Gateway's job — see
-- ~/projects/mbai-ecosystem/docs/SHARED-DB-DESIGN.md). `public.users` is assumed to
-- already exist (created by `gateway/db/bootstrap.sql` in the mbai-ecosystem repo)
-- before this migration runs, because of the `references public.users` FK below.
--
-- Ownership key: `clerk_user_id text` on every row, matching the ecosystem-wide
-- convention (Clerk's `sub` claim). No RLS here (unlike the old Supabase schema) —
-- Neon roles aren't Clerk-JWT-aware, so authorization is enforced entirely in the
-- Vercel functions (api/): each query verifies the Clerk session token server-side
-- and scopes every statement with `where clerk_user_id = $1`.
--
-- Idempotent — safe to re-run against an already-provisioned database.
--
-- Apply with (see api/db/migrations/README.md for details):
--   psql "$DIRECT_URL" -f api/db/migrations/0001_autoleadss_schema.sql
-- (uses DIRECT_URL — the non-pooled connection — per the shared-DB design's migration
-- guidance; DATABASE_URL, the pooled connection, is for runtime queries only.)

begin;

-- Schema is normally created once, up front, by the gateway's bootstrap script
-- (`CREATE SCHEMA IF NOT EXISTS autoleadss;`). Repeated here, idempotently, only as
-- a safety net so this migration is runnable on its own; it touches nothing outside
-- the schema it names.
create schema if not exists autoleadss;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists autoleadss.funnels (
  id            text primary key,
  clerk_user_id text not null references public.users (clerk_user_id),
  name          text not null,
  slug          text not null unique,
  industry      text not null,
  language      text not null,
  status        text not null default 'draft',
  accent        text,
  spec          jsonb not null default '{}'::jsonb,
  visits        integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists autoleadss.leads (
  id            text primary key,
  funnel_id     text not null references autoleadss.funnels (id) on delete cascade,
  clerk_user_id text not null references public.users (clerk_user_id),
  name          text,
  phone         text,
  email         text,
  message       text,
  source        text not null default 'page',
  status        text not null default 'new',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists funnels_clerk_user_id_idx on autoleadss.funnels (clerk_user_id);
create index if not exists funnels_status_idx        on autoleadss.funnels (status);
create index if not exists leads_funnel_id_idx        on autoleadss.leads (funnel_id);
create index if not exists leads_clerk_user_id_idx    on autoleadss.leads (clerk_user_id);

commit;

-- ---------------------------------------------------------------------------
-- NOT included here (owned by the gateway, applied separately):
--   - `CREATE ROLE autoleadss_app ...` and its GRANTs onto `autoleadss.*` /
--     `public.users` / `public.usage_ledger` — see SHARED-DB-DESIGN.md §3 and §7
--     (`gateway/db/bootstrap.sql` in mbai-ecosystem). This app's Vercel functions
--     connect as `autoleadss_app` via DATABASE_URL / DIRECT_URL.
--
-- Deliberately out of scope for this migration (Phase 2 covers funnel/page/publish
-- persistence only — see docs/SETUP.md):
--   - workspaces / agency_settings / sub_accounts / domains / whatsapp_connections /
--     whatsapp_messages — these existed in the old Supabase schema but have no Neon
--     equivalent yet. The app now keeps that state in localStorage (namespaced per
--     Clerk user id) regardless of whether the funnels backend above is reachable.
