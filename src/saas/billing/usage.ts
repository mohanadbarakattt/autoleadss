import { useSyncExternalStore } from 'react'
import { useSession, getDb } from '../store'
import { fetchUsage, incrementUsage, type UsageMetric, type UsagePeriod } from '../db/usage'
import { entitlementFor, capStatus, type CapStatus } from '../entitlements'
import { TOPUP_PACKS, type TopupPack } from '../pricing'

const USAGE_KEY_PREFIX = 'autoleadss:usage:v1'
const TOPUP_KEY_PREFIX = 'autoleadss:usage:topups:v1'

function currentPeriod(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

function emptyPeriod(period: string = currentPeriod()): UsagePeriod {
  return { period, whatsapp: 0, aiAction: 0 }
}

function keyFor(prefix: string, userId: string | null): string {
  return `${prefix}:${userId ?? 'anon'}`
}

// ---------- monthly usage counters ----------

function loadUsageLocal(userId: string | null): UsagePeriod {
  if (typeof window === 'undefined') return emptyPeriod()
  try {
    const raw = window.localStorage.getItem(keyFor(USAGE_KEY_PREFIX, userId))
    if (!raw) return emptyPeriod()
    const parsed = JSON.parse(raw) as UsagePeriod
    // A new calendar month resets the counters — these are monthly caps, not cumulative ones.
    return parsed.period === currentPeriod() ? parsed : emptyPeriod()
  } catch {
    return emptyPeriod()
  }
}

function persistUsageLocal(userId: string | null, state: UsagePeriod) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(keyFor(USAGE_KEY_PREFIX, userId), JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

const usageCache = new Map<string, UsagePeriod>()
const usageListeners = new Set<() => void>()
function emitUsage() {
  usageListeners.forEach((l) => l())
}
function subscribeUsage(cb: () => void) {
  usageListeners.add(cb)
  return () => usageListeners.delete(cb)
}

function readUsageCached(userId: string | null): UsagePeriod {
  const key = keyFor(USAGE_KEY_PREFIX, userId)
  let s = usageCache.get(key)
  if (!s || s.period !== currentPeriod()) {
    s = loadUsageLocal(userId)
    usageCache.set(key, s)
  }
  return s
}

const remoteHydratedFor = new Set<string>()

/** Best-effort remote hydration: once the funnels backend is confirmed live
 * (`getDb()` non-null — see store.ts), pull the server's count for this period so
 * usage stays correct across devices/browsers. Falls back to the local cache on
 * any failure, same "throws, caller decides" contract as db/api.ts. */
async function hydrateUsageRemote(userId: string | null) {
  const auth = getDb()
  if (!auth) return
  try {
    const remote = await fetchUsage(auth)
    const key = keyFor(USAGE_KEY_PREFIX, userId)
    usageCache.set(key, remote)
    persistUsageLocal(userId, remote)
    emitUsage()
  } catch (e) {
    console.info('[usage] remote fetch unavailable, staying on local counters:', e instanceof Error ? e.message : e)
  }
}

/** Current-period WhatsApp-AI / AI-action counts for the signed-in workspace. */
export function useUsage(): UsagePeriod {
  const session = useSession()
  const userId = session?.user.id ?? null
  const key = keyFor(USAGE_KEY_PREFIX, userId)
  if (getDb() && !remoteHydratedFor.has(key)) {
    remoteHydratedFor.add(key)
    void hydrateUsageRemote(userId)
  }
  return useSyncExternalStore(subscribeUsage, () => readUsageCached(userId), () => emptyPeriod())
}

/** Records one unit of usage for `metric`, both locally (always) and against the
 * Neon-backed counter (best-effort, when the funnels backend is live). */
export function recordUsage(userId: string | null | undefined, metric: UsageMetric) {
  const uid = userId ?? null
  const key = keyFor(USAGE_KEY_PREFIX, uid)
  const next = { ...readUsageCached(uid) }
  next[metric] += 1
  usageCache.set(key, next)
  persistUsageLocal(uid, next)
  emitUsage()

  const auth = getDb()
  if (auth) {
    incrementUsage(auth, metric).catch((e) =>
      console.info('[usage] remote increment failed, local counter still recorded:', e instanceof Error ? e.message : e),
    )
  }
}

// ---------- top-up grants (demo-only — see pricing.ts TOPUP_PACKS) ----------

export interface TopupGrant {
  id: string
  packId: TopupPack['id']
  whatsapp: number
  aiAction: number
  purchasedAt: number
  expiresAt: number
}

function loadTopupsLocal(userId: string | null): TopupGrant[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(keyFor(TOPUP_KEY_PREFIX, userId))
    return raw ? (JSON.parse(raw) as TopupGrant[]) : []
  } catch {
    return []
  }
}

function persistTopupsLocal(userId: string | null, grants: TopupGrant[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(keyFor(TOPUP_KEY_PREFIX, userId), JSON.stringify(grants))
  } catch {
    /* ignore quota */
  }
}

const topupCache = new Map<string, TopupGrant[]>()
const topupListeners = new Set<() => void>()
function emitTopups() {
  topupListeners.forEach((l) => l())
}
function subscribeTopups(cb: () => void) {
  topupListeners.add(cb)
  return () => topupListeners.delete(cb)
}
function readTopupsCached(userId: string | null): TopupGrant[] {
  const key = keyFor(TOPUP_KEY_PREFIX, userId)
  let g = topupCache.get(key)
  if (!g) {
    g = loadTopupsLocal(userId)
    topupCache.set(key, g)
  }
  return g
}

/** Active (unexpired) top-up grants for the signed-in workspace.
 *
 * Demo-mode only: real checkout (`billing/checkout.ts`) isn't wired to a payment
 * provider anywhere in this app yet (`billingEnabled = false`), so — like the
 * plan-change flow in Pricing.tsx — "buying" a top-up here just grants it locally
 * rather than charging money. It deliberately does NOT call a backend endpoint:
 * an API that hands out free WhatsApp/AI-action allowance with no payment
 * verification behind it would be a real abuse vector the moment Clerk + Neon are
 * live without checkout also being wired. Wire this to a real payment-verified
 * endpoint once `billingEnabled` flips true. */
export function useTopups(): TopupGrant[] {
  const session = useSession()
  const userId = session?.user.id ?? null
  return useSyncExternalStore(subscribeTopups, () => readTopupsCached(userId), () => [])
}

export function purchaseTopup(userId: string | null | undefined, packId: TopupPack['id']) {
  const pack = TOPUP_PACKS.find((p) => p.id === packId)
  if (!pack) return
  const uid = userId ?? null
  const key = keyFor(TOPUP_KEY_PREFIX, uid)
  const now = Date.now()
  const grant: TopupGrant = {
    id: `topup_${now.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
    packId,
    whatsapp: pack.whatsapp,
    aiAction: pack.aiAction,
    purchasedAt: now,
    expiresAt: now + pack.expiryDays * 86_400_000,
  }
  const next = [...readTopupsCached(uid), grant]
  topupCache.set(key, next)
  persistTopupsLocal(uid, next)
  emitTopups()
}

function activeBonus(grants: TopupGrant[], metric: UsageMetric): number {
  const now = Date.now()
  return grants.reduce((sum, g) => (g.expiresAt > now ? sum + g[metric] : sum), 0)
}

// ---------- cap gate (entitlement cap + active top-up bonus + current usage) ----------

export interface CapGate {
  status: CapStatus | null
  /** Returns `false` (and does not record) when a hard cap is already hit —
   * callers should show the upgrade prompt instead of proceeding. */
  record: () => boolean
}

/**
 * THE enforcement point for "is this hard cap reached, and should further usage of
 * this metric be blocked?" — used by the WhatsApp-AI simulator's client-side gate
 * (Editor.tsx → ChatSimulator's `locked` prop) today, and the one place a future
 * real WhatsApp webhook (once it exists, server-side) must reproduce the same
 * semantics against `autoleadss.usage_counters` before letting the AI bot answer
 * another conversation. Soft caps (Pro) never block — `hit` there is advisory only.
 */
export function isCapHit(status: CapStatus | null): boolean {
  return !!status && status.hit && status.type === 'hard'
}

export function useCapGate(metric: UsageMetric): CapGate {
  const session = useSession()
  const usage = useUsage()
  const topups = useTopups()
  const plan = session?.workspace.plan ?? 'starter'
  const baseCap = metric === 'whatsapp' ? entitlementFor(plan).whatsappCap : entitlementFor(plan).aiActionCap
  const bonus = activeBonus(topups, metric)
  const cap = baseCap ? { limit: baseCap.limit + bonus, type: baseCap.type } : null
  const status = capStatus(cap, usage[metric])

  function record(): boolean {
    if (isCapHit(status)) return false
    recordUsage(session?.user.id, metric)
    return true
  }

  return { status, record }
}
