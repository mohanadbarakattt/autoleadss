import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { BarChart3 } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { Panel } from '../suite/ui'
import { useI18n } from '../i18n'
import { useFunnels, getDb, hasSampleData } from '../store'
import { getInsightsRemote } from '../db/api'
import { computeDemoInsights } from '../insights/demo'
import { dayLabel } from '../insights/series'
import { SampleDataBanner } from '../leads/shared'
import { formatMinorUnits } from '../lib/money/minorUnits'
import type { InsightsSummary } from '../types'

// Zero-value fallback — used both before a remote fetch resolves and for a
// genuinely empty workspace, so the dashboard renders true zeros rather than
// a loading flicker or an undefined crash (same "flash empty, then fill in"
// pattern Leads.tsx uses for its remote lead list).
const EMPTY_INSIGHTS = computeDemoInsights([])

/** The cross-site analytics content (Phase 5b). Exported separately from the
 * routed page, same split as Hub/Leads/Products, so it can be tested without
 * an authenticated session. */
export function InsightsContent() {
  const { t, isRTL } = useI18n()
  const i = t.insights
  const funnels = useFunnels()
  const remote = getDb()

  // Demo mode: computed straight from `state.funnels` (already local, no
  // round-trip). Remote mode: fetched fresh from GET /api/insights, since
  // `state.funnels` was only snapshotted once at sign-in and its `visits`/
  // leads have moved on since.
  const [remoteInsights, setRemoteInsights] = useState<InsightsSummary | null>(null)
  useEffect(() => {
    if (!remote) {
      setRemoteInsights(null)
      return
    }
    let cancelled = false
    getInsightsRemote(remote)
      .then((data) => {
        if (!cancelled) setRemoteInsights(data)
      })
      .catch(() => {
        if (!cancelled) setRemoteInsights(EMPTY_INSIGHTS)
      })
    return () => {
      cancelled = true
    }
  }, [remote])

  const demoInsights = useMemo(() => computeDemoInsights(funnels), [funnels])
  const insights = remote ? (remoteInsights ?? EMPTY_INSIGHTS) : demoInsights
  const { totals, sites, series } = insights

  const conversion = totals.visits ? Math.round((totals.leads / totals.visits) * 100) : 0
  const kpis = [
    { v: totals.visits, l: i.kpis.visits },
    { v: totals.leads, l: i.kpis.leads },
    { v: `${conversion}%`, l: i.kpis.conversion },
    { v: totals.leadsByStatus.won, l: i.kpis.won },
  ]

  const visitsMax = Math.max(1, ...series.visits.map((d) => d.count))
  const leadsMax = Math.max(1, ...series.leads.map((d) => d.count))

  const funnelStages = [
    { key: 'visits', label: i.funnel.visits, value: totals.visits },
    { key: 'leads', label: i.funnel.leads, value: totals.leads },
    { key: 'whatsapp', label: i.funnel.whatsapp, value: totals.leadsBySource.whatsapp },
    { key: 'won', label: i.funnel.won, value: totals.leadsByStatus.won },
  ]
  const funnelMax = Math.max(1, funnelStages[0].value)

  // Demo mode only — remote-mode leads/visits never carry a `sample` flag
  // (seedDemoLeads is a no-op once a Neon backend is connected; see its doc
  // in store.ts), so this is always empty in remote mode.
  const sampleFunnelIds = remote ? [] : funnels.filter((f) => hasSampleData(f)).map((f) => f.id)

  if (sites.length === 0) {
    return (
      <div className="mx-auto max-w-[1080px] px-[30px] pb-[60px] pt-9">
        <div>
          <h1 className="font-luxe text-[34px] font-semibold text-suite-text">{i.title}</h1>
          <p className="mt-1 text-[15px] text-suite-muted">{i.subtitle}</p>
        </div>
        <Panel className="mt-8 flex flex-col items-center gap-3 p-14 text-center" data-testid="insights-empty">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-suite-line bg-suite-panel2 text-suite-gold-l">
            <BarChart3 size={22} strokeWidth={1.5} aria-hidden />
          </span>
          <p className="font-luxe text-xl font-semibold text-suite-text">{i.empty.title}</p>
          <p className="max-w-[360px] text-sm text-suite-muted">{i.empty.body}</p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1080px] px-[30px] pb-[60px] pt-9">
      <div>
        <h1 className="font-luxe text-[34px] font-semibold text-suite-text">{i.title}</h1>
        <p className="mt-1 text-[15px] text-suite-muted">{i.subtitle}</p>
      </div>

      {sampleFunnelIds.map((fid) => (
        <div key={fid} className="mt-6">
          <SampleDataBanner funnelId={fid} isRTL={isRTL} />
        </div>
      ))}

      {/* KPI tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((k, idx) => (
          <Panel key={idx} className="p-5" data-testid={`insights-kpi-${idx}`}>
            <p className="font-luxe text-3xl font-semibold text-suite-text">{k.v}</p>
            <p className="mt-0.5 text-xs text-suite-muted">{k.l}</p>
          </Panel>
        ))}
      </div>

      {/* Trend charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 min-[861px]:grid-cols-2">
        <Panel className="p-6">
          <p className="mb-5 font-luxe font-semibold text-suite-text">{i.charts.visitsTitle}</p>
          <div className="flex h-36 items-end gap-1.5" role="img" aria-label={i.charts.visitsTitle}>
            {series.visits.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center justify-end" title={`${dayLabel(d.day)}: ${d.count}`}>
                <div
                  className="w-full rounded-t bg-suite-text/30 transition-all"
                  style={{ height: d.count ? `${(d.count / visitsMax) * 100}%` : '2px', opacity: d.count ? 1 : 0.25, minHeight: 2 }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-suite-muted">
            <span>{dayLabel(series.visits[0].day)}</span>
            <span>{dayLabel(series.visits[series.visits.length - 1].day)}</span>
          </div>
        </Panel>

        <Panel className="p-6">
          <p className="mb-5 font-luxe font-semibold text-suite-text">{i.charts.leadsTitle}</p>
          <div className="flex h-36 items-end gap-1.5" role="img" aria-label={i.charts.leadsTitle}>
            {series.leads.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center justify-end" title={`${dayLabel(d.day)}: ${d.count}`}>
                <div
                  className="w-full rounded-t bg-suite-gold transition-all"
                  style={{ height: d.count ? `${(d.count / leadsMax) * 100}%` : '2px', opacity: d.count ? 1 : 0.25, minHeight: 2 }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-suite-muted">
            <span>{dayLabel(series.leads[0].day)}</span>
            <span>{dayLabel(series.leads[series.leads.length - 1].day)}</span>
          </div>
        </Panel>
      </div>
      <p className="mt-2 text-xs text-suite-muted">{i.utcNote}</p>

      {/* The funnel as a connected system: visits -> leads -> WhatsApp -> won */}
      <Panel className="mt-4 p-6">
        <p className="mb-4 font-luxe font-semibold text-suite-text">{i.funnel.title}</p>
        <div className="flex flex-col gap-3">
          {funnelStages.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-suite-text">{s.label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-suite-panel2">
                <div className="h-full rounded-full bg-suite-gold" style={{ width: `${(s.value / funnelMax) * 100}%` }} />
              </div>
              <span className="w-10 text-end text-sm font-semibold tabular-nums text-suite-text">{s.value}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* By-site breakdown */}
      <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-suite-muted">{i.sites.title}</p>
      <div className="overflow-x-auto rounded-2xl border border-suite-line bg-suite-panel">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-suite-line text-xs text-suite-muted">
              <th className="px-5 py-3 text-start font-medium">{i.sites.table.site}</th>
              <th className="px-5 py-3 text-start font-medium">{i.sites.table.visits}</th>
              <th className="px-5 py-3 text-start font-medium">{i.sites.table.leads}</th>
              <th className="px-5 py-3 text-start font-medium">{i.sites.table.conversion}</th>
              <th className="px-5 py-3 text-start font-medium">{i.sites.table.won}</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => {
              const siteConversion = s.visits ? Math.round((s.leads / s.visits) * 100) : 0
              return (
                <tr key={s.id} className="border-b border-suite-line/60 last:border-0" data-testid={`insights-site-${s.id}`}>
                  <td className="px-5 py-3 font-medium text-suite-text">{s.name}</td>
                  <td className="px-5 py-3 text-suite-muted">{s.visits}</td>
                  <td className="px-5 py-3 text-suite-muted">{s.leads}</td>
                  <td className="px-5 py-3 text-suite-muted">{siteConversion}%</td>
                  <td className="px-5 py-3 text-suite-muted">{s.leadsByStatus.won}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Orders — pending value only, never revenue (no gateway is connected yet). */}
      <Panel className="mt-8 p-6">
        <p className="mb-1 font-luxe font-semibold text-suite-text">{i.orders.title}</p>
        {totals.ordersPending.count === 0 ? (
          <p className="mt-3 text-sm text-suite-muted">{i.orders.empty}</p>
        ) : (
          <>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="rounded-full bg-suite-panel2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-suite-muted">{i.orders.pending}</span>
              {totals.ordersPending.byCurrency.map((c) => (
                <span key={c.currency} className="font-luxe text-lg font-semibold text-suite-text">
                  {formatMinorUnits(c.valueMinor, c.currency)}
                </span>
              ))}
            </p>
            <p className="mt-2 text-xs text-suite-muted">{i.orders.pendingNote}</p>
          </>
        )}
      </Panel>
    </div>
  )
}

export default function Insights() {
  return (
    <SuiteShell>
      <Helmet defer={false}>
        <title>AutoLeadss — insights</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <InsightsContent />
    </SuiteShell>
  )
}
