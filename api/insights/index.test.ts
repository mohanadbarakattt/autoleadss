import { describe, expect, it, vi, beforeEach } from 'vitest'

/** api/insights/index.ts tests — cross-site analytics rollup. Same fake-SQL-
 * harness style as api/leads/index.test.ts, except this endpoint issues FOUR
 * separate `sql.query(text, params)` calls (per-site rollup, orders-pending,
 * visits daily series, leads daily series) run via Promise.all, so the fake
 * branches on a distinguishing substring of each query's text — mirroring how
 * the real handler's four queries are shaped. */

interface FunnelRow {
  id: string
  clerk_user_id: string
  name: string
  visits: number
  visits_by_day: Record<string, number>
  created_at: string
}

interface LeadRow {
  id: string
  funnel_id: string
  clerk_user_id: string
  status: string
  source: string
  created_at: string // ISO, UTC
}

interface OrderRow {
  id: string
  clerk_user_id: string
  status: string
  subtotal_minor: number
  currency: string
}

const db = { funnels: [] as FunnelRow[], leads: [] as LeadRow[], orders: [] as OrderRow[] }

async function fakeQuery(text: string, params: unknown[] = []) {
  if (text.includes('left join autoleadss.leads l')) {
    const [userId] = params as [string]
    const funnels = db.funnels.filter((f) => f.clerk_user_id === userId).sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
    return funnels.map((f) => {
      const leads = db.leads.filter((l) => l.funnel_id === f.id)
      const count = (pred: (l: LeadRow) => boolean) => String(leads.filter(pred).length)
      return {
        id: f.id,
        name: f.name,
        visits: f.visits,
        lead_count: String(leads.length),
        leads_new: count((l) => l.status === 'new'),
        leads_qualified: count((l) => l.status === 'qualified'),
        leads_won: count((l) => l.status === 'won'),
        leads_lost: count((l) => l.status === 'lost'),
        leads_whatsapp: count((l) => l.source === 'whatsapp'),
        leads_page: count((l) => l.source === 'page'),
      }
    })
  }

  if (text.includes('from autoleadss.orders')) {
    const [userId] = params as [string]
    const orders = db.orders.filter((o) => o.clerk_user_id === userId && o.status === 'pending')
    const byCurrency = new Map<string, { order_count: number; pending_value_minor: number }>()
    for (const o of orders) {
      const cur = byCurrency.get(o.currency) ?? { order_count: 0, pending_value_minor: 0 }
      cur.order_count++
      cur.pending_value_minor += o.subtotal_minor
      byCurrency.set(o.currency, cur)
    }
    return [...byCurrency.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([currency, r]) => ({ currency, order_count: String(r.order_count), pending_value_minor: String(r.pending_value_minor) }))
  }

  if (text.includes('jsonb_each_text')) {
    const [userId, windowStartDay] = params as [string, string]
    const funnels = db.funnels.filter((f) => f.clerk_user_id === userId)
    const byDay = new Map<string, number>()
    for (const f of funnels) {
      for (const [day, count] of Object.entries(f.visits_by_day ?? {})) {
        if (day < windowStartDay) continue
        byDay.set(day, (byDay.get(day) ?? 0) + count)
      }
    }
    return [...byDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([day, count]) => ({ day, count: String(count) }))
  }

  if (text.includes('to_char(l.created_at')) {
    const [userId, windowStartIso] = params as [string, string]
    const leads = db.leads.filter((l) => l.clerk_user_id === userId && l.created_at >= windowStartIso)
    const byDay = new Map<string, number>()
    for (const l of leads) {
      const day = l.created_at.slice(0, 10)
      byDay.set(day, (byDay.get(day) ?? 0) + 1)
    }
    return [...byDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([day, count]) => ({ day, count: String(count) }))
  }

  throw new Error(`fake db: unmocked query shape: ${text}`)
}

vi.mock('../_lib/db', () => ({ getSql: () => ({ query: fakeQuery }) }))

let currentUser: string | null = 'user_A'
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./index')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(method: string, query: Record<string, string> = {}) {
  return { method, query, body: {}, headers: {} } as any
}

beforeEach(() => {
  db.funnels = []
  db.leads = []
  db.orders = []
  currentUser = 'user_A'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
})

describe('auth', () => {
  it('401s when there is no authenticated Clerk user', async () => {
    currentUser = null
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(401)
  })
})

describe('fail-closed config', () => {
  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(501)
  })
})

describe('method', () => {
  it('405s on POST', async () => {
    const r = res()
    await handler(req('POST'), r)
    expect(r.statusCode).toBe(405)
  })
})

