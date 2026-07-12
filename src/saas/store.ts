import { useSyncExternalStore } from 'react'
import type { Funnel, Lead, Session, Workspace, User, PlanId, Region, AgencySettings, SubAccount } from './types'
import { clerkEnabled } from './config'
import type { RemoteAuth } from './db/api'
import {
  listFunnels as rListFunnels,
  createFunnel as rCreateFunnel,
  updateFunnel as rUpdateFunnel,
  deleteFunnel as rDeleteFunnel,
  setLeadStatusRemote as rSetLeadStatus,
} from './db/api'

const BASE_KEY = 'autoleadss:state:v1'
/** Marks that the one-time anonymous → first-signed-in-user migration has already run. */
const MIGRATED_FLAG = 'autoleadss:state:v1:migrated'

/** Pre-rebrand keys (this SaaS was ported from the "Virlo" project name). Read-only —
 * `load()` falls back to these so existing users' data survives the rename below. */
const LEGACY_BASE_KEY = 'virlo:state:v1'
const LEGACY_MIGRATED_FLAG = 'virlo:state:v1:migrated'

/** localStorage key for a given Clerk user id (undefined/null = anonymous/demo key). */
function keyFor(userId?: string | null): string {
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY
}

interface AgencyState {
  settings: AgencySettings | null
  subAccounts: SubAccount[]
  activeSubAccountId: string | null
}

interface State {
  session: Session | null
  funnels: Funnel[]
  agency: AgencyState
}

const empty: State = { session: null, funnels: [], agency: { settings: null, subAccounts: [], activeSubAccountId: null } }

let state: State = empty
let hydrated = false
const listeners = new Set<() => void>()

/**
 * When set, funnel mutations persist to the shared Neon backend (via api/,
 * optimistic) in addition to localStorage. Set only after a successful probe of
 * `GET /api/funnels` on sign-in (see `bridgeClerkSession`) — there's no static
 * client-side signal for "is Neon configured" the way there was for Supabase.
 *
 * Session/agency/workspace state is NOT part of this — see `saveAgencySettings` /
 * `setPlan` / `setRegion` below: those were Supabase-backed before Phase 2 and
 * weren't carried over to Neon (out of scope; see docs/SETUP.md), so they always
 * stay in the per-user-namespaced localStorage blob, remote funnels or not.
 */
let remote: RemoteAuth | null = null

/**
 * Which localStorage key reads/writes go to. Stays BASE_KEY for anonymous/demo
 * sessions; becomes user-namespaced once a Clerk session is bridged, so two
 * different Clerk users on one browser never see each other's funnels/agency
 * settings/workspace — independent of whether funnels are also Neon-backed.
 */
let activeKey = BASE_KEY

/** For the anonymous/demo key only, a legacy 'virlo:*' key holding the same data may
 * still exist from before the rename — read it once and copy it forward so existing
 * users don't lose their funnels. Per-user-namespaced keys never had a legacy form
 * (Clerk auth + the Neon backend both post-date the rename), so no lookup needed there. */
function legacyKeyFor(key: string): string | null {
  if (key === BASE_KEY) return LEGACY_BASE_KEY
  return null
}

