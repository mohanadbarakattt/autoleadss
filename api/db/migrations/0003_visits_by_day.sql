-- 0003_visits_by_day.sql — daily visit rollup backing the visits trend chart in
-- FunnelAnalytics.tsx. `autoleadss.funnels.visits` is just a running total with no
-- timeline; this adds a bounded per-day breakdown (one jsonb key per calendar day
-- the funnel got a visit, so it stays tiny even after years of traffic).
--
-- Additive only — does not touch existing columns/rows from 0001/0002. Same scope
-- rules as prior migrations: only the `autoleadss` schema, idempotent, safe to re-run.
--
-- Apply with (see api/db/migrations/README.md for details):
--   psql "$DIRECT_URL" -f api/db/migrations/0003_visits_by_day.sql

begin;

alter table autoleadss.funnels
  add column if not exists visits_by_day jsonb not null default '{}'::jsonb;

commit;