describe('days param validation', () => {
  it('rejects a non-integer days value', async () => {
    const r = res()
    await handler(req('GET', { days: 'abc' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a negative days value', async () => {
    const r = res()
    await handler(req('GET', { days: '-5' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a zero days value', async () => {
    const r = res()
    await handler(req('GET', { days: '0' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a days value above the hard server-side max', async () => {
    const r = res()
    await handler(req('GET', { days: '10000' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('accepts a days value at the hard max', async () => {
    const r = res()
    await handler(req('GET', { days: '90' }), r)
    expect(r.statusCode).toBe(200)
  })

  it('defaults to a 14-day window when omitted', async () => {
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).insights.windowDays).toBe(14)
    expect((r.body as any).insights.series.visits).toHaveLength(14)
    expect((r.body as any).insights.series.leads).toHaveLength(14)
  })
})

describe('aggregation', () => {
  it('correctly aggregates totals and a per-site breakdown across multiple sites, isolated per user', async () => {
    db.funnels.push(
      { id: 'f_1', clerk_user_id: 'user_A', name: 'Marina Realty', visits: 100, visits_by_day: {}, created_at: '2026-01-01T00:00:00Z' },
      { id: 'f_2', clerk_user_id: 'user_A', name: 'Sunset Salon', visits: 50, visits_by_day: {}, created_at: '2026-01-02T00:00:00Z' },
      { id: 'f_other', clerk_user_id: 'user_B', name: 'Not mine', visits: 999, visits_by_day: {}, created_at: '2026-01-01T00:00:00Z' },
    )
    db.leads.push(
      { id: 'l_1', funnel_id: 'f_1', clerk_user_id: 'user_A', status: 'new', source: 'page', created_at: '2026-01-05T00:00:00Z' },
      { id: 'l_2', funnel_id: 'f_1', clerk_user_id: 'user_A', status: 'won', source: 'whatsapp', created_at: '2026-01-05T00:00:00Z' },
      { id: 'l_3', funnel_id: 'f_2', clerk_user_id: 'user_A', status: 'qualified', source: 'page', created_at: '2026-01-05T00:00:00Z' },
      { id: 'l_other', funnel_id: 'f_other', clerk_user_id: 'user_B', status: 'won', source: 'page', created_at: '2026-01-05T00:00:00Z' },
    )

    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(200)
    const insights = (r.body as any).insights

    expect(insights.totals.visits).toBe(150) // 100 + 50, never user_B's 999
    expect(insights.totals.leads).toBe(3)
    expect(insights.totals.leadsByStatus).toEqual({ new: 1, qualified: 1, won: 1, lost: 0 })
    expect(insights.totals.leadsBySource).toEqual({ page: 2, whatsapp: 1 })

    expect(insights.sites).toHaveLength(2)
    const site1 = insights.sites.find((s: any) => s.id === 'f_1')
    expect(site1).toMatchObject({ name: 'Marina Realty', visits: 100, leads: 2 })
    expect(site1.leadsByStatus).toEqual({ new: 1, qualified: 0, won: 1, lost: 0 })
    const site2 = insights.sites.find((s: any) => s.id === 'f_2')
    expect(site2).toMatchObject({ name: 'Sunset Salon', visits: 50, leads: 1 })
  })

  it('handles bigint-over-the-wire counts (returned as strings) as real numbers', async () => {
    db.funnels.push({ id: 'f_1', clerk_user_id: 'user_A', name: 'Site', visits: 5, visits_by_day: {}, created_at: '2026-01-01T00:00:00Z' })
    for (let i = 0; i < 5; i++) {
      db.leads.push({ id: `l_${i}`, funnel_id: 'f_1', clerk_user_id: 'user_A', status: 'new', source: 'page', created_at: '2026-01-05T00:00:00Z' })
    }
    const r = res()
    await handler(req('GET'), r)
    const insights = (r.body as any).insights
    expect(insights.totals.leads).toBe(5)
    expect(typeof insights.totals.leads).toBe('number')
    expect(typeof insights.sites[0].leads).toBe('number')
  })

  it('reports pending order value by currency, isolated per user, and never a paid/revenue figure', async () => {
    db.orders.push(
      { id: 'o_1', clerk_user_id: 'user_A', status: 'pending', subtotal_minor: 5000, currency: 'AED' },
      { id: 'o_2', clerk_user_id: 'user_A', status: 'pending', subtotal_minor: 3000, currency: 'AED' },
      { id: 'o_3', clerk_user_id: 'user_A', status: 'cancelled', subtotal_minor: 9999, currency: 'AED' },
      { id: 'o_other', clerk_user_id: 'user_B', status: 'pending', subtotal_minor: 1000, currency: 'AED' },
    )
    const r = res()
    await handler(req('GET'), r)
    const insights = (r.body as any).insights
    expect(insights.totals.ordersPending.count).toBe(2) // only the 2 pending, never cancelled or user_B's
    expect(insights.totals.ordersPending.byCurrency).toEqual([{ currency: 'AED', valueMinor: 8000 }])
    expect(insights).not.toHaveProperty('revenue')
  })

  it('fills the daily trend series densely, UTC-keyed, zero-filling gap days', async () => {
    db.funnels.push({ id: 'f_1', clerk_user_id: 'user_A', name: 'Site', visits: 3, visits_by_day: { '2026-01-01': 3 }, created_at: '2025-12-01T00:00:00Z' })
    const r = res()
    await handler(req('GET', { days: '3' }), r)
    const insights = (r.body as any).insights
    expect(insights.series.visits).toHaveLength(3)
    expect(insights.series.visits.every((d: any) => typeof d.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.day))).toBe(true)
    expect(insights.series.visits.every((d: any) => typeof d.count === 'number')).toBe(true)
  })
})

describe('cross-user isolation', () => {
  it("user B never sees user A's sites, leads, or orders", async () => {
    db.funnels.push({ id: 'f_1', clerk_user_id: 'user_A', name: 'A site', visits: 10, visits_by_day: {}, created_at: '2026-01-01T00:00:00Z' })
    db.orders.push({ id: 'o_1', clerk_user_id: 'user_A', status: 'pending', subtotal_minor: 5000, currency: 'AED' })

    currentUser = 'user_B'
    const r = res()
    await handler(req('GET'), r)
    const insights = (r.body as any).insights
    expect(insights.sites).toEqual([])
    expect(insights.totals.visits).toBe(0)
    expect(insights.totals.ordersPending.count).toBe(0)
  })
})
