import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { toSafeInt } from '../_lib/money'
import { denseUtcDays } from '../../src/saas/insights/series'
import type { InsightsSummary, LeadSourceCounts, LeadStatusCounts } from '../../src/saas/types'

const DEFAULT_WINDOW_DAYS = 14
const MAX_WINDOW_DAYS = 90

/** Parses a query param as a positive integer: `undefined` when the param is
 * absent (caller applies its default), `null` when present but not a clean
 * positive integer — same discipline as api/leads/index.ts's
 * parseNonNegativeInt, so callers 400 rather than silently coercing junk. */
function parsePositiveInt(v: string | undefined): number | null | undefined {
  if (v === undefined) return undefined
  return /^\d+$/.test(v) ? Number(v) : null
}

interface SiteRow {
  id: string
  name: string
  visits: number
  lead_count: string // bigint over the wire — always route through toSafeInt()
  leads_new: string
  leads_qualified: string
  leads_won: string
  leads_lost: string
  leads_whatsapp: string
  leads_page: string
}

interface OrderAggRow {
  currency: string
  order_count: string // bigint over the wire
  pending_value_minor: string | null // numeric (sum of bigint) over the wire
}

interface DayRow {
  day: string
  count: string // bigint over the wire
}

const EMPTY_STATUS: LeadStatusCounts = { new: 0, qualified: 0, won: 0, lost: 0 }
const EMPTY_SOURCE: LeadSourceCounts = { page: 0, whatsapp: 0 }

