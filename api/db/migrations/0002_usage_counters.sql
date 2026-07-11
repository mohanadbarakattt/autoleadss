-- 0002_usage_counters.sql — per-user, per-month WhatsApp-AI / AI-action usage
-- counters backing entitlements.ts's `whatsappCap`/`aiActionCap`
-- (PRICING-SPEC-DRAFT.md §2.2, ~/projects/mbai-ecosystem/docs/).
--
-- Additive only — does not touch autoleadss.funnels/leads from 0001. Same scope
-- rules as 0001: only the `autoleadss` schema, `clerk_user_id` ownership key,
-- authorization enforced in api/usage/index.ts (Clerk session verified server-side,
-- every query scoped by `clerk_user_id`). Idempotent — safe to re-run.
--
-- Apply with (see api/db/migrations/README.md for details):
--   psql "$DIRECT_URL" -f api/db/migrations/0002_usage_counters.sql

begin;

create table if not exists autoleadss.usage_counters (
  clerk_user_id   text not null references public.users (clerk_user_id),
  -- 'YYYY-MM' (UTC) — one row per user per calendar month; counters reset by
  -- simply starting a new row rather than zeroing an existing one.
  period          text not null,
  whatsapp_count  integer not null default 0,
  ai_action_count integer not null default 0,
  updated_at      timestamptz not null default now(),
  primary key (clerk_user_id, period)
);

create index if not exists usage_counters_clerk_user_id_idx on autoleadss.usage_counters (clerk_user_id);

commit;
