import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

/**
 * Lazily builds a Neon HTTP SQL tag function against DATABASE_URL (the pooled
 * connection — see ~/projects/mbai-ecosystem/docs/SHARED-DB-DESIGN.md §5). Returns
 * `null` when DATABASE_URL isn't set, so callers can 501 gracefully instead of
 * throwing — this repo must keep building/running with zero env vars.
 *
 * No ORM, no persistent pool: per SHARED-DB-DESIGN's per-app integration map,
 * AutoLeadss talks to Postgres via plain parameterized SQL over Neon's HTTP driver,
 * every statement schema-qualified against `autoleadss.*`.
 */
export function getSql(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}
