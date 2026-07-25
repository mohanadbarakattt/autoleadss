import { getSql } from '../_lib/db'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { funnelFromRow, publicBrandFromRow, type FunnelRow, type AgencySettingsRow } from '../_lib/mapping'

type FunnelWithBrandRow = FunnelRow & AgencySettingsRow

function toFunnelWithBrand(r: FunnelWithBrandRow) {
  return { ...funnelFromRow(r), brand: publicBrandFromRow(r) }
}

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
 *
 * Phase 6: both queries below left-join `agency_settings` on the funnel
 * owner's `clerk_user_id` to attach `funnel.brand` — the funnel OWNER's
 * white-label branding, resolved server-side. `f.clerk_user_id` is used only
 * inside the JOIN condition, never in the SELECT list, so it never reaches
 * the response — see `publicBrandFromRow`'s doc for what this fixes and its
 * honest limits on the badge-removal entitlement gate. (`a.accent` — the
 * agency's own brand colour — is deliberately not selected: the published
 * page already themes off the funnel's own `accent`, a separate field.)
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
      select f.id, f.name, f.slug, f.industry, f.language, f.status, f.accent, f.spec, f.visits, f.visits_by_day, f.created_at, f.updated_at,
             a.brand_name, a.logo_url, a.hide_badge
      from autoleadss.funnels f
      left join autoleadss.agency_settings a on a.clerk_user_id = f.clerk_user_id
      where f.slug = ${slug} and f.status = 'published'
      limit 1
    `) as unknown as FunnelWithBrandRow[]
    return sendJson(res, 200, { funnel: rows[0] ? toFunnelWithBrand(rows[0]) : null })
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
    select f.id, f.name, f.slug, f.industry, f.language, f.status, f.accent, f.spec, f.visits, f.visits_by_day, f.created_at, f.updated_at,
           a.brand_name, a.logo_url, a.hide_badge
    from autoleadss.funnels f
    left join autoleadss.agency_settings a on a.clerk_user_id = f.clerk_user_id
    where f.id = ${domain.funnel_id} and f.status = 'published'
    limit 1
  `) as unknown as FunnelWithBrandRow[]
  return sendJson(res, 200, { funnel: rows[0] ? toFunnelWithBrand(rows[0]) : null })
}
