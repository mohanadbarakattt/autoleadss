
import { useSyncExternalStore } from 'react'
import type { Funnel, Lead, Session, Workspace, User, PlanId, Region } from './types'

const KEY = 'virlo:state:v1'

interface State {
  session: Session | null
  funnels: Funnel[]
}

const empty: State = { session: null, funnels: [] }

let state: State = empty
let hydrated = false
const listeners = new Set<() => void>()

function load(): State {
  if (typeof window === 'undefined') return empty
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

function set(next: Partial<State>) {
  state = { ...state, ...next }
  persist()
  listeners.forEach((l) => l())
}

function ensureHydrated() {
  if (!hydrated && typeof window !== 'undefined') {
    state = load()
    hydrated = true
  }
}

function subscribe(cb: () => void) {
  ensureHydrated()
  listeners.add(cb)
  return () => listeners.delete(cb)
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
  return useSyncExternalStore(
    subscribe,
    () => state.session,
    () => null,
  )
}

export function useFunnels(): Funnel[] {
  return useSyncExternalStore(
    subscribe,
    () => state.funnels,
    () => [],
  )
}

export function useFunnel(id: string): Funnel | undefined {
  const funnels = useFunnels()
  return funnels.find((f) => f.id === id)
}

// ---------- auth ----------
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
  set({ funnels: [{ ...f, slug }, ...state.funnels] })
}

export function updateFunnel(id: string, patch: Partial<Funnel>) {
  ensureHydrated()
  set({
    funnels: state.funnels.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f)),
  })
}

export function updateSpec(id: string, mutate: (spec: Funnel['spec']) => Funnel['spec']) {
  ensureHydrated()
  set({
    funnels: state.funnels.map((f) => (f.id === id ? { ...f, spec: mutate(f.spec), updatedAt: Date.now() } : f)),
  })
}

export function deleteFunnel(id: string) {
  ensureHydrated()
  set({ funnels: state.funnels.filter((f) => f.id !== id) })
}

export function publishFunnel(id: string) {
  updateFunnel(id, { status: 'published' })
}

export function recordVisit(slug: string) {
  ensureHydrated()
  set({
    funnels: state.funnels.map((f) => (f.slug === slug ? { ...f, visits: f.visits + 1 } : f)),
  })
}

export function addLead(slug: string, lead: Omit<Lead, 'id' | 'createdAt' | 'status'>) {
  ensureHydrated()
  const full: Lead = { ...lead, id: uid('l_'), createdAt: Date.now(), status: 'new' }
  set({
    funnels: state.funnels.map((f) => (f.slug === slug ? { ...f, leads: [full, ...f.leads] } : f)),
  })
  return full
}

export function setLeadStatus(funnelId: string, leadId: string, status: Lead['status']) {
  ensureHydrated()
  set({
    funnels: state.funnels.map((f) =>
      f.id === funnelId ? { ...f, leads: f.leads.map((l) => (l.id === leadId ? { ...l, status } : l)) } : f,
    ),
  })
}

/** Seed a couple of demo leads so the CRM/analytics never look empty. */
export function seedDemoLeads(funnelId: string, names: [string, string][]) {
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
  }))
  updateFunnel(funnelId, { leads: demo, visits: f.visits + 40 + names.length * 7 })
}
