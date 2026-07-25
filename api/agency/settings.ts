import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { agencySettingsFromRow, type AgencySettingsRow } from '../_lib/mapping'
import { isValidAccent, isValidLogoUrl, isValidBrandName, MAX_BRAND_NAME_LEN } from '../../src/saas/lib/agencyBrand'
import type { AgencySettings } from '../../src/saas/types'

/**
 * White-label branding for the caller's agency (Phase 6).
 *   GET -> the caller's settings, or null if never saved
 *   PUT -> partial patch (same "merge, don't replace" semantics as
 *          store.ts's `saveAgencySettings`) — only fields present in the body
 *          are changed; the row is created on first save.
 *
 * Every accepted field is format-validated here since `logoUrl` in particular
 * is rendered as a public <img src> on /p/:slug pages (see Published.tsx and
 * api/published/index.ts's brand join) — defect class SEC1.
 *
 * Owner-scoped: keyed by clerk_user_id, one row per caller, so this can never
 * read or write another agency's settings.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  const existingRows = (await sql`
    select brand_name, accent, logo_url, hide_badge from autoleadss.agency_settings where clerk_user_id = ${userId} limit 1
  `) as unknown as AgencySettingsRow[]
  const existing = existingRows[0] ?? null

  if (req.method === 'GET') {
    return sendJson(res, 200, { settings: existing ? agencySettingsFromRow(existing) : null })
  }

  if (req.method !== 'PUT') return methodNotAllowed(res, ['GET', 'PUT'])

  const b = (req.body ?? {}) as Partial<AgencySettings>

  let brandName = existing?.brand_name ?? null
  if (b.brandName !== undefined) {
    const trimmed = typeof b.brandName === 'string' ? b.brandName.trim() : ''
    if (trimmed && !isValidBrandName(trimmed)) {
      return sendJson(res, 400, { error: `brandName must be 1-${MAX_BRAND_NAME_LEN} characters.` })
    }
    brandName = trimmed || null
  }

  let accent = existing?.accent ?? null
  if (b.accent !== undefined) {
    if (typeof b.accent !== 'string' || !isValidAccent(b.accent)) {
      return sendJson(res, 400, { error: 'accent must be a hex colour like #FF5C2A.' })
    }
    accent = b.accent
  }

  let logoUrl = existing?.logo_url ?? null
  if (b.logoUrl !== undefined) {
    const trimmed = typeof b.logoUrl === 'string' ? b.logoUrl.trim() : ''
    if (trimmed && !isValidLogoUrl(trimmed)) {
      return sendJson(res, 400, { error: 'logoUrl must be an https:// URL.' })
    }
    logoUrl = trimmed || null
  }

  const hideBadge = b.hideBadge !== undefined ? !!b.hideBadge : (existing?.hide_badge ?? true)

  await sql`
    insert into autoleadss.agency_settings (clerk_user_id, brand_name, accent, logo_url, hide_badge)
    values (${userId}, ${brandName}, ${accent}, ${logoUrl}, ${hideBadge})
    on conflict (clerk_user_id) do update set
      brand_name = excluded.brand_name,
      accent = excluded.accent,
      logo_url = excluded.logo_url,
      hide_badge = excluded.hide_badge,
      updated_at = now()
  `
  return sendJson(res, 200, { settings: agencySettingsFromRow({ brand_name: brandName, accent, logo_url: logoUrl, hide_badge: hideBadge }) })
}
