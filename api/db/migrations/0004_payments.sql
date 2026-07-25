-- 0004_payments.sql — unified payments CORE (gateway-agnostic) in the shared MBAI
-- Neon project.
--
-- Scope: `autoleadss` schema only, same ownership model as 0001-0003 —
-- `clerk_user_id text references public.users(clerk_user_id)`, no RLS,
-- authorization enforced in api/ via requireClerkUser + `where clerk_user_id = $1`.
--
-- This is MERCHANT commerce: a merchant connects their own gateway account and
-- takes payments from THEIR customers. It is not AutoLeadss's own subscription
-- billing (src/saas/billing/checkout.ts, billingEnabled = false) — untouched.
--
-- Money is integer minor units (fils/cents) everywhere — no floats, no decimals,
-- enforced here by amount_minor's CHECK constraint.
--
-- Idempotent — safe to re-run against an already-provisioned database.
--
-- Apply with (see api/db/migrations/README.md for details):
--   psql "$DIRECT_URL" -f api/db/migrations/0004_payments.sql

begin;

create schema if not exists autoleadss;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- A merchant's connected gateway account. credentials_encrypted is AES-256-GCM
-- ciphertext (api/_lib/payments/crypto.ts) — plaintext credentials are never
-- stored or logged. credentials_hint is masked display only (e.g. last4).
create table if not exists autoleadss.payment_connections (
  id                    text primary key,
  clerk_user_id         text not null references public.users (clerk_user_id),
  gateway               text not null,
  credentials_encrypted text not null,
  credentials_hint      text,
  status                text not null default 'connected' check (status in ('connected', 'disconnected')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (clerk_user_id, gateway)
);

-- The money record. amount_minor is integer minor units (fils/cents), never a
-- float. gateway_ref is the gateway's own id for this payment. reference is the
-- merchant-side order/lead ref (Phase 4 fills this in).
create table if not exists autoleadss.payments (
  id            text primary key,
  clerk_user_id text not null references public.users (clerk_user_id),
  gateway       text not null,
  gateway_ref   text,
  amount_minor  bigint not null check (amount_minor > 0),
  currency      text not null check (currency ~ '^[A-Z]{3}$'),
  status        text not null default 'pending'
                  check (status in ('pending', 'paid', 'failed', 'refunded', 'expired')),
  reference     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- The idempotency ledger. Gateways redeliver webhooks on any non-2xx; the
-- primary key on (gateway, event_id) is the dedup mechanism — a redelivery
-- becomes a no-op instead of a double-applied status change. Same defect class
-- as WhatsApp's provider_msg_id unique index (api/whatsapp/webhook.ts).
create table if not exists autoleadss.payment_events (
  gateway     text not null,
  event_id    text not null,
  payment_id  text references autoleadss.payments (id),
  received_at timestamptz not null default now(),
  primary key (gateway, event_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create unique index if not exists payments_gateway_ref_idx
  on autoleadss.payments (gateway, gateway_ref)
  where gateway_ref is not null;

create index if not exists payments_clerk_user_id_idx on autoleadss.payments (clerk_user_id);

commit;
