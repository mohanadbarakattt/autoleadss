import { getSql } from '../_lib/db'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { funnelFromRow, type FunnelRow } from '../_lib/mapping'

/**
 * GET /api/published?slug=foo — public lookup of a *published* funnel by slug.
 * No auth: this powers the public /p/:slug page. Only non-sensitive display
 * fields are selected (no owner id, no leads) — mirrors the old Supabase
 * `get_published_funnel` SECURITY DEFINER RPC's column list.
 *
 * Host-based (custom domain) lookup isn't implemented — custom domains weren't
 * migrated to Neon in this phase (see docs/SETUP.md); that path stays local-only.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const slug = queryParam(req, 'slug')
  if (!slug) return sendJson(res, 400, { error: 'slug is required.' })

  const rows = (await sql`
    select id, name, slug, industry, language, status, accent, spec, visits, created_at, updated_at
    from autoleadss.funnels
    where slug = ${slug} and status = 'published'
    limit 1
  `) as unknown as FunnelRow[]

  const row = rows[0]
  return sendJson(res, 200, { funnel: row ? funnelFromRow(row) : null })
}
