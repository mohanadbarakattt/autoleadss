-- 0008_agency.sql — Phase 6: white-label agency settings, client sub-accounts,
-- and the funnels.sub_account_id column that ties funnels to a client.
--
-- Scope: `autoleadss` schema only, same ownership model as 0001-0007 —
-- `clerk_user_id text references public.users(clerk_user_id)`, no RLS,
-- authorization enforced in api/ via requireClerkUser + `where clerk_user_id = $1`.
--
-- THE BUG THIS UNBLOCKS: `Funnel.brand` (src/saas/types.ts) has always been
-- documented as "Owner's white-label branding, attached on public published
-- fetches" — but nothing ever set it, because there was no server column to
-- read it from. `api/published/index.ts` now left-joins agency_settings
-- against the funnel owner's clerk_user_id to build that payload server-side
-- (see that file's module doc) — previously the published page fell back to
-- the VISITOR's own local agency state, which is empty for a real visitor.
--
-- logo_url is rendered as an <img src> on public /p/:slug pages, so it's
-- untrusted input (defect class SEC1 — see
-- mbai-ecosystem/docs/DEFECT-CLASS-REGISTRY.md). The CHECK constraints below
-- are a belt-and-suspenders backstop; the real validation is at write time in
-- src/saas/lib/agencyBrand.ts, used by api/agency/settings.ts.
--
-- Idempotent — safe to re-run against an already-provisioned database.
--
-- Apply with (see api/db/migrations/README.md for details):
--   psql "$DIRECT_URL" -f api/db/migrations/0008_agency.sql

begin;

create schema if not exists autoleadss;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per agency owner. hide_badge defaults to false (the DB's honest
-- default for a row nobody has configured yet) — api/agency/settings.ts
-- applies its own true-by-default UX convention only once an owner actively
-- saves the form, not at the schema level.
create table if not exists autoleadss.agency_settings (
  clerk_user_id text primary key references public.users (clerk_user_id),
  brand_name    text check (brand_name is null or char_length(brand_name) <= 80),
  accent        text check (accent is null or accent ~ '^#[0-9a-fA-F]{6}$'),
  logo_url      text check (logo_url is null or logo_url ~ '^https://'),
  hide_badge    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists autoleadss.sub_accounts (
  id            text primary key,
  clerk_user_id text not null references public.users (clerk_user_id),
  name          text not null,
  contact_email text,
  created_at    timestamptz not null default now()
);

create index if not exists sub_accounts_user_idx
  on autoleadss.sub_accounts (clerk_user_id);

-- ---------------------------------------------------------------------------
-- funnels.sub_account_id — assigns a funnel to a client sub-account.
-- `Funnel.subAccountId` (src/saas/types.ts) has existed client-side since
-- Phase 4's agency mode, but with no column here it never survived a reload
-- in remote mode. `on delete set null`: removing a client's sub-account must
-- never delete or orphan their sites — they simply become unassigned.
-- ---------------------------------------------------------------------------

alter table autoleadss.funnels
  add column if not exists sub_account_id text references autoleadss.sub_accounts (id) on delete set null;

commit;
