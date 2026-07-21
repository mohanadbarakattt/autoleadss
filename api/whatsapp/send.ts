import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { sendJson, methodNotAllowed, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { hasOpenServiceWindow } from '../_lib/whatsapp'

/**
 * Outbound WhatsApp send.
 *
 * HUMAN-APPROVED BY DEFAULT. This endpoint sends a message from the owner's
 * business number to a real customer — an irreversible outbound action. It is
 * therefore driven by an operator pressing send in the shared inbox, NOT by an
 * agent deciding on its own. Auto-reply stays behind
 * WHATSAPP_AUTO_REPLY=on (default off), and even then only inside an open
 * 24-hour service window, never to open a new (billable, and to the customer
 * unsolicited) conversation.
 *
 * WINDOW RULE: outside an open window, a free-text message is not deliverable
 * at all — Meta requires an approved TEMPLATE. Rather than let Meta reject it
 * opaquely, we refuse up front with an explanation.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const sql = getSql()
  if (!sql) return sendJson(res, 503, { error: 'backend not configured' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  const body = (req.body ?? {}) as { connectionId?: unknown; to?: unknown; text?: unknown; auto?: unknown }
  const connectionId = typeof body.connectionId === 'string' ? body.connectionId : ''
  const to = typeof body.to === 'string' ? body.to : ''
  const text = typeof body.text === 'string' ? body.text.trim() : ''
  const isAuto = body.auto === true

  if (!connectionId || !to || !text) {
    return sendJson(res, 400, { error: 'connectionId, to and text are required.' })
  }

  // An agent-initiated send only happens when the owner has explicitly opted in.
  if (isAuto && process.env.WHATSAPP_AUTO_REPLY !== 'on') {
    return sendJson(res, 403, {
      error: 'auto_reply_disabled',
      message: 'Automatic replies are off. Set WHATSAPP_AUTO_REPLY=on to enable them.',
    })
  }

  // Ownership check — never let one workspace send from another's number.
  const rows = (await sql`
    select id, phone_number_id, access_token from autoleadss.whatsapp_connections
    where id = ${connectionId} and clerk_user_id = ${userId} limit 1
  `) as unknown as Array<{ id: string; phone_number_id: string; access_token: string }>
  const conn = rows[0]
  if (!conn) return sendJson(res, 404, { error: 'connection not found' })

  const windowOpen = await hasOpenServiceWindow(sql, conn.id, to)
  if (!windowOpen) {
    return sendJson(res, 409, {
      error: 'service_window_closed',
      message:
        'The 24-hour service window for this contact has closed. Free-text messages are not deliverable — an approved template is required.',
    })
  }

  // DEMO MODE: with no credentials the whole flow still works end to end, it
  // just does not reach Meta. Keeps the inbox usable before a BSP exists.
  const live = Boolean(process.env.WHATSAPP_ACCESS_TOKEN || conn.access_token)
  let providerMsgId: string | null = null

  if (live) {
    try {
      const token = process.env.WHATSAPP_ACCESS_TOKEN || conn.access_token
      const r = await fetch(`https://graph.facebook.com/v21.0/${conn.phone_number_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
      })
      if (!r.ok) {
        const detail = await r.text()
        console.error('[whatsapp][SEND-FAILED] provider rejected the message', { status: r.status, detail: detail.slice(0, 300) })
        return sendJson(res, 502, { error: 'provider_rejected', status: r.status })
      }
      const data = (await r.json()) as { messages?: Array<{ id?: string }> }
      providerMsgId = data.messages?.[0]?.id ?? null
    } catch (err) {
      console.error('[whatsapp][SEND-FAILED] network error talking to Meta', err)
      return sendJson(res, 502, { error: 'provider_unreachable' })
    }
  }

  // Record only AFTER the provider accepted it, so the inbox never shows a
  // message the customer never received.
  try {
    await sql`
      insert into autoleadss.whatsapp_messages
        (id, connection_id, clerk_user_id, wa_from, direction, body, provider_msg_id, status)
      values (${'wam_out_' + (providerMsgId ?? Date.now())}, ${conn.id}, ${userId}, ${to},
              'out', ${text}, ${providerMsgId}, ${live ? 'sent' : 'demo'})
      on conflict (provider_msg_id) do nothing
    `
  } catch (err) {
    // The message DID go out; only our copy failed. Loud, but not an error to
    // the caller — telling them it failed would invite a duplicate send.
    console.error('[whatsapp][OUTBOUND-RECORD-DROP] message sent but not stored', { connectionId, to, err })
  }

  return sendJson(res, 200, { sent: true, live, providerMsgId })
}