/**
 * GET /api/insights — cross-site rollup for the Insights dashboard (Phase 5b):
 * totals, a per-site breakdown, and bounded daily trend series. Sibling to
 * api/leads/index.ts and api/orders/index.ts (same auth/scoping/501 shape),
 * but aggregates in SQL (GROUP BY / count / sum) rather than returning rows —
 * a merchant's leads/visits history is unbounded, this response never is.
 *
 * Honesty requirement (b), no revenue metric: no order can reach 'paid' —
 * there's no implemented payment gateway (Phase 3b, parked) — so this only
 * ever reports `ordersPending`, never a revenue figure that could only ever
 * read zero.
 *
 * Honesty requirement (c), UTC vs Gulf day boundary: `visits_by_day`
 * (api/published/visit.ts) stores only a PER-DAY TOTAL per funnel, keyed by
 * UTC date, with no underlying per-visit timestamp — a visit already
 * collapsed into a UTC bucket at write time can never be correctly
 * re-bucketed into Gulf-local (UTC+4) calendar days after the fact. Leads do
 * carry a real `created_at` and could be bucketed in any timezone, but
 * pairing a UTC-only visits axis with a Gulf-local leads axis on the same
 * dashboard would be MORE misleading than either alone — the two charts
 * would disagree about where "today" starts. So both series here stay in
 * UTC, consistently, and the UI (Insights.tsx) labels that plainly rather
 * than silently presenting a UTC bucket as the merchant's local "today".
 * Revisit once visits are logged as individual timestamped events instead of
 * a collapsed daily total.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const windowParsed = parsePositiveInt(queryParam(req, 'days'))
  if (windowParsed === null || windowParsed === 0 || (windowParsed !== undefined && windowParsed > MAX_WINDOW_DAYS)) {
    return sendJson(res, 400, { error: `days must be an integer between 1 and ${MAX_WINDOW_DAYS}.` })
  }
  const windowDays = windowParsed ?? DEFAULT_WINDOW_DAYS

  // UTC midnight, (windowDays - 1) days ago — the first day included in the window.
  const windowStart = new Date()
  windowStart.setUTCHours(0, 0, 0, 0)
  windowStart.setUTCDate(windowStart.getUTCDate() - (windowDays - 1))
  const windowStartDay = windowStart.toISOString().slice(0, 10)

  const [siteRows, orderRows, visitRows, leadRows] = await Promise.all([
    sql.query(
      `select f.id, f.name, f.visits,
         count(l.id) as lead_count,
         count(l.id) filter (where l.status = 'new') as leads_new,
         count(l.id) filter (where l.status = 'qualified') as leads_qualified,
         count(l.id) filter (where l.status = 'won') as leads_won,
         count(l.id) filter (where l.status = 'lost') as leads_lost,
         count(l.id) filter (where l.source = 'whatsapp') as leads_whatsapp,
         count(l.id) filter (where l.source = 'page') as leads_page
       from autoleadss.funnels f
       left join autoleadss.leads l on l.funnel_id = f.id
       where f.clerk_user_id = $1
       group by f.id, f.name, f.visits
       order by f.created_at asc`,
      [userId],
    ),
    sql.query(
      `select currency, count(*) as order_count, sum(subtotal_minor) as pending_value_minor
       from autoleadss.orders
       where clerk_user_id = $1 and status = 'pending'
       group by currency
       order by currency`,
      [userId],
    ),
    sql.query(
      `select je.day as day, sum((je.count)::int) as count
       from autoleadss.funnels f
       cross join lateral jsonb_each_text(f.visits_by_day) as je(day, count)
       where f.clerk_user_id = $1 and je.day >= $2
       group by je.day
       order by je.day`,
      [userId, windowStartDay],
    ),
    sql.query(
      `select to_char(l.created_at at time zone 'utc', 'YYYY-MM-DD') as day, count(*) as count
       from autoleadss.leads l
       where l.clerk_user_id = $1 and l.created_at >= $2
       group by day
       order by day`,
      [userId, windowStart.toISOString()],
    ),
  ] as unknown as [Promise<SiteRow[]>, Promise<OrderAggRow[]>, Promise<DayRow[]>, Promise<DayRow[]>])

  const sites = siteRows.map((r) => ({
    id: r.id,
    name: r.name,
    visits: r.visits,
    leads: toSafeInt(r.lead_count, 'lead_count'),
    leadsByStatus: {
      new: toSafeInt(r.leads_new, 'leads_new'),
      qualified: toSafeInt(r.leads_qualified, 'leads_qualified'),
      won: toSafeInt(r.leads_won, 'leads_won'),
      lost: toSafeInt(r.leads_lost, 'leads_lost'),
    },
    leadsBySource: {
      page: toSafeInt(r.leads_page, 'leads_page'),
      whatsapp: toSafeInt(r.leads_whatsapp, 'leads_whatsapp'),
    },
  }))

  const totals = sites.reduce(
    (acc, s) => ({
      visits: acc.visits + s.visits,
      leads: acc.leads + s.leads,
      leadsByStatus: {
        new: acc.leadsByStatus.new + s.leadsByStatus.new,
        qualified: acc.leadsByStatus.qualified + s.leadsByStatus.qualified,
        won: acc.leadsByStatus.won + s.leadsByStatus.won,
        lost: acc.leadsByStatus.lost + s.leadsByStatus.lost,
      },
      leadsBySource: {
        page: acc.leadsBySource.page + s.leadsBySource.page,
        whatsapp: acc.leadsBySource.whatsapp + s.leadsBySource.whatsapp,
      },
    }),
    { visits: 0, leads: 0, leadsByStatus: { ...EMPTY_STATUS }, leadsBySource: { ...EMPTY_SOURCE } },
  )

  const ordersByCurrency = orderRows.map((r) => ({
    currency: r.currency,
    valueMinor: toSafeInt(r.pending_value_minor ?? 0, 'pending_value_minor'),
  }))
  const ordersPendingCount = orderRows.reduce((sum, r) => sum + toSafeInt(r.order_count, 'order_count'), 0)

  const visitsRollup: Record<string, number> = {}
  for (const r of visitRows) visitsRollup[r.day] = toSafeInt(r.count, 'visits_day_count')
  const leadsRollup: Record<string, number> = {}
  for (const r of leadRows) leadsRollup[r.day] = toSafeInt(r.count, 'leads_day_count')

  const summary: InsightsSummary = {
    windowDays,
    totals: { ...totals, ordersPending: { count: ordersPendingCount, byCurrency: ordersByCurrency } },
    sites,
    series: {
      visits: denseUtcDays(visitsRollup, windowDays),
      leads: denseUtcDays(leadsRollup, windowDays),
    },
  }

  return sendJson(res, 200, { insights: summary })
}
