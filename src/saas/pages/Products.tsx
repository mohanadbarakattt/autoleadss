import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Pencil, Trash2, PackageOpen, ImageOff, Store } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { GoldButton, Panel, Tag } from '../suite/ui'
import { useI18n, toContentLocale } from '../i18n'
import { useSession, useProducts, useFunnels, createProduct, updateProduct, deleteProduct, uid } from '../store'
import { majorToMinor, formatMinorUnits, minorToMajorInput } from '../lib/money/minorUnits'
import { createStorefrontSite } from '../storefront/createStore'
import type { Product, Funnel } from '../types'

const STATUS_TONE: Record<Product['status'], string> = {
  draft: 'bg-suite-panel2 text-suite-muted',
  active: 'bg-suite-ok/15 text-suite-ok',
  archived: 'bg-suite-line text-suite-muted',
}

const CURRENCY_RE = /^[A-Za-z]{3}$/

/** The merchant-facing product manager content (Phase 4a — see docs/superpowers/
 * plans/2026-07-24-autoleadss-suite-v2-plan.md, Phase 4). Exported separately
 * from the routed page, same split as Hub/Start, so it can be tested without an
 * authenticated session. */
export function ProductsContent() {
  const { t, locale } = useI18n()
  const p = t.products
  const session = useSession()
  const products = useProducts()
  const funnels = useFunnels()
  const storeSite = funnels.find((f) => f.spec.mode === 'sell')
  const defaultCurrency = session?.workspace.marketRegion === 'global' ? 'USD' : 'AED'

  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function handleDelete(product: Product) {
    if (!window.confirm(p.deleteConfirm)) return
    void (async () => {
      const action = await deleteProduct(product.id)
      setNotice(action === 'archived' ? p.archivedNotice : p.deletedNotice)
    })()
  }

  return (
    <div className="mx-auto max-w-[1080px] px-[30px] pb-[60px] pt-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-luxe text-[34px] font-semibold text-suite-text">{p.title}</h1>
          <p className="mt-1 text-[15px] text-suite-muted">{p.subtitle}</p>
        </div>
        <GoldButton
          onClick={() => {
            setNotice(null)
            setEditing('new')
          }}
        >
          <Plus size={16} strokeWidth={2.2} aria-hidden /> {p.newProduct}
        </GoldButton>
      </div>

      {notice && (
        <div role="status" className="mt-4 rounded-xl border border-suite-line bg-suite-panel2 px-4 py-2.5 text-sm text-suite-text">
          {notice}
        </div>
      )}

      <StorefrontCallout
        site={storeSite}
        onCreate={() => {
          if (!session) return
          createStorefrontSite(session.workspace.name, toContentLocale(locale))
        }}
      />

      {editing && (
        <ProductForm
          key={editing === 'new' ? 'new' : editing.id}
          product={editing === 'new' ? null : editing}
          defaultCurrency={defaultCurrency}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            setNotice(null)
          }}
        />
      )}

      {!products.length ? (
        <Panel className="mt-8 flex flex-col items-center gap-3 p-14 text-center" data-testid="products-empty">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-suite-line bg-suite-panel2 text-suite-gold-l">
            <PackageOpen size={22} strokeWidth={1.5} aria-hidden />
          </span>
          <p className="font-luxe text-xl font-semibold text-suite-text">{p.empty.title}</p>
          <p className="max-w-[360px] text-sm text-suite-muted">{p.empty.body}</p>
        </Panel>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-3 min-[701px]:grid-cols-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              statusLabel={p.status[product.status]}
              stockLabel={p.stockLabel}
              editLabel={t.common.edit}
              deleteLabel={t.common.delete}
              onEdit={() => {
                setNotice(null)
                setEditing(product)
              }}
              onDelete={() => handleDelete(product)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** Section 6: gets a merchant from zero products to a demonstrable live
 * store without waiting on the full storefront editor (4c). Keeps whatever
 * sell-mode site already exists rather than creating a second one. */
function StorefrontCallout({ site, onCreate }: { site: Funnel | undefined; onCreate: () => void }) {
  const { t, isRTL } = useI18n()
  const s = t.products.storefront

  if (site) {
    return (
      <Panel className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-suite-line bg-suite-panel2 text-suite-gold-l">
            <Store size={18} strokeWidth={1.6} aria-hidden />
          </span>
          <div>
            <p className="font-luxe text-lg font-semibold text-suite-text">{s.liveTitle}</p>
            <p className="text-sm text-suite-muted">{s.liveBody}</p>
          </div>
        </div>
        <a href={`/p/${site.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-suite-gold-l hover:text-suite-gold">
          {s.viewStore} {isRTL ? '←' : '→'}
        </a>
      </Panel>
    )
  }

  return (
    <Panel className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-suite-line bg-suite-panel2 text-suite-gold-l">
          <Store size={18} strokeWidth={1.6} aria-hidden />
        </span>
        <div>
          <p className="font-luxe text-lg font-semibold text-suite-text">{s.createTitle}</p>
          <p className="text-sm text-suite-muted">{s.createBody}</p>
        </div>
      </div>
      <GoldButton onClick={onCreate}>{s.createCta}</GoldButton>
    </Panel>
  )
}

function ProductCard({
  product,
  statusLabel,
  stockLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: {
  product: Product
  statusLabel: string
  stockLabel: string
  editLabel: string
  deleteLabel: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Panel data-testid={`product-${product.id}`} className="flex items-center gap-4 p-4">
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-suite-line bg-suite-panel2 text-suite-muted">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageOff size={20} strokeWidth={1.5} aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-luxe text-lg font-semibold text-suite-text">{product.name}</p>
        <p className="mt-0.5 text-sm text-suite-gold-l">{formatMinorUnits(product.priceMinor, product.currency)}</p>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-suite-muted">
          <span>{product.stock} {stockLabel}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_TONE[product.status]}`}>{statusLabel}</span>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        <button type="button" onClick={onEdit} aria-label={editLabel} className="rounded-lg p-2 text-suite-muted transition-colors hover:bg-suite-panel2 hover:text-suite-text">
          <Pencil size={15} strokeWidth={1.8} aria-hidden />
        </button>
        <button type="button" onClick={onDelete} aria-label={deleteLabel} className="rounded-lg p-2 text-suite-muted transition-colors hover:bg-suite-panel2 hover:text-red-400">
          <Trash2 size={15} strokeWidth={1.8} aria-hidden />
        </button>
      </div>
    </Panel>
  )
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border bg-suite-panel2 px-3 py-2 text-sm text-suite-text outline-none transition-colors placeholder:text-suite-muted/60 focus:border-suite-gold ${
    hasError ? 'border-red-400/60' : 'border-suite-line'
  }`
}

function ProductForm({
  product,
  defaultCurrency,
  onCancel,
  onSaved,
}: {
  product: Product | null
  defaultCurrency: string
  onCancel: () => void
  onSaved: () => void
}) {
  const { t } = useI18n()
  const p = t.products
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [price, setPrice] = useState(product ? minorToMajorInput(product.priceMinor) : '')
  const [currency, setCurrency] = useState(product?.currency ?? defaultCurrency)
  const [stock, setStock] = useState(product ? String(product.stock) : '0')
  const [status, setStatus] = useState<Product['status']>(product?.status ?? 'draft')
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: { name?: string; price?: string } = {}
    if (!name.trim()) nextErrors.name = p.form.nameError

    let priceMinor: number | null = null
    try {
      priceMinor = majorToMinor(price)
    } catch {
      nextErrors.price = p.form.priceError
    }

    const normalizedCurrency = CURRENCY_RE.test(currency.trim()) ? currency.trim().toUpperCase() : null
    if (!normalizedCurrency) nextErrors.price = nextErrors.price ?? p.form.priceError

    if (Object.keys(nextErrors).length || priceMinor === null || !normalizedCurrency) {
      setErrors(nextErrors)
      return
    }

    const stockNum = Math.max(0, Math.trunc(Number(stock) || 0))

    if (product) {
      updateProduct(product.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        priceMinor,
        currency: normalizedCurrency,
        stock: stockNum,
        status,
      })
    } else {
      const now = Date.now()
      createProduct({
        id: uid('prod_'),
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        priceMinor,
        currency: normalizedCurrency,
        stock: stockNum,
        status,
        createdAt: now,
        updatedAt: now,
      })
    }
    onSaved()
  }

  return (
    <Panel className="mt-6 p-6">
      <Tag>{product ? p.form.titleEdit : p.form.titleNew}</Tag>
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 min-[701px]:grid-cols-2">
        <label className="min-[701px]:col-span-2 block text-sm">
          <span className="mb-1.5 block text-suite-muted">{p.form.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={p.form.namePh} className={inputClass(!!errors.name)} />
          {errors.name && <span className="mt-1 block text-xs text-red-400">{errors.name}</span>}
        </label>

        <label className="min-[701px]:col-span-2 block text-sm">
          <span className="mb-1.5 block text-suite-muted">{p.form.description}</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass(false)} />
        </label>

        <label className="min-[701px]:col-span-2 block text-sm">
          <span className="mb-1.5 block text-suite-muted">{p.form.imageUrl}</span>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className={inputClass(false)} />
          <span className="mt-1 block text-xs text-suite-muted">{p.form.imageHint}</span>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-suite-muted">{p.form.price}</span>
          <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="240.50" className={inputClass(!!errors.price)} />
          {errors.price && <span className="mt-1 block text-xs text-red-400">{errors.price}</span>}
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-suite-muted">{p.form.currency}</span>
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} className={inputClass(false)} />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-suite-muted">{p.form.stock}</span>
          <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" min={0} step={1} className={inputClass(false)} />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-suite-muted">{p.form.status}</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Product['status'])} className={inputClass(false)}>
            <option value="draft">{p.status.draft}</option>
            <option value="active">{p.status.active}</option>
            <option value="archived">{p.status.archived}</option>
          </select>
        </label>

        <div className="flex items-center gap-3 min-[701px]:col-span-2">
          <GoldButton type="submit">{t.common.save}</GoldButton>
          <button type="button" onClick={onCancel} className="text-sm text-suite-muted hover:text-suite-text">
            {t.common.cancel}
          </button>
        </div>
      </form>
    </Panel>
  )
}

export default function Products() {
  return (
    <SuiteShell>
      <Helmet defer={false}>
        <title>AutoLeadss — products</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <ProductsContent />
    </SuiteShell>
  )
}
