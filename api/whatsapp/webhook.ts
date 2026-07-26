import { createHmac, timingSafeEqual } from 'node:crypto'
import { getSql } from '../_lib/db'
import { sendJson, methodNotAllowed, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { opensNewConversation } from '../_lib/whatsapp'
import { readRawBody } from '../_lib/rawBody'

/**
 * WhatsApp Business webhook.
 *   GET  — Meta's subscription handshake (echo hub.challenge).
 *   POST — inbound customer messages.
 *
 * Written against Meta's Cloud API payload shape, which the BSPs (Quali-D /
 * Twilio / 360dialog) also expose, so changing provider does not mean
 * rewriting this.
 *
 * TWO DELIBERATE CHOICES, both learned the hard way elsewhere in this codebase:
 *
 * 1. IDEMPOTENCY. Meta re-delivers any webhook that does not get a 2xx. The
 *    unique index on provider_msg_id makes a redelivery a no-op instead of a
 *    duplicate message AND a second billable conversation (defect class C3).
 *
 * 2. FAIL-CLOSED ON PERSISTENCE. If the message cannot be stored we return 500
 *    so Meta retries, rather than 200-and-swallow. A silently dropped customer
 *    message is the WhatsApp equivalent of the lead-capture bug (C9): the
 *    business never learns the customer wrote.
 */

/** Meta signs the RAW body with the app secret as X-Hub-Signature-256. */
function verifySignature(rawBody: string, header: string | undefined, appSecret: string): boolean {
  if (!header?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex')
  const got = header.slice('sha256='.length)
  if (got.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(got, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

interface InboundMessage {
  from: string
  id: string
  text?: { body?: string }
  type?: string
}

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method === 'GET') {
    const q = (req.query ?? {}) as Record<string, string | string[] | undefined>
    const mode = String(q['hub.mode'] ?? '')
    const token = String(q['hub.verify_token'] ?? '')
    const challenge = String(q['hub.challenge'] ?? '')
    const expected = process.env.WHATSAPP_VERIFY_TOKEN
    if (!expected) return sendJson(res, 503, { error: 'WHATSAPP_VERIFY_TOKEN not configured' })
    if (mode === 'subscribe' && token === expected) {
      res.status(200).send(challenge) // Meta wants the raw challenge, not JSON
      return
    }
    return sendJson(res, 403, { error: 'verification failed' })
  }

  if (req.method !== 'POST') return methodNotAllowed(res, ['GET', 'POST'])

  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (!appSecret) return sendJson(res, 503, { error: 'WHATSAPP_APP_SECRET not configured' })

  // RAW BYTES ONLY. This used to be `JSON.stringify(req.body ?? {})`, which is
  // wrong twice over: re-serializing reorders keys so the HMAC can't match, and
  // with bodyParser disabled (see the config export below) `req.body` is
  // undefined in the real runtime — so it hashed the literal string "{}" and
  // EVERY inbound message failed verification, was answered 403, and Meta
  // stopped redelivering it. Silent, total, permanent inbound message loss.
  // Tests hid it by assigning req.body a string.
  let raw: string
  try {
    raw = await readRawBody(req)
  } catch {
    return sendJson(res, 413, { error: 'payload too large' })
  }

  const sig = req.headers?.['x-hub-signature-256'] as string | undefined
  if (!verifySignature(raw, sig, appSecret)) {
    // 403 (non-retryable) is right for a genuine forgery, and Meta must not
    // retry one. It is the wrong answer when OUR verification is broken — but
    // the handler cannot tell those apart, and answering 500 to a real forgery
    // would invite endless redelivery of an attacker's payload. Keeping 403 and
    // logging loudly instead: a sudden burst of these means our secret or our
    // raw-body handling regressed, not that Meta started forging requests.
    console.error('[whatsapp][SIGNATURE-REJECTED]', { bytes: raw.length, hasHeader: !!sig })
    return sendJson(res, 403, { error: 'bad signature' })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return sendJson(res, 400, { error: 'invalid JSON' })
  }

  const sql = getSql()
  if (!sql) return sendJson(res, 503, { error: 'backend not configured' })

  const entries = (payload.entry ?? []) as Array<Record<string, unknown>>
  let stored = 0

  try {
    for (const entry of entries) {
      for (const change of (entry.changes ?? []) as Array<Record<string, unknown>>) {
        const value = (change.value ?? {}) as Record<string, unknown>
        const meta = (value.metadata ?? {}) as Record<string, unknown>
        const phoneNumberId = String(meta.phone_number_id ?? '')
        if (!phoneNumberId) continue

        const conn = (await sql`
          select id, clerk_user_id from autoleadss.whatsapp_connections
          where phone_number_id = ${phoneNumberId} limit 1
        `) as unknown as Array<{ id: string; clerk_user_id: string }>
        const connection = conn[0]
        // Unknown number — acknowledge so Meta stops retrying something we can
        // never satisfy, but store nothing.
        if (!connection) continue

        for (const m of (value.messages ?? []) as InboundMessage[]) {
          const body = m.text?.body ?? `[${m.type ?? 'unsupported'}]`
          const isNew = await opensNewConversation(sql, connection.id, m.from)

          const ins = (await sql`
            insert into autoleadss.whatsapp_messages
              (id, connection_id, clerk_user_id, wa_from, direction, body, provider_msg_id, status)
            values (${'wam_' + m.id}, ${connection.id}, ${connection.clerk_user_id}, ${m.from},
                    'in', ${body}, ${m.id}, 'received')
            on conflict (provider_msg_id) do nothing
            returning id
          `) as unknown as unknown[]

          if (ins.length > 0) {
            stored += 1
            if (isNew) {
              // A new 24h service window is ONE billable conversation. Metered
              // here, never per message — per-message metering would charge our
              // customer several times over for a single exchange.
              await sql`
                insert into autoleadss.usage_counters (clerk_user_id, period, whatsapp_count)
                values (${connection.clerk_user_id}, ${new Date().toISOString().slice(0, 7)}, 1)
                on conflict (clerk_user_id, period)
                do update set whatsapp_count = autoleadss.usage_counters.whatsapp_count + 1,
                              updated_at = now()
              `
            }
          }
        }
      }
    }
  } catch (err) {
    // FAIL CLOSED — a 200 here would tell Meta "handled" and lose the message.
    console.error('[whatsapp][INBOUND-DROP] could not store inbound message — 500 so Meta retries', err)
    return sendJson(res, 500, { error: 'storage failed' })
  }

  return sendJson(res, 200, { received: true, stored })
}

/** Signature verification needs the raw body. */
export const config = { api: { bodyParser: false } }