function load(key: string = activeKey): State {
  if (typeof window === 'undefined') return empty
  try {
    let raw = window.localStorage.getItem(key)
    if (!raw) {
      const legacyKey = legacyKeyFor(key)
      const legacyRaw = legacyKey ? window.localStorage.getItem(legacyKey) : null
      if (legacyRaw) {
        raw = legacyRaw
        try {
          window.localStorage.setItem(key, legacyRaw)
        } catch {
          /* ignore quota/storage errors — still usable in-memory this session */
        }
      }
    }
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    // Always cache to localStorage, even in remote-funnels mode: session/agency/
    // workspace have no Neon backing (see `remote` doc above), and a cached copy
    // of funnels is a harmless bonus (overwritten the moment the Neon list loads).
    window.localStorage.setItem(activeKey, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

function emit() {
  listeners.forEach((l) => l())
}

function set(next: Partial<State>) {
  state = { ...state, ...next }
  persist()
  emit()
}

function ensureHydrated() {
  // Clerk-backed sessions hydrate explicitly via bridgeClerkSession, once the
  // signed-in user (and therefore the right localStorage key) is known.
  if (!hydrated && typeof window !== 'undefined' && !clerkEnabled) {
    state = load()
    hydrated = true
  }
}

function subscribe(cb: () => void) {
  ensureHydrated()
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function syncRemote(fn: (auth: RemoteAuth) => Promise<void>) {
  if (!remote) return
  fn(remote).catch((e) => console.error('[remote sync]', e))
}

// ---------- ids ----------
export function uid(prefix = ''): string {
  const rnd = Math.floor((typeof performance !== 'undefined' ? performance.now() : 0) * 1000) % 100000
  const t = Date.now().toString(36)
  return `${prefix}${t}${rnd.toString(36)}`
}

export function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return base || 'funnel'
}

// ---------- hooks ----------
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, () => state.session, () => null)
}
export function useFunnels(): Funnel[] {
  return useSyncExternalStore(subscribe, () => state.funnels, () => [])
}
export function useFunnel(id: string): Funnel | undefined {
  return useFunnels().find((f) => f.id === id)
}

export function useAgency(): AgencyState {
  return useSyncExternalStore(subscribe, () => state.agency, () => empty.agency)
}

// ---------- agency / white-label ----------
// Local-only: agency settings / sub-accounts were Supabase-backed before Phase 2 and
// weren't carried over to Neon (out of scope for the funnels/leads/publish migration —
// see docs/SETUP.md). They persist to the per-user-namespaced localStorage blob only.
export function saveAgencySettings(patch: Partial<AgencySettings>) {
  ensureHydrated()
  const settings: AgencySettings = { hideBadge: true, ...state.agency.settings, ...patch }
  set({ agency: { ...state.agency, settings } })
}

export function createSubAccount(name: string, contactEmail?: string): SubAccount {
  ensureHydrated()
  const sa: SubAccount = { id: uid('sa_'), name, contactEmail, createdAt: Date.now() }
  set({ agency: { ...state.agency, subAccounts: [...state.agency.subAccounts, sa] } })
  return sa
}

export function deleteSubAccount(id: string) {
  ensureHydrated()
  const activeSubAccountId = state.agency.activeSubAccountId === id ? null : state.agency.activeSubAccountId
  set({ agency: { ...state.agency, subAccounts: state.agency.subAccounts.filter((s) => s.id !== id), activeSubAccountId } })
}

export function setActiveSubAccount(id: string | null) {
  ensureHydrated()
  set({ agency: { ...state.agency, activeSubAccountId: id } })
}

// ---------- remote lifecycle (called by the Clerk bridge) ----------

/**
 * Bridges a Clerk identity into the store. Always does the local, per-user-
 * namespaced hydration first (demo-parity, one-time anonymous→user migration —
 * same as the old `setBridgedSession`), then probes the Neon backend by calling
 * `GET /api/funnels`:
 *  - probe succeeds → remote mode: `state.funnels` is replaced by the Neon list,
 *    and subsequent funnel mutations sync to `api/` too.
 *  - probe fails (network error, 501 not-configured, 401, not yet deployed, ...)
 *    → stays in plain localStorage mode; this is the expected/normal path whenever
 *    the Neon backend isn't configured, so it's logged with `console.info`, not
 *    `console.error`.
 */
export async function bridgeClerkSession(session: Session, auth: RemoteAuth) {
  const nsKey = keyFor(session.user.id)
  activeKey = nsKey
  if (typeof window !== 'undefined') {
    try {
      const alreadyMigrated = window.localStorage.getItem(MIGRATED_FLAG) || window.localStorage.getItem(LEGACY_MIGRATED_FLAG)
      const nsRaw = window.localStorage.getItem(nsKey)
      if (!nsRaw && !alreadyMigrated) {
        const anonRaw = window.localStorage.getItem(BASE_KEY) || window.localStorage.getItem(LEGACY_BASE_KEY)
        if (anonRaw) window.localStorage.setItem(nsKey, anonRaw)
      }
      window.localStorage.setItem(MIGRATED_FLAG, '1')
    } catch {
      /* ignore quota/storage errors — falls back to an empty namespaced state */
    }
  }
  state = load(nsKey)
  hydrated = true
  remote = null
  set({ session })

  try {
    const funnels = await rListFunnels(auth)
    remote = auth
    set({ funnels })
  } catch (e) {
    console.info('[remote funnels] backend unavailable, staying in localStorage mode:', e instanceof Error ? e.message : e)
  }
}

export function teardownRemote() {
  remote = null
  activeKey = BASE_KEY
  hydrated = false
  state = { session: null, funnels: [], agency: { settings: null, subAccounts: [], activeSubAccountId: null } }
  emit()
}

/** The active remote auth handle in remote-funnels mode (for feature modules like
 * WhatsApp settings — none of which have a Neon backing yet), else null. */
export function getDb(): RemoteAuth | null {
  return remote
}

// ---------- auth (demo mode) ----------
export function signUp(name: string, email: string, region: Region): Session {
  ensureHydrated()
  const user: User = { id: uid('u_'), name, email }
  const workspace: Workspace = {
    id: uid('w_'),
    name: name ? `${name.split(' ')[0]}'s workspace` : 'My workspace',
    region,
    plan: 'starter',
    createdAt: Date.now(),
  }
  const session: Session = { user, workspace }
  set({ session })
  return session
}

export function signOut() {
  set({ session: null })
}

export function setPlan(plan: PlanId) {
  ensureHydrated()
  if (!state.session) return
  set({ session: { ...state.session, workspace: { ...state.session.workspace, plan } } })
}

export function setRegion(region: Region) {
  ensureHydrated()
  if (!state.session) return
  set({ session: { ...state.session, workspace: { ...state.session.workspace, region } } })
}

// ---------- funnels ----------
export function getFunnelBySlug(slug: string): Funnel | undefined {
  ensureHydrated()
  return state.funnels.find((f) => f.slug === slug)
}

export function createFunnel(f: Funnel) {
  ensureHydrated()
  const slugs = new Set(state.funnels.map((x) => x.slug))
  let slug = f.slug
  let i = 2
  while (slugs.has(slug)) slug = `${f.slug}-${i++}`
  const funnel = { ...f, slug, subAccountId: f.subAccountId ?? state.agency.activeSubAccountId ?? undefined }
  set({ funnels: [funnel, ...state.funnels] })
  syncRemote((auth) => rCreateFunnel(auth, funnel))
}

export function updateFunnel(id: string, patch: Partial<Funnel>) {
  ensureHydrated()
  set({ funnels: state.funnels.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f)) })
  // leads are persisted via their own path; don't push them through the funnel row.
  const rest: Partial<Funnel> = { ...patch }
  delete rest.leads
  syncRemote((auth) => rUpdateFunnel(auth, id, rest))
}

