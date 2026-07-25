import { describe, expect, it } from 'vitest'
import { computeDemoInsights } from './demo'
import type { Funnel } from '../types'

function baseFunnel(overrides: Partial<Funnel>): Funnel {
  return {
    id: 'f_1',
    name: 'Test Site',
    slug: 'test-site',
    industry: 'services',
    language: 'en',
    status: 'draft',
    accent: '#FF5C2A',
    spec: {} as Funnel['spec'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    visits: 0,
    leads: [],
    ...overrides,
  }
}

describe('computeDemoInsights', () => {
  it('returns all-zero totals for no funnels — a true-zero empty state, never an invented number', () => {
    const summary = computeDemoInsights([])
    expect(summary.sites).toEqual([])
    expect(summary.totals).toEqual({
      visits: 0,
      leads: 0,
      leadsByStatus: { new: 0, qualified: 0, won: 0, lost: 0 },
      leadsBySource: { page: 0, whatsapp: 0 },
      ordersPending: { count: 0, byCurrency: [] },
    })
  })

  it('excludes seedVisits from the visits total (design honesty requirement a)', () => {
    const summary = computeDemoInsights([baseFunnel({ visits: 54, seedVisits: 54 })])
    expect(summary.totals.visits).toBe(0)
    expect(summary.sites[0].visits).toBe(0)
  })

  it('mixes real visits recorded on top of sample visits correctly (subtracts only the sample portion)', () => {
    const summary = computeDemoInsights([baseFunnel({ visits: 54 + 3, seedVisits: 54 })])
    expect(summary.totals.visits).toBe(3)
  })

  it('excludes sample-flagged leads from every lead aggregate', () => {
    const summary = computeDemoInsights([
      baseFunnel({
        leads: [
          { id: 'l_sample', name: 'Demo', phone: '1', source: 'whatsapp', status: 'won', createdAt: Date.now(), sample: true },
          { id: 'l_real', name: 'Real', phone: '2', source: 'page', status: 'new', createdAt: Date.now() },
        ],
      }),
    ])
    expect(summary.totals.leads).toBe(1)
    expect(summary.totals.leadsByStatus).toEqual({ new: 1, qualified: 0, won: 0, lost: 0 })
    expect(summary.totals.leadsBySource).toEqual({ page: 1, whatsapp: 0 })
    expect(summary.sites[0].leads).toBe(1)
  })

  it('never fabricates orders (demo mode creates none) — always pending: zero, never a revenue field', () => {
    const summary = computeDemoInsights([baseFunnel({})])
    expect(summary.totals.ordersPending).toEqual({ count: 0, byCurrency: [] })
    expect(summary.totals).not.toHaveProperty('revenue')
  })

  it('sums totals correctly across multiple sites', () => {
    const summary = computeDemoInsights([
      baseFunnel({ id: 'f_1', visits: 10, leads: [{ id: 'l1', name: 'A', phone: '1', source: 'page', status: 'won', createdAt: Date.now() }] }),
      baseFunnel({ id: 'f_2', visits: 20, leads: [{ id: 'l2', name: 'B', phone: '2', source: 'whatsapp', status: 'lost', createdAt: Date.now() }] }),
    ])
    expect(summary.totals.visits).toBe(30)
    expect(summary.totals.leads).toBe(2)
    expect(summary.sites).toHaveLength(2)
  })
})
