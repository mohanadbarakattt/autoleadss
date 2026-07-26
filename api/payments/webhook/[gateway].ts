import { getSql } from '../../_lib/db'
import { methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../../_lib/http'
import { toSafeInt } from '../../_lib/money'
import { readRawBody } from '../../_lib/rawBody'
import { getAdapter, getGatewayInfo } from '../../_lib/payments/registry'
import { canTransition } from '../../_lib/payments/status'
import type { PaymentStatus } from '../../_lib/payments/types'

/**
 * POST /api/payments/webhook/[gateway] — the money-critical route, split into
 * a read-only phase (decide) and a single-statement write phase (apply), so
 * that every rejection path (404/409/noop) leaves NOTHING written and a
 * retry re-evaluates from a clean slate:
 *
 *   1. Resolve the adapter for `gateway`; unknown/unimplemented -> 404, no writes.
 *   2. verifyWebhook() over the RAW body -> null means 400, no writes, ever.
 *   3. Reject non-integer/<=0 amountMinor before any write (money discipline).
 *   4. READ-ONLY: load the payment by (gateway, gateway_ref). Missing -> 404,
 *      nothing written — NOT the ledger either (see the note below on why the
 *      old design poisoned event ids on 404).
 *   5. Amount/currency must match the stored payment exactly, or 409 — comparing
 *      only after coercing through toSafeInt(), never comparing the DB's raw
 *      bigint value against a JS number directly (see the note below).
 *   6. canTransition(current, next) false -> 200 no-op, nothing written.
 *   7. WRITE: one statement inserts the ledger row AND flips the status,
 *      each gated on the other. See the comment above that statement for why
 *      this is what actually fixes retry-after-failure.
 *
 * WHY THE LEDGER INSERT MOVED: the previous version inserted the payment_events
 * row as its OWN statement, before even loading the payment, to use its
 * primary key as an early dedup gate. But four exit paths after that insert
 * (404, 409, a thrown error, concurrent-update) never deleted it — so on the
 * gateway's very next retry, `on conflict (gateway, event_id) do nothing`
 * silently ate the redelivery and the payment was never applied, with no way
 * to recover short of a manual DB fix. Doing the read-only checks FIRST and
 * writing the ledger row only atomically WITH the status flip means every
 * early return is a true no-op: the gateway's retry re-runs the read-only
 * checks against current state and reprocesses correctly once whatever was
 * transient (a payment row that hadn't been created yet, a mid-write crash)
 * has cleared.
 *
 * WHY amount_minor NEEDS toSafeInt(): `autoleadss.payments.amount_minor` is
 * `bigint` (Postgres OID 20). The Neon driver's text-mode parser returns OID 20
 * as a STRING to avoid silent precision loss above 2^53 — never a JS number,
 * regardless of what a TS row-shape annotation claims. Comparing that string
 * against `event.amountMinor` (a real number, from the webhook) with `!==`
 * always mismatches ("5000" !== 5000), which used to 409 every legitimate
 * payment. toSafeInt() coerces and asserts, so a malformed value throws
 * instead of comparing wrong. The write phase additionally folds
 * amount/currency into Postgres's own WHERE clause, so the DB compares in its
 * own types too and the check can't be bypassed by a race between the read
 * and the write.
 *
 * RAW BODY: signature verification must run over the exact bytes the gateway
 * signed — re-serializing a parsed JSON body can reorder keys/whitespace and
 * silently break verification against a real gateway. bodyParser is disabled
 * below (config export) so `req` is Vercel's raw IncomingMessage stream in
 * production; tests set `req.body` to the raw string directly (same
 * convenience api/whatsapp/webhook.test.ts uses), which readRawBody() honors
 * before falling back to reading the stream. Capped at MAX_BODY_BYTES so a
 * hostile sender can't force us to buffer an unbounded stream into memory.
 */


/** Bounded in-request retries for the decide→apply race. A losing racer writes
 * nothing, so re-deciding is safe; 3 is plenty for a momentary row-lock contest
 * and stops a pathological loop. */
const MAX_APPLY_ATTEMPTS = 3

interface PaymentRow {
  id: string
  status: PaymentStatus
  amount_minor: string // bigint over the wire — always route through toSafeInt()
  currency: string
}

interface ApplyRow {
  inserted: string // count(*) is also bigint over the wire
  updated: string
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

  let raw: string
  try {
    raw = await readRawBody(req)
  } catch {
    return sendJson(res, 413, { error: 'payload too large' })
  }

  const event = adapter.verifyWebhook(raw, req.headers as Record<string, string | string[] | undefined>, secret)
  if (!event) return sendJson(res, 400, { error: 'signature verification failed' })

  if (!Number.isSafeInteger(event.amountMinor) || event.amountMinor <= 0) {
    return sendJson(res, 400, { error: 'invalid amountMinor' })
  }

  try {
    // Decide-then-apply, retried a bounded number of times. A retry happens ONLY
    // when a concurrent delivery won the row between our read and our write —
    // in which case nothing of ours was written, so re-reading and deciding
    // again from current state is safe and is what settles the race in-process
    // rather than bouncing it back to the gateway.
    for (let attempt = 1; attempt <= MAX_APPLY_ATTEMPTS; attempt++) {
    // ---- Read-only phase. No write happens below until every check passes. ----
    const rows = (await sql`
      select id, status, amount_minor, currency from autoleadss.payments
      where gateway = ${gateway} and gateway_ref = ${event.gatewayRef}
    `) as unknown as PaymentRow[]
    const payment = rows[0]
    if (!payment) return sendJson(res, 404, { error: 'payment not found' })

    const storedAmount = toSafeInt(payment.amount_minor, 'amount_minor')
    if (storedAmount !== event.amountMinor || payment.currency !== event.currency) {
      return sendJson(res, 409, { error: 'amount/currency mismatch' })
    }

    if (!canTransition(payment.status, event.status)) {
      return sendJson(res, 200, { ok: true, noop: true })
    }

    // ---- Write phase: one statement, all-or-nothing. ----
    // ORDER MATTERS, AND IT IS THE OPPOSITE OF THE OBVIOUS ONE. `upd` runs
    // first and `ins` is gated on it — the ledger row is written IF AND ONLY IF
    // the status actually moved.
    //
    // It used to be the other way round (ins guarded by a read, upd gated on
    // ins), with a comment claiming the `updated === 0` branch was unreachable
    // because "both check the identical predicate against the same snapshot".
    // That reasoning is false: `ins`'s guard is a plain snapshot READ, while
    // `upd` is an UPDATE that blocks on the row lock and RE-EVALUATES its WHERE
    // against the newly committed row (EvalPlanQual). So a concurrent delivery
    // that won the lock left ins matching and upd not — committing a ledger row
    // with NO effect. A later redelivery of that event then hit `on conflict do
    // nothing` and short-circuited as "already handled".
    //
    // Whether that DROPPED anything depended on a property nobody had written
    // down: it is only harmful if the loser's transition is still legal after
    // the winner's. With today's table it never is — `pending` allows
    // {paid,failed,expired} and `paid` allows only {refunded}, which do not
    // intersect — so the stray ledger row was harmless in practice. That safety
    // was accidental, unstated, and one added transition away from becoming a
    // silent money-loss bug (see status.test.ts, which now pins the invariant).
    //
    // Inverting the gating removes the dependency entirely: a losing racer
    // writes nothing at all, so it is always fully reprocessable regardless of
    // what the transition table later allows. Genuine replays of an applied
    // event are still caught earlier by canTransition() in the read-only phase.
    // The ledger stays as the audit record.
    const applied = (await sql`
      with upd as (
        update autoleadss.payments
        set status = ${event.status}, updated_at = now()
        where id = ${payment.id} and status = ${payment.status}
          and amount_minor = ${event.amountMinor} and currency = ${event.currency}
        returning id
      ),
      ins as (
        insert into autoleadss.payment_events (gateway, event_id, payment_id)
        select ${gateway}, ${event.eventId}, ${payment.id}
        where exists (select 1 from upd)
        on conflict (gateway, event_id) do nothing
        returning gateway
      )
      select (select count(*) from ins) as inserted, (select count(*) from upd) as updated
    `) as unknown as ApplyRow[]

    const outcome = applied[0]
    const updated = outcome ? toSafeInt(outcome.updated, 'updated') : 0

    // The effect landing is what "handled" means. `inserted` can only be 0 here
    // if a ledger row for this event id already existed, which the forward-only
    // machine makes unreachable — and even then the status DID move, so
    // reporting success is correct and re-running would be the wrong answer.
    if (updated > 0) return sendJson(res, 200, { ok: true })

    // Lost the race. Nothing of ours was written (ins is gated on upd), so the
    // loop re-reads and decides again from current state — which may still be a
    // legal transition (the refunded-after-paid case) and must not be dropped.
    if (attempt === MAX_APPLY_ATTEMPTS) {
      console.error('[payments][webhook] contention exhausted', { gateway, eventId: event.eventId })
      // 503, not 409: this is transient and the gateway SHOULD redeliver.
      return sendJson(res, 503, { error: 'contended, retry' })
    }
    }
  } catch (err) {
    // FAIL CLOSED — a 200 here would tell the gateway "handled" while the
    // status flip never landed. 500 so it retries, same discipline as
    // api/whatsapp/webhook.ts's inbound-store failure path. The write phase
    // above is one statement, so a throw here has committed nothing.
    console.error('[payments][webhook] processing failed', err)
    return sendJson(res, 500, { error: 'processing failed' })
  }
}

/** Signature verification needs the raw body — see the module doc comment. */
export const config = { api: { bodyParser: false } }
