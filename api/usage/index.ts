import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { currentPeriod, incrementUsageCounter, type UsageMetric } from '../_lib/usage'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'

interface UsageRow {
  whatsapp_count: number
  ai_action_count: number
}

/**
 * GET /api/usage — current-period WhatsApp-AI / AI-action counts for the caller.
 * POST /api/usage — increments one metric (body: `{ metric, by? }`) and returns the
 * updated counts. Backs entitlements.ts's `whatsappCap`/`aiActionCap` caps
 * (PRICING-SPEC-DRAFT.md §2.2) once the Neon backend is live; the client falls back
 * to a localStorage-only counter otherwise (src/saas/billing/usage.ts).
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  const period = currentPeriod()

  if (req.method === 'GET') {
    const rows = (await sql`
      select whatsapp_count, ai_action_count from autoleadss.usage_counters
      where clerk_user_id = ${userId} and period = ${period}
    `) as unknown as UsageRow[]
    const row = rows[0]
    return sendJson(res, 200, { period, whatsapp: row?.whatsapp_count ?? 0, aiAction: row?.ai_action_count ?? 0 })
  }

  if (req.method === 'POST') {
    const body = req.body as { metric?: string; by?: number } | undefined
    const metric = body?.metric as UsageMetric | undefined
    if (metric !== 'whatsapp' && metric !== 'aiAction') {
      return sendJson(res, 400, { error: 'metric must be "whatsapp" or "aiAction".' })
    }
    // Clamp so one malformed/abusive client call can't write an absurd counter value.
    const by = Math.max(1, Math.min(50, Math.floor(body?.by ?? 1)))

    const counts = await incrementUsageCounter(sql, userId, metric, by)
    return sendJson(res, 200, counts)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
