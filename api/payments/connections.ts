import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { encryptCredentials } from '../_lib/payments/crypto'
import { getGatewayInfo } from '../_lib/payments/registry'

interface ConnectionRow {
  gateway: string
  credentials_hint: string | null
  status: string
}

/**
 * GET /api/payments/connections — list the caller's connected gateways
 * (gateway, status, hint — never the encrypted credentials or plaintext).
 * POST — connect (validate the gateway id, encrypt credentials, upsert).
 * DELETE — disconnect.
 *
 * Fail-closed: 501 if DATABASE_URL or PAYMENTS_ENCRYPTION_KEY is missing.
 * Never fall back to storing plaintext credentials.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })
  if (!process.env.PAYMENTS_ENCRYPTION_KEY) {
    return sendJson(res, 501, { error: 'Payments encryption key not configured.' })
  }

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  if (req.method === 'GET') {
    const rows = (await sql`
      select gateway, credentials_hint, status
      from autoleadss.payment_connections
      where clerk_user_id = ${userId}
      order by created_at desc
    `) as unknown as ConnectionRow[]
    return sendJson(res, 200, { connections: rows })
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as { gateway?: string; credentials?: string; credentialsHint?: string }
    if (!body.gateway || !body.credentials) return sendJson(res, 400, { error: 'gateway and credentials are required.' })
    if (!getGatewayInfo(body.gateway)) return sendJson(res, 400, { error: `Unknown gateway: ${body.gateway}` })

    const encrypted = encryptCredentials(body.credentials)
    const id = `pc_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`
    await sql`
      insert into autoleadss.payment_connections (id, clerk_user_id, gateway, credentials_encrypted, credentials_hint, status)
      values (${id}, ${userId}, ${body.gateway}, ${encrypted}, ${body.credentialsHint ?? null}, 'connected')
      on conflict (clerk_user_id, gateway)
      do update set credentials_encrypted = excluded.credentials_encrypted,
                    credentials_hint = excluded.credentials_hint,
                    status = 'connected',
                    updated_at = now()
    `
    return sendJson(res, 201, { ok: true })
  }

  if (req.method === 'DELETE') {
    const body = (req.body ?? {}) as { gateway?: string }
    if (!body.gateway) return sendJson(res, 400, { error: 'gateway is required.' })
    await sql`delete from autoleadss.payment_connections where clerk_user_id = ${userId} and gateway = ${body.gateway}`
    return sendJson(res, 200, { ok: true })
  }

  return methodNotAllowed(res, ['GET', 'POST', 'DELETE'])
}
