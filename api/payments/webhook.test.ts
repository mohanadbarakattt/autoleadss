import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createHmac } from 'node:crypto'

/**
 * Poison + regression tests for api/payments/webhook/[gateway].ts. Style
 * follows api/whatsapp/webhook.test.ts (mock `../_lib/db`'s getSql), but the
 * fake here is a real in-memory table (Map), not a canned-response queue —
 * replay/double-charge/out-of-order/retry-after-failure all need actual state
 * to carry across multiple handler() calls in one test, and every test below
 * asserts that state, not just the HTTP status code.
 *
 * CRITICAL: amount_minor and count(*) are both `bigint` in Postgres (OID 20).
 * The real Neon driver's text-mode parser returns OID 20 as a STRING, never a
 * JS number — this fake deliberately does the same on every read, so a
 * regression back to comparing the DB's raw value against a JS number with
 * `!==` (which always mismatches, e.g. "5000" !== 5000) fails this suite
 * instead of only failing against a real database.
 */

const SECRET = 'fake-webhook-secret'

interface FakePayment {
  id: string
  gateway: string
  gateway_ref: string
  amount_minor: number // internal source of truth; stringified on every read
  currency: string
  status: string
}

const db = {
  payments: new Map<string, FakePayment>(),
  events: new Set<string>(),
  queries: [] as string[],
  callCount: 0,
  failAtCall: null as number | null,
  reset(seed: FakePayment[] = []) {
    this.payments = new Map(seed.map((p) => [p.id, { ...p }]))
    this.events = new Set()
    this.queries = []
    this.callCount = 0
    this.failAtCall = null
  },
}

function findByRef(gateway: string, ref: string): FakePayment | undefined {
  for (const p of db.payments.values()) if (p.gateway === gateway && p.gateway_ref === ref) return p
  return undefined
}

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')
  db.callCount += 1
  db.queries.push(text)
  if (db.failAtCall !== null && db.callCount === db.failAtCall) throw new Error('simulated db failure')

  // Read-only phase: SELECT the payment. amount_minor comes back as a STRING
  // — exactly like the real bigint-over-the-wire behavior.
  if (text.includes('select id, status, amount_minor, currency from autoleadss.payments')) {
    const [gateway, ref] = vals as [string, string]
    const p = findByRef(gateway, ref)
    return p ? [{ id: p.id, status: p.status, amount_minor: String(p.amount_minor), currency: p.currency }] : []
  }

  // Write phase: the combined ledger-insert + status-flip CTE statement.
  // Positions (see the route's template literal): 0 gateway, 1 eventId,
  // 2 payment.id (ins select), 3 payment.id (ins where), 4 payment.status
  // (ins where), 5 event.amountMinor (ins where), 6 event.currency (ins
  // where), 7 event.status (upd set), 8 payment.id (upd where), 9
  // payment.status (upd where), 10 event.amountMinor (upd where), 11
  // event.currency (upd where). 2/3/8 are the same value, as are 4/9, 5/10,
  // 6/11 — the route interpolates each literal twice, once per CTE.
  if (text.includes('with ins as')) {
    const gateway = vals[0] as string
    const eventId = vals[1] as string
    const paymentId = vals[2] as string
    const expectedStatus = vals[4] as string
    const expectedAmount = vals[5] as number
    const expectedCurrency = vals[6] as string
    const newStatus = vals[7] as string

    const key = `${gateway}:${eventId}`
    const p = db.payments.get(paymentId)
    const stateMatches = !!p && p.status === expectedStatus && p.amount_minor === expectedAmount && p.currency === expectedCurrency

    let inserted = 0
    let updated = 0
    if (stateMatches && !db.events.has(key)) {
      db.events.add(key)
      inserted = 1
      if (p) {
        p.status = newStatus
        updated = 1
      }
    }
    return [{ inserted: String(inserted), updated: String(updated) }]
  }

  throw new Error(`fake db: unmocked query shape: ${text}`)
}

vi.mock('../_lib/db', () => ({ getSql: () => fakeSql }))

const { default: handler } = await import('./webhook/[gateway]')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = (k: string, v: string) => { r.headers[k] = v }
  return r
}

function sign(raw: string): string {
  return createHmac('sha256', SECRET).update(raw).digest('hex')
}

