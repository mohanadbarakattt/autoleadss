import type { Funnel, FunnelSpec, Lead, LeadWithFunnel, Product, Order, OrderItem, Domain, AgencySettings, SubAccount } from '../../src/saas/types'
import { toSafeInt } from './money'

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
  /** Absent from queries that don't select it (e.g. api/published/index.ts,
   * which has no reason to expose it publicly) — optional so `funnelFromRow`
   * works against either row shape. */
  sub_account_id?: string | null
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

/** `LeadRow` plus the owning funnel's name — the row shape `GET /api/leads`
 * (the cross-site list, api/leads/index.ts) selects via a join. */
export interface LeadWithFunnelRow extends LeadRow {
  funnel_name: string
}

export function leadFromRowWithFunnel(r: LeadWithFunnelRow): LeadWithFunnel {
  return { ...leadFromRow(r), funnelId: r.funnel_id, funnelName: r.funnel_name }
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
    subAccountId: r.sub_account_id ?? undefined,
  }
}

/** Fields the client may create/update; `id` is client-generated (offline-first) and
 * never rewritten by an update. `subAccountId: null` clears the assignment. */
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
  subAccountId?: string | null
}

export function isFunnelPatch(body: unknown): body is FunnelPatch {
  return typeof body === 'object' && body !== null
}

// ---------------------------------------------------------------------------
// Sell (Phase 4a): products, orders, order_items
// ---------------------------------------------------------------------------

export interface ProductRow {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price_minor: string // bigint over the wire — always route through toSafeInt()
  currency: string
  stock: number
  status: string
  created_at: string
  updated_at: string
}

export function productFromRow(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    imageUrl: r.image_url ?? undefined,
    priceMinor: toSafeInt(r.price_minor, 'price_minor'),
    currency: r.currency,
    stock: r.stock,
    status: r.status as Product['status'],
    createdAt: toMillis(r.created_at),
    updatedAt: toMillis(r.updated_at),
  }
}

export interface OrderRow {
  id: string
  status: string
  subtotal_minor: string // bigint over the wire
  currency: string
  payment_id: string | null
  buyer_name: string | null
  buyer_email: string | null
  buyer_phone: string | null
  created_at: string
  updated_at: string
}

export interface OrderItemRow {
  id: string
  order_id: string
  product_id: string | null
  name_snapshot: string
  unit_price_minor: string // bigint over the wire
  quantity: number
  currency: string
}

export function orderItemFromRow(r: OrderItemRow): OrderItem {
  return {
    id: r.id,
    productId: r.product_id ?? undefined,
    nameSnapshot: r.name_snapshot,
    unitPriceMinor: toSafeInt(r.unit_price_minor, 'unit_price_minor'),
    quantity: r.quantity,
    currency: r.currency,
  }
}

export function orderFromRow(r: OrderRow, items: OrderItemRow[] = []): Order {
  return {
    id: r.id,
    status: r.status as Order['status'],
    subtotalMinor: toSafeInt(r.subtotal_minor, 'subtotal_minor'),
    currency: r.currency,
    paymentId: r.payment_id ?? undefined,
    buyerName: r.buyer_name ?? undefined,
    buyerEmail: r.buyer_email ?? undefined,
    buyerPhone: r.buyer_phone ?? undefined,
    createdAt: toMillis(r.created_at),
    updatedAt: toMillis(r.updated_at),
    items: items.map(orderItemFromRow),
  }
}

/** Write-path validation shared by api/products/index.ts (create) and
 * api/products/[id].ts (update) — kept here next to the row mapping they
 * validate for. */
export function isValidPriceMinor(v: unknown): v is number {
  return typeof v === 'number' && Number.isSafeInteger(v) && v > 0
}

export function isValidStock(v: unknown): v is number {
  return typeof v === 'number' && Number.isSafeInteger(v) && v >= 0
}

/** Uppercases and validates a currency code (ISO 4217, 3 letters), matching the
 * DB's `currency ~ '^[A-Z]{3}$'` check constraint. Returns null when invalid. */
export function normalizeCurrency(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const upper = v.trim().toUpperCase()
  return /^[A-Z]{3}$/.test(upper) ? upper : null
}

// ---------------------------------------------------------------------------
// Domains (Phase 4c)
// ---------------------------------------------------------------------------

export interface DomainRow {
  id: string
  funnel_id: string
  hostname: string
  verified: boolean
  verification_token: string
  created_at: string
  verified_at: string | null
}

export function domainFromRow(r: DomainRow): Domain {
  return {
    id: r.id,
    funnelId: r.funnel_id,
    hostname: r.hostname,
    verified: r.verified,
    verificationToken: r.verification_token,
    createdAt: toMillis(r.created_at),
    verifiedAt: r.verified_at ? toMillis(r.verified_at) : undefined,
  }
}

// ---------------------------------------------------------------------------
// Agency / white-label (Phase 6)
// ---------------------------------------------------------------------------

export interface AgencySettingsRow {
  brand_name: string | null
  accent: string | null
  logo_url: string | null
  hide_badge: boolean
}

export function agencySettingsFromRow(r: AgencySettingsRow): AgencySettings {
  return {
    brandName: r.brand_name ?? undefined,
    accent: r.accent ?? undefined,
    logoUrl: r.logo_url ?? undefined,
    hideBadge: r.hide_badge,
  }
}

export interface SubAccountRow {
  id: string
  name: string
  contact_email: string | null
  created_at: string
}

export function subAccountFromRow(r: SubAccountRow): SubAccount {
  return { id: r.id, name: r.name, contactEmail: r.contact_email ?? undefined, createdAt: toMillis(r.created_at) }
}

/**
 * The funnel OWNER's white-label branding, resolved server-side for the
 * public published payload (api/published/index.ts) — see `Funnel.brand`'s
 * doc in types.ts and Published.tsx's render logic. This is the actual fix
 * for the Phase 6 headline bug: previously nothing ever set `Funnel.brand`,
 * so Published.tsx fell back to the VISITOR's own local agency state, which
 * is empty for a real visitor.
 *
 * Badge removal (`hideBadge`) is nominally a paid feature — `whiteLabel` in
 * src/saas/entitlements.ts, granted only on the `whitelabel` plan — but there
 * is no server-side plan record to check against (`workspaces` was deferred
 * in migration 0001, billingEnabled is false; see docs/SETUP.md). A plan is
 * only ever a client-asserted value living in localStorage, so THIS FUNCTION
 * CANNOT ENFORCE THAT GATE. Enforcement today lives entirely in the client:
 * Agency.tsx only renders the white-label settings form when
 * `useEntitlements().whiteLabel` is true, so an un-entitled owner has no UI
 * path to set `hideBadge`/brand/logo. A technically savvy owner could still
 * call `PUT /api/agency/settings` directly regardless of plan — this is the
 * single choke point where a real gate would go once workspaces/billing
 * state is server-side (tracked for a later phase); marking it here rather
 * than shipping something that looks enforced but isn't.
 */
export function publicBrandFromRow(r: AgencySettingsRow): { brandName?: string; logoUrl?: string; hideBadge: boolean } {
  return {
    brandName: r.brand_name ?? undefined,
    logoUrl: r.logo_url ?? undefined,
    hideBadge: r.hide_badge ?? false,
  }
}
