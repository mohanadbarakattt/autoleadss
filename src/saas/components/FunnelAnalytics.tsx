import type { Funnel, Lead } from '../types'

const DAY = 86_400_000

function lastNDays(leads: Lead[], n: number): { label: string; day: number; count: number }[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const base = today.getTime()
  const buckets: { label: string; day: number; count: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const start = base - i * DAY
    const d = new Date(start)
    buckets.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, day: start, count: 0 })
  }
  for (const l of leads) {
    const d = new Date(l.createdAt)
    d.setHours(0, 0, 0, 0)
    const idx = Math.round((d.getTime() - (base - (n - 1) * DAY)) / DAY)
    if (idx >= 0 && idx < n) buckets[idx].count++
  }
  return buckets
}

/** Same last-N-days bucketing as `lastNDays`, but reading straight from the
 * `visitsByDay` rollup (keyed by UTC 'YYYY-MM-DD') instead of a Lead[] array —
 * there's no per-visit event to bucket, just a per-day count. */
function lastNDaysFromRollup(visitsByDay: Record<string, number> | undefined, n: number): { label: string; count: number }[] {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const buckets: { label: string; count: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY)
    const key = d.toISOString().slice(0, 10)
    buckets.push({ label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`, count: visitsByDay?.[key] ?? 0 })
  }
  return buckets
}

export default function FunnelAnalytics({ funnel, isRTL }: { funnel: Funnel; isRTL: boolean }) {
  const leads = funnel.leads
  const conv = funnel.visits ? Math.round((leads.length / funnel.visits) * 100) : 0
  const wa = leads.filter((l) => l.source === 'whatsapp').length
  const waPct = leads.length ? Math.round((wa / leads.length) * 100) : 0
  const won = leads.filter((l) => l.status === 'won').length

  const kpis = [
    { v: funnel.visits, l: isRTL ? 'زيارات' : 'Visits' },
    { v: leads.length, l: isRTL ? 'عملاء' : 'Leads' },
    { v: `${conv}%`, l: isRTL ? 'التحويل' : 'Conversion' },
    { v: won, l: isRTL ? 'صفقات مكسوبة' : 'Won' },
  ]

  const days = lastNDays(leads, 14)
  const max = Math.max(1, ...days.map((d) => d.count))

  const visitDays = lastNDaysFromRollup(funnel.visitsByDay, 14)
  const visitMax = Math.max(1, ...visitDays.map((d) => d.count))

  const sources: { key: Lead['source']; label: string; count: number }[] = [
    { key: 'whatsapp', label: '🟢 WhatsApp', count: wa },
    { key: 'page', label: '🌐 Page', count: leads.length - wa },
  ]
  const srcMax = Math.max(1, ...sources.map((s) => s.count))

  return (
    <div className="mx-auto max-w-3xl">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-display text-3xl font-bold">{k.v}</p>
            <p className="mt-0.5 text-xs text-muted-fg">{k.l}</p>
          </div>
        ))}
      </div>

      {/* Visits · last 14 days */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <p className="mb-5 font-display font-semibold">{isRTL ? 'الزيارات · آخر 14 يوماً' : 'Visits · last 14 days'}</p>
        <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Visits per day, last 14 days">
          {visitDays.map((d, i) => (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.count}`}>
              <div
                className="w-full rounded-t bg-foreground/40 transition-all"
                style={{ height: d.count ? `${(d.count / visitMax) * 100}%` : '2px', opacity: d.count ? 1 : 0.18, minHeight: 2 }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-fg">
          <span>{visitDays[0].label}</span>
          <span>{visitDays[visitDays.length - 1].label}</span>
        </div>
      </div>

      {/* Leads · last 14 days — single-series bars, brand accent */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <p className="mb-1 font-display font-semibold">{isRTL ? 'العملاء · آخر 14 يوماً' : 'Leads · last 14 days'}</p>
        <p className="mb-5 text-xs text-muted-fg">{isRTL ? `${leads.length} عميل` : `${leads.length} total`} · {waPct}% {isRTL ? 'واتساب' : 'via WhatsApp'}</p>
        <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Leads per day, last 14 days">
          {days.map((d, i) => (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.count}`}>
              <div
                className="w-full rounded-t bg-accent transition-all"
                style={{ height: d.count ? `${(d.count / max) * 100}%` : '2px', opacity: d.count ? 1 : 0.18, minHeight: 2 }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-fg">
          <span>{days[0].label}</span>
          <span>{days[days.length - 1].label}</span>
        </div>
      </div>

      {/* Source breakdown — direct-labeled, not colour-alone */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <p className="mb-4 font-display font-semibold">{isRTL ? 'مصادر العملاء' : 'Lead sources'}</p>
        <div className="flex flex-col gap-3">
          {sources.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-foreground">{s.label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / srcMax) * 100}%` }} />
              </div>
              <span className="w-8 text-end text-sm font-semibold tabular-nums">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
