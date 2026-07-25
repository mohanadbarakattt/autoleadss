import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'

/** DELETE /api/domains/:id — owner-scoped, same no-existence-check template as
 * api/funnels/[id].ts and api/products/[id].ts. */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  const id = queryParam(req, 'id')
  if (!id) return sendJson(res, 400, { error: 'Missing domain id.' })

  if (req.method === 'DELETE') {
    await sql`delete from autoleadss.domains where id = ${id} and clerk_user_id = ${userId}`
    return sendJson(res, 200, { ok: true })
  }

  return methodNotAllowed(res, ['DELETE'])
}
