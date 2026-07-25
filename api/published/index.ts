import { getSql } from '../_lib/db'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { funnelFromRow, type FunnelRow } from '../_lib/mapping'

/**
 * GET /api/published?slug=foo — public lookup of a *published* funnel by slug.
 * GET /api/published?host=shop.yourbrand.com — same, resolved via a
 * **verified** custom domain instead (autoleadss.domains) — an unverified
 * domain must never serve content, so that half of the join is not optional.
 *
 * No auth: this powers the public /p/:slug page (and, for the host path,
 * whatever page loads on a mapped custom domain — see src/saas/publish/host.ts
 * + Published.tsx). Only non-sensitive display fields are selected (no owner
 * id, no leads) — mirrors the old Supabase `get_published_funnel` SECURITY
 * DEFINER RPC's column list, same for both lookup paths.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const slug = queryParam(req, 'slug')
  const host = queryParam(req, 'host')
  if (!slug && !host) return sendJson(res, 400, { error: 'slug or host is required.' })

  if (slug) {
    const rows = (await sql`
      select id, name, slug, industry, language, status, accent, spec, visits, visits_by_day, created_at, updated_at
      from autoleadss.funnels
      where slug = ${slug} and status = 'published'
      limit 1
    `) as unknown as FunnelRow[]
    return sendJson(res, 200, { funnel: rows[0] ? funnelFromRow(rows[0]) : null })
  }

  // Host path: only a VERIFIED domain resolves. An unverified row exists (the
  // owner added it, pending DNS) but must never serve content — this filter
  // is the entire enforcement of that rule, not a UI-level nicety.
  const domainRows = (await sql`
    select funnel_id from autoleadss.domains where hostname = ${host!.toLowerCase()} and verified = true limit 1
  `) as unknown as { funnel_id: string }[]
  const domain = domainRows[0]
  if (!domain) return sendJson(res, 200, { funnel: null })

  const rows = (await sql`
    select id, name, slug, industry, language, status, accent, spec, visits, visits_by_day, created_at, updated_at
    from autoleadss.funnels
    where id = ${domain.funnel_id} and status = 'published'
    limit 1
  `) as unknown as FunnelRow[]
  return sendJson(res, 200, { funnel: rows[0] ? funnelFromRow(rows[0]) : null })
}
