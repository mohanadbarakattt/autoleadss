/** Spreads `total` visits evenly across the last `days` UTC days (most recent day
 * absorbs the remainder) — same 'YYYY-MM-DD' keying as `recordVisit`/FunnelAnalytics
 * in store.ts. Used to backfill `visitsByDay` for demo-seeded visits so the visits
 * chart isn't empty on first view.
 * ponytail: flat even split, not an organic-looking curve — fine for demo seeding. */
export function spreadVisitsByDay(total: number, days = 14): Record<string, number> {
  const per = Math.floor(total / days)
  let remainder = total - per * days
  const map: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const day = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10)
    const count = per + (remainder-- > 0 ? 1 : 0)
    if (count > 0) map[day] = count
  }
  return map
}

// --- self-check — run with `npx tsx src/saas/lib/visits.ts` ---
const isCli =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] != null &&
  /visits(\.ts|\.js)?$/.test(process.argv[1])

if (isCli) {
  function check(cond: boolean, msg: string) {
    if (!cond) throw new Error(msg)
  }
  try {
    const map = spreadVisitsByDay(47, 14)
    const keys = Object.keys(map)
    check(keys.length === 14, `expected 14 day buckets, got ${keys.length}`)
    check(Object.values(map).reduce((a, b) => a + b, 0) === 47, 'bucket totals should sum back to the input')
    check(Object.values(map).every((v) => v >= 0), 'no bucket should be negative')
    check(Object.keys(spreadVisitsByDay(0, 14)).length === 0, 'zero visits should produce no buckets')
    console.log('visits.ts self-check passed')
  } catch (err) {
    console.error('visits.ts self-check FAILED:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}
