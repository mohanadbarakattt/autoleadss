import { getSql } from '../_lib/db'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'

/** POST /api/published/visit — record a visit on a published funnel. Public, no auth. */
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
