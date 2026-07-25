import { getSql } from '../../_lib/db'
import { methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../../_lib/http'
import { getAdapter, getGatewayInfo } from '../../_lib/payments/registry'
import { canTransition } from '../../_lib/payments/status'
import type { PaymentStatus } from '../../_lib/payments/types'

/**
 * POST /api/payments/webhook/[gateway] — the money-critical route. Order of
 * operations, each one a deliberate poison-test target (see webhook.test.ts):
 *
 *   1. Resolve the adapter for `gateway`; unknown/unimplemented -> 404, no writes.
 *   2. verifyWebhook() over the RAW body -> null means 400, no writes, ever.
 *   3. Reject non-integer/<=0 amountMinor before any write (money discipline).
 *   4. Dedupe: insert into payment_events, PK (gateway, event_id). 0 rows
 *      inserted -> already processed -> 200, no further writes (replay-safe).
 *   5. Load the payment by (gateway, gateway_ref). Missing -> 404.
 *   6. Amount/currency must match the stored payment exactly, or 409 —
 *      refusing rather than trusting the webhook's claimed amount is what
 *      stops underpayment fraud.
 *   7. canTransition(current, next) false -> 200 no-op (out-of-order/duplicate
 *      status), never an illegal write (e.g. paid -> pending).
 *   8. Apply the status flip.
 *
 * RAW BODY: signature verification must run over the exact bytes the gateway
 * signed — re-serializing a parsed JSON body can reorder keys/whitespace and
 * silently break verification against a real gateway. bodyParser is disabled
 * below (config export) so `req` is Vercel's raw IncomingMessage stream in
 * production; tests set `req.body` to the raw string directly (same
 * convenience api/whatsapp/webhook.test.ts uses), which readRawBody() honors
 * before falling back to reading the stream.
 */

async function readRawBody(req: VercelApiRequest): Promise<string> {
  if (typeof req.body === 'string') return req.body
  const chunks: Buffer[] = []
  for await (const chunk of req as unknown as AsyncIterable<Buffer | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

interface PaymentRow {
  id: string
  status: PaymentStatus
  amount_minor: number
  currency: string
}

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const gateway = queryParam(req, 'gateway')
  const info = gateway ? getGatewayInfo(gateway) : undefined
  const adapter = gateway ? getAdapter(gateway) : null
  if (!info || !adapter) return sendJson(res, 404, { error: `Unknown or unimplemented gateway: ${gateway ?? ''}` })

  // Phase 3b resolves a real per-gateway (often per-merchant) webhook secret
  // from the connected gateway's credentials. The fake adapter is a flat
  // single-secret test double, so this is deliberately the only case wired up.
  const secret = gateway === 'fake' ? process.env.PAYMENTS_FAKE_WEBHOOK_SECRET : undefined
  if (!secret) return sendJson(res, 404, { error: 'gateway not configured' })

  const sql = getSql()
  if (!sql) return sendJson(res, 503, { error: 'backend not configured' })

  const raw = await readRawBody(req)
  const event = adapter.verifyWebhook(raw, req.headers as Record<string, string | string[] | undefined>, secret)
  if (!event) return sendJson(res, 400, { error: 'signature verification failed' })

  if (!Number.isInteger(event.amountMinor) || event.amountMinor <= 0) {
    return sendJson(res, 400, { error: 'invalid amountMinor' })
  }

  try {
    const inserted = (await sql`
      insert into autoleadss.payment_events (gateway, event_id, received_at)
      values (${gateway}, ${event.eventId}, now())
      on conflict (gateway, event_id) do nothing
      returning gateway
    `) as unknown as unknown[]
    if (inserted.length === 0) return sendJson(res, 200, { ok: true, deduped: true })

    const rows = (await sql`
      select id, status, amount_minor, currency from autoleadss.payments
      where gateway = ${gateway} and gateway_ref = ${event.gatewayRef}
    `) as unknown as PaymentRow[]
    const payment = rows[0]
    if (!payment) return sendJson(res, 404, { error: 'payment not found' })

    if (payment.amount_minor !== event.amountMinor || payment.currency !== event.currency) {
      return sendJson(res, 409, { error: 'amount/currency mismatch' })
    }

    if (!canTransition(payment.status, event.status)) {
      return sendJson(res, 200, { ok: true, noop: true })
    }

    // ATOMICITY: one Postgres statement is inherently all-or-nothing, so the
    // status flip and the ledger row's payment_id link either both land or
    // neither does — no separate transaction API needed. The payments UPDATE
    // is also gated on `status = <the status we just read>` (optimistic
    // concurrency): if a concurrent webhook already changed it since our
    // SELECT, this CTE returns no row, the events UPDATE's EXISTS() is false,
    // and we correctly refuse below instead of overwriting a concurrent write.
    const applied = (await sql`
      with updated as (
        update autoleadss.payments
        set status = ${event.status}, updated_at = now()
        where id = ${payment.id} and status = ${payment.status}
        returning id
      )
      update autoleadss.payment_events
      set payment_id = ${payment.id}
      where gateway = ${gateway} and event_id = ${event.eventId}
        and exists (select 1 from updated)
      returning payment_id
    `) as unknown as unknown[]

    if (applied.length === 0) return sendJson(res, 409, { error: 'concurrent update' })
    return sendJson(res, 200, { ok: true })
  } catch (err) {
    // FAIL CLOSED — a 200 here would tell the gateway "handled" while the
    // status flip never landed. 500 so it retries, same discipline as
    // api/whatsapp/webhook.ts's inbound-store failure path.
    console.error('[payments][webhook] processing failed', err)
    return sendJson(res, 500, { error: 'processing failed' })
  }
}

/** Signature verification needs the raw body — see the module doc comment. */
export const config = { api: { bodyParser: false } }
