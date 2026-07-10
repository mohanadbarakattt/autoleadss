import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import type { Lead } from '../../src/saas/types'

/** PATCH /api/leads/:id — update a lead's status (owner-scoped). */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  const id = queryParam(req, 'id')
  if (!id) return sendJson(res, 400, { error: 'Missing lead id.' })

  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH'])

  const body = (req.body ?? {}) as Partial<Lead>
  if (!body.status) return sendJson(res, 400, { error: 'status is required.' })

  await sql`update autoleadss.leads set status = ${body.status} where id = ${id} and clerk_user_id = ${userId}`
  return sendJson(res, 200, { ok: true })
}
