-- 0006_domains.sql — Phase 4c: custom domains.
--
-- Scope: `autoleadss` schema only, same ownership model as 0001-0005 —
-- `clerk_user_id text references public.users(clerk_user_id)`, no RLS,
-- authorization enforced in api/ via requireClerkUser + `where clerk_user_id = $1`.
--
-- A domain always belongs to exactly one funnel (the site it should serve) and
-- is verified via a real DNS TXT lookup (see api/domains/verify.ts) — never a
-- checkbox. `hostname` is globally unique (never lowercased-duplicated across
-- merchants) and only ever resolves publicly once `verified = true` (see
-- api/published/index.ts's `?host=` path).
--
-- Idempotent — safe to re-run against an already-provisioned database.
--
-- Apply with (see api/db/migrations/README.md for details):
--   psql "$DIRECT_URL" -f api/db/migrations/0006_domains.sql

begin;

create schema if not exists autoleadss;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists autoleadss.domains (
  id                  text primary key,
  clerk_user_id       text not null references public.users (clerk_user_id),
  funnel_id           text not null references autoleadss.funnels (id) on delete cascade,
  hostname            text not null unique,
  verified            boolean not null default false,
  verification_token  text not null,
  created_at          timestamptz not null default now(),
  verified_at         timestamptz
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists domains_funnel_id_idx on autoleadss.domains (funnel_id);

-- Only verified hostnames are ever resolved publicly (api/published/index.ts) —
-- a partial index on exactly that lookup shape.
create index if not exists domains_hostname_verified_idx
  on autoleadss.domains (hostname)
  where verified;

commit;
