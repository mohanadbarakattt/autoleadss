import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import type { Funnel } from '../../src/saas/types'

/** PATCH /api/funnels/:id — update. DELETE /api/funnels/:id — delete. Both owner-scoped. */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  const id = queryParam(req, 'id')
  if (!id) return sendJson(res, 400, { error: 'Missing funnel id.' })

  if (req.method === 'DELETE') {
    await sql`delete from autoleadss.funnels where id = ${id} and clerk_user_id = ${userId}`
    return sendJson(res, 200, { ok: true })
  }

  if (req.method === 'PATCH') {
    // Never rewrite the PK or the owner; whitelist columns explicitly.
    const patch = (req.body ?? {}) as Partial<Funnel>
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    function col(name: string, value: unknown) {
      fields.push(`${name} = $${i++}`)
      values.push(value)
    }
    if (patch.name !== undefined) col('name', patch.name)
    if (patch.slug !== undefined) col('slug', patch.slug)
    if (patch.industry !== undefined) col('industry', patch.industry)
    if (patch.language !== undefined) col('language', patch.language)
    if (patch.status !== undefined) col('status', patch.status)
    if (patch.accent !== undefined) col('accent', patch.accent)
    if (patch.spec !== undefined) col('spec', JSON.stringify(patch.spec))
    if (patch.visits !== undefined) col('visits', patch.visits)
    if (patch.visitsByDay !== undefined) col('visits_by_day', JSON.stringify(patch.visitsByDay))
    col('updated_at', new Date().toISOString())

    if (!fields.length) return sendJson(res, 400, { error: 'No updatable fields in body.' })

    values.push(id, userId)
    const idPlaceholder = `$${i++}`
    const ownerPlaceholder = `$${i++}`
    await sql.query(
      `update autoleadss.funnels set ${fields.join(', ')} where id = ${idPlaceholder} and clerk_user_id = ${ownerPlaceholder}`,
      values,
    )
    return sendJson(res, 200, { ok: true })
  }

  return methodNotAllowed(res, ['PATCH', 'DELETE'])
}