function req(gateway: string, event: Record<string, unknown>, opts: { badSig?: boolean; noSig?: boolean } = {}) {
  const raw = JSON.stringify(event)
  const headers: Record<string, string> = {}
  if (opts.badSig) headers['x-fake-signature'] = 'f'.repeat(64)
  else if (!opts.noSig) headers['x-fake-signature'] = sign(raw)
  return { method: 'POST', query: { gateway }, body: raw, headers } as any
}

const PAYMENT: FakePayment = {
  id: 'pay_1', gateway: 'fake', gateway_ref: 'ref_1', amount_minor: 5000, currency: 'AED', status: 'pending',
}

beforeEach(() => {
  db.reset([{ ...PAYMENT }])
  process.env.PAYMENTS_FAKE_ADAPTER = '1'
  process.env.PAYMENTS_FAKE_WEBHOOK_SECRET = SECRET
})

describe('regression: string-typed amount_minor from the DB', () => {
  it('a correct webhook still confirms the payment (the fake always returns amount_minor as a string)', async () => {
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }), r)
    expect(r.statusCode).toBe(200)
    expect(r.body).toMatchObject({ ok: true })
    expect(db.payments.get('pay_1')?.status).toBe('paid')
  })
})

describe('replay', () => {
  it('same event_id twice -> exactly one state change; the replay is a no-op 200', async () => {
    const event = { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }
    const r1 = res()
    await handler(req('fake', event), r1)
    expect(r1.statusCode).toBe(200)
    expect(db.payments.get('pay_1')?.status).toBe('paid')

    const r2 = res()
    await handler(req('fake', event), r2)
    expect(r2.statusCode).toBe(200)
    expect(db.payments.get('pay_1')?.status).toBe('paid') // unchanged, not re-applied
    // Caught by canTransition (paid -> paid is false), not the ledger — after
    // the first apply, the replay's claimed status equals the current status,
    // so the read-only phase alone rejects it without an ins/upd attempt.
    expect((r2.body as any).noop).toBe(true)
  })

  it('a concurrent-delivery race for an event id already claimed is deduped even though canTransition would allow it', async () => {
    // Simulates a second, near-simultaneous delivery of the same event_id
    // whose ledger row an in-flight request already inserted, before the
    // payment status itself has moved off 'pending'. This is the scenario
    // the ledger's PK actually exists for — the replay test above is instead
    // caught earlier, by canTransition, once the status has already flipped.
    db.events.add('fake:evt_1')
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).deduped).toBe(true)
    expect(db.payments.get('pay_1')?.status).toBe('pending') // this call did not apply it
  })
})

describe('double-charge', () => {
  it('two different event ids both claiming paid -> the second is a no-op on an already-paid payment', async () => {
    const r1 = res()
    await handler(req('fake', { eventId: 'evt_A', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }), r1)
    expect(r1.statusCode).toBe(200)
    expect(db.payments.get('pay_1')?.status).toBe('paid')

    const r2 = res()
    await handler(req('fake', { eventId: 'evt_B', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }), r2)
    expect(r2.statusCode).toBe(200)
    expect((r2.body as any).noop).toBe(true) // canTransition(paid, paid) is false — rejected before any write attempt
    expect(db.payments.get('pay_1')?.status).toBe('paid') // still paid, not double-applied
  })
})

describe('missed grant / atomicity / retry-after-failure', () => {
  it('the write statement failing leaves the payment NOT paid (fail-closed), and a clean retry then succeeds', async () => {
    db.failAtCall = 2 // 1: read-only select, 2: the atomic write statement
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const event = { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }

    const r1 = res()
    await handler(req('fake', event), r1)
    spy.mockRestore()
    expect(r1.statusCode).toBe(500) // fail closed so the gateway retries, never 200-and-lose
    expect(db.payments.get('pay_1')?.status).toBe('pending') // proved: never flipped
    expect(db.events.size).toBe(0) // proved: ledger not poisoned either — nothing committed at all

    // The gateway retries the exact same delivery once the transient failure clears.
    db.failAtCall = null
    const r2 = res()
    await handler(req('fake', event), r2)
    expect(r2.statusCode).toBe(200)
    expect((r2.body as any).deduped).toBeUndefined() // genuinely reprocessed, not a stale dedup
    expect(db.payments.get('pay_1')?.status).toBe('paid')
  })
})

