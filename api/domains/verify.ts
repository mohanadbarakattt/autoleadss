import { resolveTxt } from 'node:dns/promises'
import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'

export type VerifyFailureReason = 'nxdomain' | 'no_record' | 'mismatch' | 'lookup_failed'

interface DomainRow {
  hostname: string
  verification_token: string
}

/**
 * POST /api/domains/verify — body `{ id }`. Owner-scoped lookup, then a REAL
 * DNS TXT query of `_autoleadss.<hostname>` compared against the stored
 * verification_token. Only a genuine match flips `verified`. Never a
 * checkbox, never simulated: a DNS failure or mismatch stays unverified and
 * reports which of three distinguishable problems it was — these are
 * different things for the user to go fix (the record isn't there yet vs. the
 * domain itself doesn't resolve vs. the value is wrong).
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  const body = (req.body ?? {}) as { id?: string }
  if (!body.id) return sendJson(res, 400, { error: 'id is required.' })

  const rows = (await sql`
    select hostname, verification_token from autoleadss.domains where id = ${body.id} and clerk_user_id = ${userId}
  `) as unknown as DomainRow[]
  const domain = rows[0]
  if (!domain) return sendJson(res, 404, { error: 'Domain not found.' })

  let records: string[][]
  try {
    records = await resolveTxt(`_autoleadss.${domain.hostname}`)
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code
    const reason: VerifyFailureReason = code === 'ENOTFOUND' ? 'nxdomain' : code === 'ENODATA' ? 'no_record' : 'lookup_failed'
    return sendJson(res, 200, { verified: false, reason })
  }

  if (!records.length) return sendJson(res, 200, { verified: false, reason: 'no_record' })

  const matches = records.some((chunks) => chunks.join('').trim() === domain.verification_token)
  if (!matches) return sendJson(res, 200, { verified: false, reason: 'mismatch' satisfies VerifyFailureReason })

  await sql`update autoleadss.domains set verified = true, verified_at = now() where id = ${body.id} and clerk_user_id = ${userId}`
  return sendJson(res, 200, { verified: true })
}
