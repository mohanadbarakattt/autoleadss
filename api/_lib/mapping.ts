import type { Funnel, FunnelSpec, Lead } from '../../src/saas/types'

/** snake_case DB rows <-> the app's camelCase types. Mirrors the shape the old
 * Supabase-backed db/remote.ts used, so the frontend mapper needs no changes. */

export interface FunnelRow {
  id: string
  name: string
  slug: string
  industry: string
  language: string
  status: string
  accent: string | null
  spec: FunnelSpec
  visits: number
  visits_by_day: Record<string, number> | null
  created_at: string
  updated_at: string
}

export interface LeadRow {
  id: string
  funnel_id: string
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  source: string
  status: string
  created_at: string
}

function toMillis(ts: string | null | undefined): number {
  if (!ts) return 0
  const ms = Date.parse(ts)
  return Number.isNaN(ms) ? 0 : ms
}

export function leadFromRow(r: LeadRow): Lead {
  return {
    id: r.id,
    name: r.name ?? '',
    phone: r.phone ?? '',
    email: r.email ?? undefined,
    message: r.message ?? undefined,
    source: (r.source as Lead['source']) ?? 'page',
    status: (r.status as Lead['status']) ?? 'new',
    createdAt: toMillis(r.created_at),
  }
}

export function funnelFromRow(r: FunnelRow, leads: LeadRow[] = []): Funnel {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    industry: r.industry as Funnel['industry'],
    language: r.language as Funnel['language'],
    status: r.status as Funnel['status'],
    accent: r.accent ?? '#FF5C2A',
    spec: r.spec,
    visits: r.visits ?? 0,
    visitsByDay: r.visits_by_day ?? undefined,
    createdAt: toMillis(r.created_at),
    updatedAt: toMillis(r.updated_at),
    leads: leads.map(leadFromRow).sort((a, b) => b.createdAt - a.createdAt),
  }
}

/** Fields the client may create/update; `id` is client-generated (offline-first) and
 * never rewritten by an update. */
export interface FunnelPatch {
  id?: string
  name?: string
  slug?: string
  industry?: string
  language?: string
  status?: string
  accent?: string | null
  spec?: FunnelSpec
  visits?: number
  visitsByDay?: Record<string, number>
}

export function isFunnelPatch(body: unknown): body is FunnelPatch {
  return typeof body === 'object' && body !== null
}