describe('payment-not-found / retry-after-failure', () => {
  it('404 leaves nothing written; once the payment exists, a retry of the same event applies cleanly', async () => {
    db.reset([]) // no payment seeded yet — e.g. the webhook races our own write
    const event = { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }

    const r1 = res()
    await handler(req('fake', event), r1)
    expect(r1.statusCode).toBe(404)
    expect(db.events.size).toBe(0) // the event id was never consumed

    db.payments.set('pay_1', { ...PAYMENT })
    const r2 = res()
    await handler(req('fake', event), r2)
    expect(r2.statusCode).toBe(200)
    expect((r2.body as any).deduped).toBeUndefined()
    expect(db.payments.get('pay_1')?.status).toBe('paid')
  })
})

describe('amount mismatch / retry-after-failure', () => {
  it('409 leaves nothing written; once amounts reconcile, a retry of the same event applies cleanly', async () => {
    const event = { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 6000, currency: 'AED' }

    const r1 = res()
    await handler(req('fake', event), r1)
    expect(r1.statusCode).toBe(409)
    expect(db.payments.get('pay_1')?.status).toBe('pending')
    expect(db.events.size).toBe(0)

    const payment = db.payments.get('pay_1')
    if (payment) payment.amount_minor = 6000 // reconciled out of band; the event id was never poisoned
    const r2 = res()
    await handler(req('fake', event), r2)
    expect(r2.statusCode).toBe(200)
    expect((r2.body as any).deduped).toBeUndefined()
    expect(db.payments.get('pay_1')?.status).toBe('paid')
  })
})

describe('out-of-order delivery', () => {
  it('paid then a later pending event -> stays paid, no illegal write attempted', async () => {
    const r1 = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }), r1)
    expect(db.payments.get('pay_1')?.status).toBe('paid')

    const r2 = res()
    await handler(req('fake', { eventId: 'evt_2', gatewayRef: 'ref_1', status: 'pending', amountMinor: 5000, currency: 'AED' }), r2)
    expect(r2.statusCode).toBe(200)
    expect((r2.body as any).noop).toBe(true)
    expect(db.payments.get('pay_1')?.status).toBe('paid') // never reverted
  })
})

describe('signature', () => {
  it('bad signature -> 400, zero writes (DB untouched)', async () => {
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }, { badSig: true }), r)
    expect(r.statusCode).toBe(400)
    expect(db.queries).toHaveLength(0)
    expect(db.payments.get('pay_1')?.status).toBe('pending')
  })

  it('missing signature -> 400, zero writes', async () => {
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }, { noSig: true }), r)
    expect(r.statusCode).toBe(400)
    expect(db.queries).toHaveLength(0)
  })
})

describe('oversized payload', () => {
  it('rejects a body over the byte cap before signature verification touches it', async () => {
    const huge = JSON.stringify({ eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED', pad: 'x'.repeat(300 * 1024) })
    const r = res()
    // Deliberately no valid signature — proves the size cap rejects before verifyWebhook runs.
    await handler({ method: 'POST', query: { gateway: 'fake' }, body: huge, headers: {} } as any, r)
    expect(r.statusCode).toBe(413)
    expect(db.queries).toHaveLength(0)
  })
})

describe('amount / currency mismatch', () => {
  it('amount mismatch -> 409, payment not paid', async () => {
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 6000, currency: 'AED' }), r)
    expect(r.statusCode).toBe(409)
    expect(db.payments.get('pay_1')?.status).toBe('pending')
  })

  it('currency mismatch -> 409, payment not paid', async () => {
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'USD' }), r)
    expect(r.statusCode).toBe(409)
    expect(db.payments.get('pay_1')?.status).toBe('pending')
  })
})

describe('unknown / unimplemented gateway', () => {
  it('a registered-but-unimplemented gateway (stripe) -> 404, no writes', async () => {
    const r = res()
    await handler(req('stripe', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }, { noSig: true }), r)
    expect(r.statusCode).toBe(404)
    expect(db.queries).toHaveLength(0)
  })

  it('a totally unknown gateway id -> 404, no crash, no writes', async () => {
    const r = res()
    await handler(req('not-a-real-gateway', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }, { noSig: true }), r)
    expect(r.statusCode).toBe(404)
    expect(db.queries).toHaveLength(0)
  })
})

describe('money discipline', () => {
  it('amountMinor = 0 is rejected before any write', async () => {
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 0, currency: 'AED' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.queries).toHaveLength(0)
  })

  it('negative amountMinor is rejected before any write', async () => {
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: -500, currency: 'AED' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.queries).toHaveLength(0)
  })

  it('non-integer amountMinor is rejected before any write', async () => {
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 50.5, currency: 'AED' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.queries).toHaveLength(0)
  })
})
