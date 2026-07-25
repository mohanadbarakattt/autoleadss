import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { leadFromRowWithFunnel, type LeadWithFunnelRow } from '../_lib/mapping'

const LEAD_STATUSES = new Set(['new', 'qualified', 'won', 'lost'])
const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

/** Parses a query param as a non-negative integer: `undefined` when the param is
 * absent (caller applies its default), `null` when present but not a clean
 * non-negative integer — callers 400 on `null` rather than silently coercing it
 * (e.g. `Number('-5 rows')` would otherwise pass through as NaN-adjacent junk). */
function parseNonNegativeInt(v: string | undefined): number | null | undefined {
  if (v === undefined) return undefined
  return /^\d+$/.test(v) ? Number(v) : null
}

/**
 * GET /api/leads — the caller's leads across ALL their funnels, newest first,
 * each carrying its funnel's id + name for provenance. Sibling to
 * api/orders/index.ts (same auth/scoping/501 shape); unlike that one, this
 * supports `status` / `funnelId` filters and a hard-capped `limit`/`offset`
 * since a merchant's total lead count is unbounded where their order count
 * isn't yet.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const status = queryParam(req, 'status')
  if (status !== undefined && !LEAD_STATUSES.has(status)) {
    return sendJson(res, 400, { error: `Invalid status. Use one of: ${[...LEAD_STATUSES].join(', ')}.` })
  }
  const funnelId = queryParam(req, 'funnelId')

  const limitParsed = parseNonNegativeInt(queryParam(req, 'limit'))
  if (limitParsed === null || limitParsed === 0 || (limitParsed !== undefined && limitParsed > MAX_LIMIT)) {
    return sendJson(res, 400, { error: `limit must be an integer between 1 and ${MAX_LIMIT}.` })
  }
  const limit = limitParsed ?? DEFAULT_LIMIT

  const offsetParsed = parseNonNegativeInt(queryParam(req, 'offset'))
  if (offsetParsed === null) {
    return sendJson(res, 400, { error: 'offset must be a non-negative integer.' })
  }
  const offset = offsetParsed ?? 0

  const where = ['l.clerk_user_id = $1']
  const params: unknown[] = [userId]
  if (status !== undefined) {
    params.push(status)
    where.push(`l.status = $${params.length}`)
  }
  if (funnelId !== undefined) {
    params.push(funnelId)
    where.push(`l.funnel_id = $${params.length}`)
  }
  params.push(limit)
  const limitPlaceholder = `$${params.length}`
  params.push(offset)
  const offsetPlaceholder = `$${params.length}`

  const rows = (await sql.query(
    `select l.id, l.funnel_id, l.name, l.phone, l.email, l.message, l.source, l.status, l.created_at, f.name as funnel_name
     from autoleadss.leads l
     join autoleadss.funnels f on f.id = l.funnel_id
     where ${where.join(' and ')}
     order by l.created_at desc
     limit ${limitPlaceholder} offset ${offsetPlaceholder}`,
    params,
  )) as unknown as LeadWithFunnelRow[]

  return sendJson(res, 200, { leads: rows.map(leadFromRowWithFunnel) })
}
