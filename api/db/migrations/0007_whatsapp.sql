-- 0007_whatsapp.sql — Phase 5c: the WhatsApp connection + shared-inbox tables.
--
-- Scope: `autoleadss` schema only, same ownership model as 0001-0006 —
-- `clerk_user_id text references public.users(clerk_user_id)`, no RLS,
-- authorization enforced in api/ via requireClerkUser + `where clerk_user_id = $1`.
--
-- THE DEPLOY HAZARD THIS FIXES: these two tables used to live only in
-- api/_lib/whatsapp-schema.sql, "applied by hand" and never added to this
-- numbered sequence — unlike 0004/0005/0006. A fresh environment that ran
-- 0001-0006 but never hand-applied that file got a WhatsApp feature
-- (api/whatsapp/*) whose tables don't exist, so every query fails at runtime.
-- This migration is a straight promotion: column-for-column, index-for-index
-- identical to that file (only keyword casing changed, to match 0005/0006's
-- lowercase style) — not a redesign.
--
-- access_token is a Meta credential SECRET: it is written here but never read
-- back to the browser — api/whatsapp/connection.ts's SELECT deliberately
-- excludes it on every read.
--
-- Idempotent — safe to re-run against an already-provisioned database,
-- INCLUDING one where api/_lib/whatsapp-schema.sql was already applied by
-- hand: identical table/column/index names, types, defaults and constraints,
-- so every `if not exists` clause below is a no-op there.
--
-- Apply with (see api/db/migrations/README.md for details):
--   psql "$DIRECT_URL" -f api/db/migrations/0007_whatsapp.sql

begin;

create schema if not exists autoleadss;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists autoleadss.whatsapp_connections (
  id              text primary key,
  clerk_user_id   text not null references public.users (clerk_user_id),
  funnel_id       text not null,
  phone_number_id text not null,
  waba_id         text,
  display_phone   text,
  -- Meta credentials. access_token is a SECRET: it is never returned to the
  -- browser (see api/whatsapp/connection.ts, which strips it on read).
  access_token    text not null,
  verify_token    text not null,
  status          text not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists autoleadss.whatsapp_messages (
  id              text primary key,
  connection_id   text not null references autoleadss.whatsapp_connections (id) on delete cascade,
  clerk_user_id   text not null,
  -- The customer's phone. Conversation identity is (connection_id, wa_from).
  wa_from         text not null,
  direction       text not null check (direction in ('in', 'out')),
  body            text not null,
  -- Meta's message id, used for idempotency: webhooks are re-delivered on any
  -- non-2xx, so without this a retry duplicates the message AND double-bills.
  provider_msg_id text,
  status          text not null default 'received',
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- One live connection per phone number, so an inbound webhook resolves to
-- exactly one workspace.
create unique index if not exists whatsapp_connections_phone_idx
  on autoleadss.whatsapp_connections (phone_number_id);

create index if not exists whatsapp_connections_user_idx
  on autoleadss.whatsapp_connections (clerk_user_id);

create unique index if not exists whatsapp_messages_provider_idx
  on autoleadss.whatsapp_messages (provider_msg_id)
  where provider_msg_id is not null;

create index if not exists whatsapp_messages_convo_idx
  on autoleadss.whatsapp_messages (connection_id, wa_from, created_at desc);

commit;
