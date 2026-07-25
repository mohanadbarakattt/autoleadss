import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { subAccountFromRow, type SubAccountRow } from '../_lib/mapping'

const MAX_NAME_LEN = 120

/**
 * Client sub-accounts for a white-label agency (Phase 6).
 *   GET          -> the caller's sub-accounts, oldest first
 *   POST         -> create one ({id, name, contactEmail?} — id is
 *                    client-generated, offline-first, same convention as
 *                    api/products/index.ts)
 *   DELETE ?id=  -> delete one. `funnels.sub_account_id` is
 *                    `on delete set null` (migration 0008_agency.sql), so any
 *                    of this sub-account's sites are reassigned to
 *                    "unassigned" automatically — never deleted, never
 *                    orphaned.
 *
 * Owner-scoped on every verb: keyed by clerk_user_id, so this can never read
 * or mutate another agency's sub-accounts.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  if (req.method === 'GET') {
    const rows = (await sql`
      select id, name, contact_email, created_at from autoleadss.sub_accounts
      where clerk_user_id = ${userId}
      order by created_at asc
    `) as unknown as SubAccountRow[]
    return sendJson(res, 200, { subAccounts: rows.map(subAccountFromRow) })
  }

  if (req.method === 'POST') {
    const b = (req.body ?? {}) as { id?: string; name?: string; contactEmail?: string }
    const name = typeof b.name === 'string' ? b.name.trim() : ''
    if (!b.id || !name) return sendJson(res, 400, { error: 'id and name are required.' })
    if (name.length > MAX_NAME_LEN) return sendJson(res, 400, { error: `name must be ${MAX_NAME_LEN} characters or fewer.` })
    await sql`
      insert into autoleadss.sub_accounts (id, clerk_user_id, name, contact_email)
      values (${b.id}, ${userId}, ${name}, ${typeof b.contactEmail === 'string' && b.contactEmail.trim() ? b.contactEmail.trim() : null})
    `
    return sendJson(res, 201, { ok: true, id: b.id })
  }

  if (req.method === 'DELETE') {
    const id = queryParam(req, 'id')
    if (!id) return sendJson(res, 400, { error: 'id is required.' })
    await sql`delete from autoleadss.sub_accounts where id = ${id} and clerk_user_id = ${userId}`
    return sendJson(res, 200, { ok: true })
  }

  return methodNotAllowed(res, ['GET', 'POST', 'DELETE'])
}
