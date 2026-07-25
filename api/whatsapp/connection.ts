import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { sendJson, methodNotAllowed, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'

/**
 * WhatsApp connection CRUD + the shared inbox listing.
 *
 *   GET  ?funnelId=  -> the connection for that funnel (SECRETS STRIPPED)
 *   GET  ?conversations=<connectionId> -> latest message per contact
 *   GET  ?messages=<connectionId>&contact=<waFrom> -> the full thread with one contact
 *   POST -> create or update a connection
 *
 * The access token is a Meta credential that can send messages as the owner's
 * business. It is written but NEVER read back to the browser — the connect
 * screen only needs to know a connection exists, not what the token is.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  const sql = getSql()
  if (!sql) return sendJson(res, 503, { error: 'backend not configured' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  if (req.method === 'GET') {
    const q = (req.query ?? {}) as Record<string, string | undefined>

    if (q.conversations) {
      // Latest message per contact — the inbox list.
      const rows = await sql`
        select distinct on (wa_from) wa_from, body, direction, created_at
        from autoleadss.whatsapp_messages
        where connection_id = ${q.conversations} and clerk_user_id = ${userId}
        order by wa_from, created_at desc
      `
      return sendJson(res, 200, { conversations: rows })
    }

    if (q.messages) {
      // The full thread with one contact — the inbox's thread view. Oldest
      // first, so a reply renders below what it replies to.
      if (!q.contact) return sendJson(res, 400, { error: 'contact is required.' })
      const rows = await sql`
        select id, wa_from, body, direction, created_at
        from autoleadss.whatsapp_messages
        where connection_id = ${q.messages} and clerk_user_id = ${userId} and wa_from = ${q.contact}
        order by created_at asc
      `
      return sendJson(res, 200, { messages: rows })
    }

    if (!q.funnelId) return sendJson(res, 400, { error: 'funnelId is required.' })
    const rows = (await sql`
      select id, funnel_id, phone_number_id, waba_id, display_phone, status
      from autoleadss.whatsapp_connections
      where clerk_user_id = ${userId} and funnel_id = ${q.funnelId}
      limit 1
    `) as unknown as unknown[]
    // Note the SELECT: access_token and verify_token are deliberately absent.
    return sendJson(res, 200, { connection: rows[0] ?? null })
  }

  if (req.method !== 'POST') return methodNotAllowed(res, ['GET', 'POST'])

  const b = (req.body ?? {}) as Record<string, unknown>
  const funnelId = typeof b.funnelId === 'string' ? b.funnelId : ''
  const phoneNumberId = typeof b.phoneNumberId === 'string' ? b.phoneNumberId : ''
  const accessToken = typeof b.accessToken === 'string' ? b.accessToken : ''
  const verifyToken = typeof b.verifyToken === 'string' ? b.verifyToken : ''
  if (!funnelId || !phoneNumberId || !accessToken || !verifyToken) {
    return sendJson(res, 400, { error: 'funnelId, phoneNumberId, accessToken and verifyToken are required.' })
  }

  const id = `wac_${funnelId}_${phoneNumberId}`
  try {
    await sql`
      insert into autoleadss.whatsapp_connections
        (id, clerk_user_id, funnel_id, phone_number_id, waba_id, display_phone, access_token, verify_token, status)
      values (${id}, ${userId}, ${funnelId}, ${phoneNumberId},
              ${typeof b.wabaId === 'string' ? b.wabaId : null},
              ${typeof b.displayPhone === 'string' ? b.displayPhone : null},
              ${accessToken}, ${verifyToken}, 'connected')
      on conflict (id) do update set
        phone_number_id = excluded.phone_number_id,
        waba_id = excluded.waba_id,
        display_phone = excluded.display_phone,
        access_token = excluded.access_token,
        verify_token = excluded.verify_token,
        status = 'connected',
        updated_at = now()
    `
  } catch (err) {
    // Fail LOUD: a connection the owner believes they saved but which is not
    // stored means every inbound message silently goes nowhere.
    console.error('[whatsapp][CONNECTION-SAVE-FAILED]', { funnelId, err })
    return sendJson(res, 500, { error: 'could not save the connection' })
  }
  return sendJson(res, 200, { ok: true, id })
}
