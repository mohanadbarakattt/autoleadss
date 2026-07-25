import { getSql } from '../_lib/db'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { toSafeInt } from '../_lib/money'
import { connectedImplementedGateway } from '../_lib/payments/gate'
import type { FunnelSpec } from '../../src/saas/types'

/** No cart line may request more than this — "absurdly large" quantities are
 * rejected before they ever reach the subtotal/stock math below. */
const MAX_QUANTITY = 10_000

interface OrderItemInput {
  productId?: unknown
  quantity?: unknown
}

interface OrderBody {
  slug?: string
  items?: OrderItemInput[]
  buyer?: { name?: string; email?: string; phone?: string }
}

interface SiteRow {
  clerk_user_id: string
  spec: FunnelSpec
}

interface ProductRow {
  id: string
  name: string
  price_minor: string // bigint over the wire — always route through toSafeInt()
  currency: string
  stock: number
  status: string
}

function isPositiveSafeInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isSafeInteger(v) && v > 0
}

function genId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`
}

/**
 * POST /api/published/order — public, no-auth checkout for a storefront
 * (Phase 4b). Body: `{ slug, items: [{ productId, quantity }], buyer: { name,
 * email, phone } }`.
 *
 * Every step below is read-only until the very last one; any rejection along
 * the way (404/409/400) writes NOTHING — no order, no order_items, no
 * payment row. Order of operations, all server-side, matching the design
 * spec exactly:
 *   1. Resolve the published, sell-mode site and its owner.
 *   2. Gateway gate — fail closed. Every real gateway ships `implemented:
 *      false` today (see api/_lib/payments/registry.ts), so this 409s unless
 *      PAYMENTS_FAKE_ADAPTER=1 and the owner has connected the fake gateway.
 *   3. Load every referenced product BY ID FROM THE DATABASE, scoped to this
 *      owner — an id that isn't the owner's own active product 400s.
 *   4. Compute the subtotal from the STORED price_minor values only. Whatever
 *      price/amount the client sends, if any, is never read. Quantities must
 *      be positive safe integers, and every item must share one currency.
 *   5. Stock check — refuse (400) if any line exceeds available stock. Stock
 *      is NOT decremented here: an unpaid 'pending' order must not be able to
 *      drain inventory. Decrementing belongs with payment confirmation (the
 *      Phase 3a webhook, api/payments/webhook/[gateway].ts), which this route
 *      never touches.
 *   6. Write: a 'pending' payment, a 'pending' order referencing it, and its
 *      order_items (name/price snapshotted AS SOLD) — one atomic
 *      `sql.transaction`, so a mid-write failure leaves nothing behind. This
 *      order can never be created with status='paid' here — 'paid' is only
 *      ever reachable via that same webhook.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const body = (req.body ?? {}) as OrderBody
  if (!body.slug || !Array.isArray(body.items) || body.items.length === 0) {
    return sendJson(res, 400, { error: 'slug and a non-empty items array are required.' })
  }
  const buyerName = body.buyer?.name?.trim()
  const buyerPhone = body.buyer?.phone?.trim()
  if (!buyerName || !buyerPhone) return sendJson(res, 400, { error: 'buyer name and phone are required.' })
  const buyerEmail = body.buyer?.email?.trim() || null

  // ---- 1. Resolve the published, sell-mode site and its owner. ----
  const siteRows = (await sql`
    select clerk_user_id, spec from autoleadss.funnels where slug = ${body.slug} and status = 'published'
  `) as unknown as SiteRow[]
  const site = siteRows[0]
  if (!site || site.spec?.mode !== 'sell') return sendJson(res, 404, { error: `Store not found or not published: ${body.slug}` })
  const ownerId = site.clerk_user_id

  // ---- 2. Gateway gate — fail closed, create NOTHING. Whatever the client
  // believes (e.g. a stale/tampered `acceptsPayments` hint from
  // api/published/products.ts) is irrelevant — this is re-derived from the
  // DB every time via the same shared predicate that hint is computed from. ----
  const connectedGateway = await connectedImplementedGateway(sql, ownerId)
  if (!connectedGateway) return sendJson(res, 409, { error: 'payments_not_connected' })

  // Merge duplicate productIds (sum quantities) and shape-validate before any DB lookup.
  const quantities = new Map<string, number>()
  for (const raw of body.items) {
    if (typeof raw.productId !== 'string' || !raw.productId) return sendJson(res, 400, { error: 'Every item needs a productId.' })
    if (!isPositiveSafeInt(raw.quantity) || raw.quantity > MAX_QUANTITY) {
      return sendJson(res, 400, { error: `quantity for ${raw.productId} must be a positive integer.` })
    }
    quantities.set(raw.productId, (quantities.get(raw.productId) ?? 0) + raw.quantity)
  }

  // ---- 3. Load every referenced product from the DB, scoped to this owner. ----
  const products: { id: string; name: string; priceMinor: number; currency: string; stock: number }[] = []
  for (const productId of quantities.keys()) {
    const rows = (await sql`
      select id, name, price_minor, currency, stock, status from autoleadss.products
      where id = ${productId} and clerk_user_id = ${ownerId}
    `) as unknown as ProductRow[]
    const product = rows[0]
    if (!product || product.status !== 'active') return sendJson(res, 400, { error: `Product not available: ${productId}` })
    products.push({
      id: product.id,
      name: product.name,
      priceMinor: toSafeInt(product.price_minor, 'price_minor'),
      currency: product.currency,
      stock: product.stock,
    })
  }

  // ---- 4. Subtotal from stored prices only, one currency. ----
  const currency = products[0].currency
  if (products.some((p) => p.currency !== currency)) return sendJson(res, 400, { error: 'Items must share one currency.' })

  let subtotalMinor = 0
  for (const product of products) subtotalMinor += product.priceMinor * quantities.get(product.id)!
  if (!Number.isSafeInteger(subtotalMinor) || subtotalMinor <= 0) return sendJson(res, 400, { error: 'Order total is invalid.' })

  // ---- 5. Stock check — fail closed. Never decremented here. ----
  for (const product of products) {
    if (quantities.get(product.id)! > product.stock) return sendJson(res, 400, { error: `Insufficient stock for ${product.id}.` })
  }

  // ---- 6. Write: payment -> order (references it) -> order_items. Atomic. ----
  const paymentId = genId('pay_')
  const orderId = genId('ord_')

  await sql.transaction([
    sql`
      insert into autoleadss.payments (id, clerk_user_id, gateway, amount_minor, currency, status, reference)
      values (${paymentId}, ${ownerId}, ${connectedGateway}, ${subtotalMinor}, ${currency}, 'pending', ${orderId})
    `,
    sql`
      insert into autoleadss.orders (id, clerk_user_id, status, subtotal_minor, currency, payment_id, buyer_name, buyer_email, buyer_phone)
      values (${orderId}, ${ownerId}, 'pending', ${subtotalMinor}, ${currency}, ${paymentId}, ${buyerName}, ${buyerEmail}, ${buyerPhone})
    `,
    ...products.map((product) => {
      const itemId = genId('oi_')
      const quantity = quantities.get(product.id)!
      return sql`
        insert into autoleadss.order_items (id, order_id, product_id, name_snapshot, unit_price_minor, quantity, currency)
        values (${itemId}, ${orderId}, ${product.id}, ${product.name}, ${product.priceMinor}, ${quantity}, ${currency})
      `
    }),
  ])

  return sendJson(res, 201, { ok: true, orderId, paymentId })
}
