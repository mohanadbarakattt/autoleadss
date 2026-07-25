import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createHmac } from 'node:crypto'

/**
 * Poison tests for api/payments/webhook/[gateway].ts. Style follows
 * api/whatsapp/webhook.test.ts (mock `../_lib/db`'s getSql), but the fake here
 * is a real in-memory table (Map), not a canned-response queue — replay,
 * double-charge, and out-of-order all need actual state to carry across two
 * handler() calls in one test, and every test below asserts that state, not
 * just the HTTP status code.
 */

const SECRET = 'fake-webhook-secret'

interface FakePayment {
  id: string
  gateway: string
  gateway_ref: string
  amount_minor: number
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

  if (text.includes('insert into autoleadss.payment_events')) {
    const [gateway, eventId] = vals as [string, string]
    const key = `${gateway}:${eventId}`
    if (db.events.has(key)) return []
    db.events.add(key)
    return [{ gateway }]
  }
  if (text.includes('select id, status, amount_minor, currency from autoleadss.payments')) {
    const [gateway, ref] = vals as [string, string]
    const p = findByRef(gateway, ref)
    return p ? [{ ...p }] : []
  }
  if (text.includes('update autoleadss.payments')) {
    const [newStatus, id, whereStatus] = vals as [string, string, string]
    const p = db.payments.get(id)
    if (p && p.status === whereStatus) {
      p.status = newStatus
      return [{ payment_id: id }]
    }
    return []
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

describe('replay', () => {
  it('same event_id twice -> exactly one state change; the replay is a no-op 200', async () => {
    const event = { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }
    const r1 = res()
    await handler(req('fake', event), r1)
    expect(r1.statusCode).toBe(200)
    expect(db.payments.get('pay_1')?.status).toBe('paid')
    const queriesAfterFirst = db.queries.length

    const r2 = res()
    await handler(req('fake', event), r2)
    expect(r2.statusCode).toBe(200)
    expect(db.payments.get('pay_1')?.status).toBe('paid') // unchanged, not re-applied
    expect(db.queries.length).toBe(queriesAfterFirst + 1) // only the dedupe insert ran, nothing after
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
    expect(db.payments.get('pay_1')?.status).toBe('paid') // still paid, not double-applied
  })
})

describe('missed grant / atomicity', () => {
  it('the dependent write failing leaves the payment NOT paid (fail-closed)', async () => {
    db.failAtCall = 3 // 1: dedupe insert, 2: payment select, 3: the atomic status-flip statement
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const r = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }), r)
    spy.mockRestore()
    expect(r.statusCode).toBe(500) // fail closed so the gateway retries, never 200-and-lose
    expect(db.payments.get('pay_1')?.status).toBe('pending') // proved: never flipped
  })
})

describe('out-of-order delivery', () => {
  it('paid then a later pending event -> stays paid, no illegal write attempted', async () => {
    const r1 = res()
    await handler(req('fake', { eventId: 'evt_1', gatewayRef: 'ref_1', status: 'paid', amountMinor: 5000, currency: 'AED' }), r1)
    expect(db.payments.get('pay_1')?.status).toBe('paid')
    const queriesAfterFirst = db.queries.length

    const r2 = res()
    await handler(req('fake', { eventId: 'evt_2', gatewayRef: 'ref_1', status: 'pending', amountMinor: 5000, currency: 'AED' }), r2)
    expect(r2.statusCode).toBe(200)
    expect(db.payments.get('pay_1')?.status).toBe('paid') // never reverted
    expect(db.queries.length).toBe(queriesAfterFirst + 2) // dedupe insert + select only, no update attempted
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
