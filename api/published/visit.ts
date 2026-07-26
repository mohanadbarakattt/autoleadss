import { getSql } from '../_lib/db'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'

/**
 * POST /api/published/visit — record a visit on a published funnel. Public, no auth.
 *
 * KNOWN LIMITATION, stated rather than half-fixed: this is unauthenticated with
 * no deduplication or rate limiting, so anyone who can reach the endpoint can
 * inflate a merchant's visit count arbitrarily — and Insights presents that
 * count as a real business metric.
 *
 * It is deliberately NOT "fixed" here, because every cheap option is worse than
 * the honest gap:
 *   - a cookie-based dedup needs analytics consent on a public funnel page
 *     (the consent banner exists for exactly this) and is trivially ignored;
 *   - per-IP dedup via a unique index would silently redefine `visits` from
 *     page views to unique-sources-per-day, changing the meaning of existing
 *     data and every label that renders it;
 *   - in-process counters do not survive a serverless invocation.
 *
 * A real fix is request-level rate limiting with shared state (Vercel KV or
 * equivalent) keyed on IP + slug, which is infrastructure this project has not
 * provisioned. Until then the number is best treated as directional.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const body = (req.body ?? {}) as { slug?: string }
  if (!body.slug) return sendJson(res, 400, { error: 'slug is required.' })

  // Bump both the running total and today's (UTC) slot in the daily rollup —
  // jsonb_set + coalesce so a never-visited day starts at 0 rather than erroring.
  await sql`
    update autoleadss.funnels
    set visits = visits + 1,
        visits_by_day = jsonb_set(
          visits_by_day,
          array[to_char(now() at time zone 'utc', 'YYYY-MM-DD')],
          to_jsonb(coalesce((visits_by_day ->> to_char(now() at time zone 'utc', 'YYYY-MM-DD'))::int, 0) + 1)
        )
    where slug = ${body.slug} and status = 'published'
  `
  return sendJson(res, 200, { ok: true })
}
