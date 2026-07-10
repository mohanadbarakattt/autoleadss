import { useSyncExternalStore } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Funnel, Lead, Session, Workspace, User, PlanId, Region, AgencySettings, SubAccount } from './types'
import { clerkEnabled } from './config'
import {
  listFunnels as rListFunnels,
  createFunnel as rCreateFunnel,
  updateFunnel as rUpdateFunnel,
  deleteFunnel as rDeleteFunnel,
  setLeadStatusRemote as rSetLeadStatus,
} from './db/remote'
import {
  getAgencySettings,
  listSubAccounts,
  saveAgencySettingsRemote as rSaveAgencySettings,
  createSubAccountRemote as rCreateSubAccount,
  deleteSubAccountRemote as rDeleteSubAccount,
} from './db/agency'

const KEY = 'virlo:state:v1'

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

/** When set, mutations persist to Supabase (optimistic) and localStorage is bypassed. */
let remote: { sb: SupabaseClient } | null = null

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
  if (remote || typeof window === 'undefined') return // remote mode: DB is the source of truth
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
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
  // Clerk-backed sessions load from Supabase (via configureRemote), never localStorage.
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

function syncRemote(fn: (sb: SupabaseClient) => Promise<void>) {
  if (!remote) return
  fn(remote.sb).catch((e) => console.error('[remote sync]', e))
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
export function saveAgencySettings(patch: Partial<AgencySettings>) {
  ensureHydrated()
  const settings: AgencySettings = { hideBadge: true, ...state.agency.settings, ...patch }
  set({ agency: { ...state.agency, settings } })
  const ownerId = state.session?.user.id
  if (ownerId) syncRemote((sb) => rSaveAgencySettings(sb, ownerId, settings))
}

export function createSubAccount(name: string, contactEmail?: string): SubAccount {
  ensureHydrated()
  const sa: SubAccount = { id: uid('sa_'), name, contactEmail, createdAt: Date.now() }
  set({ agency: { ...state.agency, subAccounts: [...state.agency.subAccounts, sa] } })
  syncRemote((sb) => rCreateSubAccount(sb, sa))
  return sa
}

export function deleteSubAccount(id: string) {
  ensureHydrated()
  const activeSubAccountId = state.agency.activeSubAccountId === id ? null : state.agency.activeSubAccountId
  set({ agency: { ...state.agency, subAccounts: state.agency.subAccounts.filter((s) => s.id !== id), activeSubAccountId } })
  syncRemote((sb) => rDeleteSubAccount(sb, id))
}

export function setActiveSubAccount(id: string | null) {
  ensureHydrated()
  set({ agency: { ...state.agency, activeSubAccountId: id } })
}

// ---------- remote lifecycle (called by the Clerk bridge) ----------
export async function configureRemote(sb: SupabaseClient, session: Session) {
  remote = { sb }
  hydrated = true
  set({ session })
  try {
    const [funnels, settings, subAccounts] = await Promise.all([
      rListFunnels(sb),
      getAgencySettings(sb).catch(() => null),
      listSubAccounts(sb).catch(() => []),
    ])
    state = { ...state, funnels, agency: { ...state.agency, settings, subAccounts } }
    emit()
  } catch (e) {
    console.error('[remote load]', e)
  }
}

export function teardownRemote() {
  remote = null
  state = { session: null, funnels: [], agency: { settings: null, subAccounts: [], activeSubAccountId: null } }
  emit()
}

/** The active Supabase client in remote mode (for feature modules like WhatsApp settings), else null. */
export function getDb(): SupabaseClient | null {
  return remote?.sb ?? null
}

/** Bridge a Clerk identity into the local session shape (demo-parity) without Supabase. */
export function setBridgedSession(session: Session | null) {
  set({ session })
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
  syncRemote((sb) => rCreateFunnel(sb, funnel))
}

export function updateFunnel(id: string, patch: Partial<Funnel>) {
  ensureHydrated()
  set({ funnels: state.funnels.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f)) })
  // leads are persisted via their own path; don't push them through the funnel row.
  const rest: Partial<Funnel> = { ...patch }
  delete rest.leads
  syncRemote((sb) => rUpdateFunnel(sb, id, rest))
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
  if (nextSpec) syncRemote((sb) => rUpdateFunnel(sb, id, { spec: nextSpec }))
}

export function deleteFunnel(id: string) {
  ensureHydrated()
  set({ funnels: state.funnels.filter((f) => f.id !== id) })
  syncRemote((sb) => rDeleteFunnel(sb, id))
}

export function publishFunnel(id: string) {
  updateFunnel(id, { status: 'published' })
}

export function recordVisit(slug: string) {
  ensureHydrated()
  set({ funnels: state.funnels.map((f) => (f.slug === slug ? { ...f, visits: f.visits + 1 } : f)) })
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
  syncRemote((sb) => rSetLeadStatus(sb, leadId, status))
}

/** Seed demo leads so the CRM/analytics never look empty. Demo mode only. */
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
  }))
  updateFunnel(funnelId, { leads: demo, visits: f.visits + 40 + names.length * 7 })
}