export function updateSpec(id: string, mutate: (spec: Funnel['spec']) => Funnel['spec']) {
  ensureHydrated()
  let nextSpec: Funnel['spec'] | undefined
  set({
    funnels: state.funnels.map((f) => {
      if (f.id !== id) return f
      nextSpec = mutate(f.spec)
      return { ...f, spec: nextSpec, updatedAt: Date.now() }
    }),
  })
  if (nextSpec) syncRemote((auth) => rUpdateFunnel(auth, id, { spec: nextSpec }))
}

export function deleteFunnel(id: string) {
  ensureHydrated()
  set({ funnels: state.funnels.filter((f) => f.id !== id) })
  syncRemote((auth) => rDeleteFunnel(auth, id))
}

export function publishFunnel(id: string) {
  updateFunnel(id, { status: 'published' })
}

export function recordVisit(slug: string) {
  ensureHydrated()
  const day = new Date().toISOString().slice(0, 10) // UTC 'YYYY-MM-DD'
  set({
    funnels: state.funnels.map((f) =>
      f.slug === slug
        ? { ...f, visits: f.visits + 1, visitsByDay: { ...f.visitsByDay, [day]: (f.visitsByDay?.[day] ?? 0) + 1 } }
        : f,
    ),
  })
}

export function addLead(slug: string, lead: Omit<Lead, 'id' | 'createdAt' | 'status'>) {
  ensureHydrated()
  const full: Lead = { ...lead, id: uid('l_'), createdAt: Date.now(), status: 'new' }
  set({ funnels: state.funnels.map((f) => (f.slug === slug ? { ...f, leads: [full, ...f.leads] } : f)) })
  return full
}

export function setLeadStatus(funnelId: string, leadId: string, status: Lead['status']) {
  ensureHydrated()
  set({
    funnels: state.funnels.map((f) =>
      f.id === funnelId ? { ...f, leads: f.leads.map((l) => (l.id === leadId ? { ...l, status } : l)) } : f,
    ),
  })
  syncRemote((auth) => rSetLeadStatus(auth, leadId, status))
}

/** Seed demo leads so the CRM/analytics never look empty. Demo mode only. Each lead
 * (and the visit bump) is flagged so the UI can badge it as sample data and offer a
 * one-click clear — see `clearSampleData` below. */
export function seedDemoLeads(funnelId: string, names: [string, string][]) {
  if (remote) return
  ensureHydrated()
  const f = state.funnels.find((x) => x.id === funnelId)
  if (!f || f.leads.length) return
  const demo: Lead[] = names.map(([name, phone], i) => ({
    id: uid('l_'),
    name,
    phone,
    source: i % 2 === 0 ? 'whatsapp' : 'page',
    status: (['new', 'qualified', 'won'] as const)[i % 3],
    createdAt: Date.now() - (i + 1) * 3600_000,
    sample: true,
  }))
  const seedVisits = 40 + names.length * 7
  updateFunnel(funnelId, { leads: demo, visits: f.visits + seedVisits, seedVisits })
}

/** True when a funnel still carries any of the fictitious data `seedDemoLeads` injected. */
export function hasSampleData(f: Pick<Funnel, 'leads' | 'seedVisits'>): boolean {
  return !!f.seedVisits || f.leads.some((l) => l.sample)
}

/** "ابدأ من صفر" — removes every sample lead and the fake visit count `seedDemoLeads`
 * added, leaving any real leads/visits captured since untouched. */
export function clearSampleData(funnelId: string) {
  ensureHydrated()
  const f = state.funnels.find((x) => x.id === funnelId)
  if (!f) return
  const leads = f.leads.filter((l) => !l.sample)
  const visits = Math.max(0, f.visits - (f.seedVisits ?? 0))
  updateFunnel(funnelId, { leads, visits, seedVisits: 0 })
}
