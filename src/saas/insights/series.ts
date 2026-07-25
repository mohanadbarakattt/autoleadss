import type { Lead } from '../types'

export const DAY = 86_400_000

/** Buckets `leads` into daily counts for the last `n` days, keyed by the
 * viewer's LOCAL calendar day (browser time). Moved here verbatim from
 * FunnelAnalytics.tsx (Phase 5b) — still used only by that per-funnel Leads
 * chart, unchanged behavior. */
export function lastNDays(leads: Lead[], n: number): { label: string; day: number; count: number }[] {
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

/** Fills the last `n` UTC calendar days (today inclusive) from a 'YYYY-MM-DD'
 * -> count rollup, with zero-filled gaps — the single UTC-day bucketing
 * function shared by every UTC-keyed daily count in the app: FunnelAnalytics's
 * per-funnel visits chart (via `lastNDaysFromRollup` below), and the
 * cross-site Insights page's visits + leads trend charts, both server
 * (api/insights/index.ts) and demo-mode (src/saas/insights/demo.ts) — see
 * that endpoint's module doc for why everything stays UTC rather than
 * Gulf-local. */
export function denseUtcDays(rollup: Record<string, number> | undefined, n: number): { day: string; count: number }[] {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const buckets: { day: string; count: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY)
    const day = d.toISOString().slice(0, 10)
    buckets.push({ day, count: rollup?.[day] ?? 0 })
  }
  return buckets
}

/** Formats a 'YYYY-MM-DD' day key as a short display label, e.g. "7/24" —
 * the one place this happens, shared by `lastNDaysFromRollup` below and the
 * Insights page's own charts (which consume `denseUtcDays` directly). */
export function dayLabel(day: string): string {
  return `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))}`
}

/** Same last-N-UTC-days bucketing as `denseUtcDays`, but shaped for
 * FunnelAnalytics's chart (a display `label` like "7/24" instead of a raw
 * 'YYYY-MM-DD' key) — was named for `visitsByDay` specifically before Phase
 * 5b generalized the underlying bucketing into `denseUtcDays` above. */
export function lastNDaysFromRollup(rollup: Record<string, number> | undefined, n: number): { label: string; count: number }[] {
  return denseUtcDays(rollup, n).map(({ day, count }) => ({ label: dayLabel(day), count }))
}
