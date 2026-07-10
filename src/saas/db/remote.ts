import type { SupabaseClient } from '@supabase/supabase-js'
import type { Funnel, FunnelSpec, Lead } from '../types'

/**
 * Remote data-access layer backed by Supabase. Maps snake_case DB rows to the
 * app's camelCase types. Timestamps: DB timestamptz (ISO) <-> app epoch millis.
 */

interface FunnelRow {
  id: string
  name: string
  slug: string
  industry: Funnel['industry']
  language: Funnel['language']
  status: Funnel['status']
  accent: string | null
  spec: FunnelSpec
  visits: number | null
  created_at: string | null
  updated_at: string | null
  sub_account_id?: string | null
  leads?: LeadRow[] | null
}

interface LeadRow {
  id: string
  funnel_id: string
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  source: Lead['source']
  status: Lead['status']
  created_at: string | null
}

function toMillis(ts: string | number | null | undefined): number {
  if (ts == null) return 0
  if (typeof ts === 'number') return ts
  const ms = Date.parse(ts)
  return Number.isNaN(ms) ? 0 : ms
}
function toIso(ms: number | undefined): string {
  return new Date(ms ?? Date.now()).toISOString()
}

function leadFromRow(r: LeadRow): Lead {
  return {
    id: r.id,
    name: r.name ?? '',
    phone: r.phone ?? '',
    email: r.email ?? undefined,
    message: r.message ?? undefined,
    source: r.source,
    status: r.status,
    createdAt: toMillis(r.created_at),
  }
}

function leadToRow(funnelId: string, lead: Partial<Lead>): Partial<LeadRow> {
  const row: Partial<LeadRow> = { funnel_id: funnelId }
  if (lead.id !== undefined) row.id = lead.id
  if (lead.name !== undefined) row.name = lead.name
  if (lead.phone !== undefined) row.phone = lead.phone
  if (lead.email !== undefined) row.email = lead.email ?? null
  if (lead.message !== undefined) row.message = lead.message ?? null
  if (lead.source !== undefined) row.source = lead.source
  if (lead.status !== undefined) row.status = lead.status
  if (lead.createdAt !== undefined) row.created_at = toIso(lead.createdAt)
  return row
}

function funnelFromRow(r: FunnelRow): Funnel {
  const leads = (r.leads ?? []).map(leadFromRow).sort((a, b) => b.createdAt - a.createdAt)
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    industry: r.industry,
    language: r.language,
    status: r.status,
    accent: r.accent ?? '#FF5C2A',
    spec: r.spec,
    visits: r.visits ?? 0,
    createdAt: toMillis(r.created_at),
    updatedAt: toMillis(r.updated_at),
    subAccountId: r.sub_account_id ?? undefined,
    leads,
  }
}

function funnelToRow(patch: Partial<Funnel>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (patch.id !== undefined) row.id = patch.id
  if (patch.name !== undefined) row.name = patch.name
  if (patch.slug !== undefined) row.slug = patch.slug
  if (patch.industry !== undefined) row.industry = patch.industry
  if (patch.language !== undefined) row.language = patch.language
  if (patch.status !== undefined) row.status = patch.status
  if (patch.accent !== undefined) row.accent = patch.accent
  if (patch.spec !== undefined) row.spec = patch.spec
  if (patch.visits !== undefined) row.visits = patch.visits
  if (patch.createdAt !== undefined) row.created_at = toIso(patch.createdAt)
  if (patch.updatedAt !== undefined) row.updated_at = toIso(patch.updatedAt)
  if (patch.subAccountId !== undefined) row.sub_account_id = patch.subAccountId ?? null
  return row
}

const FUNNEL_SELECT = 'id,name,slug,industry,language,status,accent,spec,visits,created_at,updated_at,sub_account_id,leads(*)'

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`remote.${context}: ${error.message}`)
}

// ---------- authenticated (dashboard) ----------

export async function listFunnels(sb: SupabaseClient): Promise<Funnel[]> {
  const { data, error } = await sb.from('funnels').select(FUNNEL_SELECT).order('created_at', { ascending: false })
  fail('listFunnels', error)
  return ((data ?? []) as unknown as FunnelRow[]).map(funnelFromRow)
}

export async function createFunnel(sb: SupabaseClient, f: Funnel): Promise<void> {
  const { leads, ...rest } = f
  const { error } = await sb.from('funnels').insert(funnelToRow(rest))
  fail('createFunnel', error)
  if (leads?.length) {
    const { error: leadErr } = await sb.from('leads').insert(leads.map((l) => leadToRow(f.id, l)))
    fail('createFunnel.leads', leadErr)
  }
}

export async function updateFunnel(sb: SupabaseClient, id: string, patch: Partial<Funnel>): Promise<void> {
  const row = funnelToRow(patch)
  delete row.id // never rewrite the PK
  if (row.updated_at === undefined) row.updated_at = toIso(Date.now())
  const { error } = await sb.from('funnels').update(row).eq('id', id)
  fail('updateFunnel', error)
}

export async function deleteFunnel(sb: SupabaseClient, id: string): Promise<void> {
  const { error } = await sb.from('funnels').delete().eq('id', id)
  fail('deleteFunnel', error)
}

export async function addLeadRemote(sb: SupabaseClient, funnelId: string, lead: Lead): Promise<void> {
  const { error } = await sb.from('leads').insert(leadToRow(funnelId, lead))
  fail('addLeadRemote', error)
}

export async function setLeadStatusRemote(sb: SupabaseClient, leadId: string, status: Lead['status']): Promise<void> {
  const { error } = await sb.from('leads').update({ status }).eq('id', leadId)
  fail('setLeadStatusRemote', error)
}

// ---------- public (published page) ----------

export async function getPublishedFunnel(sb: SupabaseClient, slug: string): Promise<Funnel | null> {
  const { data, error } = await sb.rpc('get_published_funnel', { p_slug: slug })
  fail('getPublishedFunnel', error)
  const row = (Array.isArray(data) ? data[0] : data) as FunnelRow | null | undefined
  return row ? funnelFromRow(row) : null
}

/** Resolve a custom domain / subdomain host to its published funnel. */
export async function getPublishedFunnelByHost(sb: SupabaseClient, host: string): Promise<Funnel | null> {
  const { data, error } = await sb.rpc('get_published_funnel_by_host', { p_host: host })
  fail('getPublishedFunnelByHost', error)
  const row = (Array.isArray(data) ? data[0] : data) as FunnelRow | null | undefined
  return row ? funnelFromRow(row) : null
}

export async function recordVisitRemote(sb: SupabaseClient, slug: string): Promise<void> {
  const { error } = await sb.rpc('increment_visit', { p_slug: slug })
  fail('recordVisitRemote', error)
}

export async function captureLeadRemote(
  sb: SupabaseClient,
  slug: string,
  lead: { name: string; phone: string; email?: string; message?: string; source?: string },
): Promise<void> {
  const { error } = await sb.rpc('capture_lead', {
    p_slug: slug,
    p_name: lead.name,
    p_phone: lead.phone,
    p_email: lead.email ?? null,
    p_message: lead.message ?? null,
    p_source: lead.source ?? 'page',
  })
  fail('captureLeadRemote', error)
}
