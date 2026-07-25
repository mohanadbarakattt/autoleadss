import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useI18n } from '../../i18n'
import { formatMinorUnits } from '../../lib/money/minorUnits'
import { FieldGroup, EditField, EditArea } from './fields'
import type { FunnelSpec, Order } from '../../types'

/** Sell-mode Editor panels (Phase 4c) — split out of Editor.tsx so its
 * capture-mode tabs (unchanged) don't have to share a file with these. */

/** Edits the fields StorefrontRenderer actually reads: the hero, and the band
 * section (`spec.page.finalCta`, with a generic fallback when unset — see
 * StorefrontRenderer.tsx). */
export function StorefrontPanel({ spec, set }: { spec: FunnelSpec; set: (mutate: (s: FunnelSpec) => FunnelSpec) => void }) {
  const { t } = useI18n()
  const p = t.editor.storefrontPanel
  const hero = spec.page.hero
  const band = spec.page.finalCta

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <FieldGroup title={p.heroTitle}>
        <EditArea label={p.headline} value={hero.headline} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, hero: { ...s.page.hero, headline: v } } }))} />
        <EditArea label={p.subhead} value={hero.subhead} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, hero: { ...s.page.hero, subhead: v } } }))} />
        <EditField label={p.cta} value={hero.ctaPrimary} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, hero: { ...s.page.hero, ctaPrimary: v } } }))} />
      </FieldGroup>

      <FieldGroup title={p.bandTitle}>
        <EditField label={p.bandLabel} value={band.sub} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, finalCta: { ...s.page.finalCta, sub: v } } }))} />
        <EditField label={p.bandHeadline} value={band.headline} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, finalCta: { ...s.page.finalCta, headline: v } } }))} />
        <EditField label={p.bandCta} value={band.cta} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, finalCta: { ...s.page.finalCta, cta: v } } }))} />
      </FieldGroup>
    </div>
  )
}

/** A link through to the real product manager — not a duplicate CRUD surface
 * (see src/saas/pages/Products.tsx, which already owns create/edit/delete). */
export function ProductsPanel() {
  const { t } = useI18n()
  const p = t.editor.productsPanel
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
      <Package size={28} className="text-accent" />
      <p className="text-sm text-muted-fg">{p.body}</p>
      <Link to="/app/products" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
        {p.cta}
      </Link>
    </div>
  )
}

const STATUS_TONE: Record<Order['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-600',
  paid: 'bg-emerald-500/15 text-emerald-600',
  cancelled: 'bg-muted text-muted-fg',
  refunded: 'bg-red-500/15 text-red-600',
}

/** Real orders (GET /api/orders, via the shared store — see store.ts's
 * `useOrders`), newest first. Display only — no status mutation here, that
 * stays with the payments webhook. */
export function OrdersPanel({ orders }: { orders: Order[] }) {
  const { t } = useI18n()
  const p = t.editor.ordersPanel
  if (!orders.length) return <p className="py-16 text-center text-sm text-muted-fg">{p.empty}</p>

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-fg">
            <th className="px-5 py-3 text-start font-medium">{p.buyer}</th>
            <th className="px-5 py-3 text-start font-medium">{p.items}</th>
            <th className="px-5 py-3 text-start font-medium">{p.total}</th>
            <th className="px-5 py-3 text-start font-medium">{p.status}</th>
            <th className="px-5 py-3 text-start font-medium">{p.date}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border/60 last:border-0">
              <td className="px-5 py-3 font-medium">{o.buyerName || '—'}</td>
              <td className="px-5 py-3 text-muted-fg">{o.items.map((it) => `${it.nameSnapshot} ×${it.quantity}`).join(', ')}</td>
              <td className="px-5 py-3">{formatMinorUnits(o.subtotalMinor, o.currency)}</td>
              <td className="px-5 py-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[o.status]}`}>{p.statuses[o.status]}</span>
              </td>
              <td className="px-5 py-3 text-muted-fg">{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
