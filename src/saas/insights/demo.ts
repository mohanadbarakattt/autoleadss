import type { Funnel, Lead, InsightsSummary, LeadSourceCounts, LeadStatusCounts, SiteInsights } from '../types'
import { denseUtcDays } from './series'

const DEFAULT_WINDOW_DAYS = 14

const EMPTY_STATUS: LeadStatusCounts = { new: 0, qualified: 0, won: 0, lost: 0 }
const EMPTY_SOURCE: LeadSourceCounts = { page: 0, whatsapp: 0 }

/**
 * Demo-mode equivalent of `GET /api/insights` — computed entirely client-side
 * from `state.funnels` (same remote/demo split as Leads.tsx). Real leads/
 * visits only (design honesty requirement a): excludes every `sample`-flagged
 * lead and the `seedVisits` fake-visit count `seedDemoLeads` injects, so a
 * merchant browsing before connecting a backend never sees seeded leads/visits
 * folded into their business-intelligence totals (defect class T5 — see
 * store.ts's seedDemoLeads doc). This only computes the numbers; the
 * per-site sample-data disclosure banner is Insights.tsx's job (it already
 * has `hasSampleData` per funnel from store.ts).
 *
 * The one exception is the visits TREND chart: `visitsByDay` merges seeded
 * and real visits into the same UTC day buckets at write time (see
 * seedDemoLeads's `{ ...f.visitsByDay, ...spreadVisitsByDay(seedVisits) }`),
 * so a day that mixes both can't be un-mixed after the fact. The KPI/table
 * totals above stay exact regardless (subtracting the stored `seedVisits`
 * count); the trend chart for an affected site is covered by the same
 * SampleDataBanner disclosure instead of a numeric split.
 */
/**
 * The single definition of "real" activity for one site: sample leads and the
 * fake visit count `seedDemoLeads` injects are excluded.
 *
 * Exported because the Dashboard's KPI tiles need the SAME rule. They used to
 * sum `f.visits` and `f.leads.length` raw, so the Dashboard reported seeded
 * demo data as real while Insights excluded it — two surfaces showing different
 * totals for the same workspace, with the more prominent one inflated. Both now
 * call this; agreeing by coincidence is not agreeing.
 */
export function realCountsFor(f: Funnel): { visits: number; leads: Lead[] } {
  return {
    visits: Math.max(0, f.visits - (f.seedVisits ?? 0)),
    leads: f.leads.filter((l) => !l.sample),
  }
}

export function computeDemoInsights(funnels: Funnel[], windowDays = DEFAULT_WINDOW_DAYS): InsightsSummary {
  const sites: SiteInsights[] = funnels.map((f) => {
    const realLeads = realCountsFor(f).leads
    const leadsByStatus: LeadStatusCounts = { new: 0, qualified: 0, won: 0, lost: 0 }
    const leadsBySource: LeadSourceCounts = { page: 0, whatsapp: 0 }
    for (const l of realLeads) {
      leadsByStatus[l.status]++
      leadsBySource[l.source]++
    }
    return {
      id: f.id,
      name: f.name,
      visits: realCountsFor(f).visits,
      leads: realLeads.length,
      leadsByStatus,
      leadsBySource,
    }
  })

  const totals = sites.reduce(
    (acc, s) => ({
      visits: acc.visits + s.visits,
      leads: acc.leads + s.leads,
      leadsByStatus: {
        new: acc.leadsByStatus.new + s.leadsByStatus.new,
        qualified: acc.leadsByStatus.qualified + s.leadsByStatus.qualified,
        won: acc.leadsByStatus.won + s.leadsByStatus.won,
        lost: acc.leadsByStatus.lost + s.leadsByStatus.lost,
      },
      leadsBySource: {
        page: acc.leadsBySource.page + s.leadsBySource.page,
        whatsapp: acc.leadsBySource.whatsapp + s.leadsBySource.whatsapp,
      },
    }),
    { visits: 0, leads: 0, leadsByStatus: { ...EMPTY_STATUS }, leadsBySource: { ...EMPTY_SOURCE } },
  )

  // Visits trend: raw rollup, sample-and-real mixed where they share a day (see
  // module doc above). Leads trend: exact — built straight from the already
  // sample-filtered `realLeads` per site, not the rollup.
  const visitsByDayMerged: Record<string, number> = {}
  const leadsByDayMerged: Record<string, number> = {}
  for (const f of funnels) {
    for (const [day, count] of Object.entries(f.visitsByDay ?? {})) {
      visitsByDayMerged[day] = (visitsByDayMerged[day] ?? 0) + count
    }
    for (const l of f.leads) {
      if (l.sample) continue
      const day = new Date(l.createdAt).toISOString().slice(0, 10)
      leadsByDayMerged[day] = (leadsByDayMerged[day] ?? 0) + 1
    }
  }

  return {
    windowDays,
    totals: { ...totals, ordersPending: { count: 0, byCurrency: [] } }, // Sell never creates orders in demo mode — see store.ts's `orders` doc.
    sites,
    series: {
      visits: denseUtcDays(visitsByDayMerged, windowDays),
      leads: denseUtcDays(leadsByDayMerged, windowDays),
    },
  }
}
