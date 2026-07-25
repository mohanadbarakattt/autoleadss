import { randomUUID } from 'node:crypto'
import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { validateHostname } from '../_lib/domains'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { domainFromRow, type DomainRow } from '../_lib/mapping'

/**
 * GET /api/domains — list the caller's custom domains (across all their
 * funnels — a merchant typically has one storefront, so client-side filtering
 * by funnelId is enough; see src/saas/db/domains.ts).
 *
 * POST /api/domains — add one. Body: `{ funnelId, hostname }`. Validates the
 * hostname (api/_lib/domains.ts — rejects our own domains, another merchant's
 * free subdomain, and anything syntactically invalid), confirms the funnel
 * belongs to the caller, and generates a fresh verification token. The
 * response includes the exact TXT record the owner must create — verification
 * itself only ever happens via a real DNS lookup (api/domains/verify.ts),
 * never here.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  if (req.method === 'GET') {
    const rows = (await sql`
      select id, funnel_id, hostname, verified, verification_token, created_at, verified_at
      from autoleadss.domains
      where clerk_user_id = ${userId}
      order by created_at desc
    `) as unknown as DomainRow[]
    return sendJson(res, 200, { domains: rows.map(domainFromRow) })
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as { funnelId?: string; hostname?: string }
    if (!body.funnelId) return sendJson(res, 400, { error: 'funnelId is required.' })

    const validation = validateHostname(body.hostname)
    if (!validation.ok) return sendJson(res, 400, { error: validation.error })
    const hostname = validation.hostname

    const funnelRows = (await sql`
      select id from autoleadss.funnels where id = ${body.funnelId} and clerk_user_id = ${userId}
    `) as unknown as { id: string }[]
    if (!funnelRows[0]) return sendJson(res, 404, { error: 'Funnel not found.' })

    const existing = (await sql`select id from autoleadss.domains where hostname = ${hostname}`) as unknown as { id: string }[]
    if (existing[0]) return sendJson(res, 409, { error: 'This hostname is already in use.' })

    const id = `dom_${randomUUID()}`
    const verificationToken = randomUUID()
    await sql`
      insert into autoleadss.domains (id, clerk_user_id, funnel_id, hostname, verification_token)
      values (${id}, ${userId}, ${body.funnelId}, ${hostname}, ${verificationToken})
    `
    return sendJson(res, 201, {
      domain: {
        id,
        funnelId: body.funnelId,
        hostname,
        verified: false,
        verificationToken,
        createdAt: Date.now(),
      },
    })
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
