import { useState } from 'react'
import { ShoppingCart, ImageOff } from 'lucide-react'
import type { Dict } from '../i18n'
import { dictFor } from '../i18n'
import { formatMinorUnits } from '../lib/money/minorUnits'
import { useCart } from './cart'
import CartDrawer from './CartDrawer'
import type { FunnelSpec, PublicProduct } from '../types'

/**
 * The public storefront (Phase 4b) — matches `.superpowers/al-storefront.html`
 * closely: announce bar (omitted — there is no merchant-editable source for it
 * yet, see the design spec's "never fabricate delivery promises" rule; 4c
 * adds the field), sticky blurred header with a centered brand wordmark and a
 * cart icon, hero, a 4-column product grid, a full-width band CTA, and a
 * footer.
 *
 * Content honesty: every string here is either the merchant's own data
 * (business name, real products) or generic, non-branded UI microcopy from
 * `t.storefront` (Curated / New arrivals / Shop now) — no invented brand
 * names, taglines, product copy, reviews, or hotlinked stock photography. A
 * product with no `imageUrl` gets a neutral placeholder block, never a stock
 * photo.
 */
export default function StorefrontRenderer({
  spec,
  slug,
  products,
  acceptsPayments,
  onCheckout,
}: {
  spec: FunnelSpec
  slug: string
  products: PublicProduct[]
  /** Display-safe UX hint (see api/published/products.ts) — lets the cart
   * drawer show the "not accepting payments yet" state before the contact
   * form is ever shown, instead of after collecting the shopper's name/
   * email/phone for an order that can't be placed. Never the enforcement:
   * api/published/order.ts refuses independently either way. */
  acceptsPayments: boolean
  onCheckout: (input: {
    items: { productId: string; quantity: number }[]
    buyer: { name: string; email?: string; phone: string }
  }) => Promise<{ orderId: string; paymentId: string }>
}) {
  const rtl = spec.language === 'ar'
  const t = dictFor(spec.language).storefront
  const cart = useCart(slug)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const hero = spec.page.hero

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="theme-store min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[#e9e4da] bg-store-pearl/90 backdrop-blur">
        <div className="mx-auto grid h-[74px] max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center px-[26px]">
          <div aria-hidden />
          <span className="font-luxe text-center text-[22px] font-semibold tracking-[0.05em] min-[861px]:text-[28px]">
            {spec.businessName}
          </span>
          <div className="flex justify-end">
            <button type="button" onClick={() => setDrawerOpen(true)} aria-label={t.cart} className="relative text-store-ink">
              <ShoppingCart size={20} strokeWidth={1.4} aria-hidden />
              {cart.count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-store-gold px-0.5 text-[10px] font-semibold text-white">
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="relative flex h-[420px] flex-col items-center justify-center overflow-hidden bg-store-ink px-6 text-center text-white min-[861px]:h-[560px]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 70% 30%, #a9853f3d 0%, transparent 70%)' }}
        />
        <div className="relative">
          <h1 className="font-luxe text-[38px] font-medium leading-[1.05] min-[861px]:text-[64px]">{hero.headline}</h1>
          {hero.subhead && <p className="mx-auto mt-3 max-w-md text-[15px] font-light opacity-90">{hero.subhead}</p>}
          {hero.ctaPrimary && (
            <a
              href="#shop"
              className="mt-7 inline-block bg-white px-[34px] py-3.5 text-xs uppercase tracking-[0.16em] text-store-ink transition-opacity hover:opacity-90"
            >
              {hero.ctaPrimary}
            </a>
          )}
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-[1200px] px-[26px] pb-6 pt-[60px] min-[861px]:pt-[70px]">
        <div className="mb-8 text-center min-[861px]:mb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8a6a2c]">{t.curated}</p>
          <h2 className="mt-2.5 font-luxe text-[28px] font-medium min-[861px]:text-[34px]">{t.newArrivals}</h2>
        </div>

        {products.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-[#e9e4da] py-16 text-center text-[#8a8479]">
            <p className="font-luxe text-xl text-store-ink">{t.emptyCatalogue.title}</p>
            <p className="mt-2 text-sm">{t.emptyCatalogue.body}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 min-[861px]:grid-cols-4 min-[861px]:gap-[26px]">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} t={t} onAdd={() => cart.add(product.id)} />
            ))}
          </div>
        )}
      </section>

      {products.length > 0 && (
        <section className="mt-[60px] flex h-[240px] flex-col items-center justify-center bg-store-ink px-6 text-center text-white min-[861px]:mt-[70px] min-[861px]:h-[340px]">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#e8d6ac]">{t.shopTheStore}</p>
          <h3 className="mt-3 font-luxe text-[26px] font-medium min-[861px]:text-[40px]">{t.fullCollection}</h3>
          <a
            href="#shop"
            className="mt-5 border border-white px-[30px] py-3 text-xs uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-store-ink"
          >
            {t.shopNow}
          </a>
        </section>
      )}

      <footer className="mt-16 border-t border-[#e9e4da] py-12 min-[861px]:mt-20 min-[861px]:py-14">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-[26px] min-[861px]:grid-cols-[1.4fr_1fr]">
          <p className="font-luxe text-[24px] min-[861px]:text-[26px]">{spec.businessName}</p>
          <div>
            <h4 className="mb-3.5 text-[11px] uppercase tracking-[0.14em] text-store-ink">{t.shop}</h4>
            <a href="#shop" className="text-[13px] text-[#6d675c] hover:text-[#8a6a2c]">
              {t.newArrivals}
            </a>
          </div>
        </div>
      </footer>

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        products={products}
        acceptsPayments={acceptsPayments}
        t={t}
        onCheckout={onCheckout}
      />
    </div>
  )
}

function ProductCard({ product, t, onAdd }: { product: PublicProduct; t: Dict['storefront']; onAdd: () => void }) {
  return (
    <div>
      <div className="aspect-[3/4] overflow-hidden bg-[#f0ece3]">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#b9b2a4]" data-testid="product-image-placeholder">
            <ImageOff size={28} strokeWidth={1.2} aria-hidden />
          </div>
        )}
      </div>
      <p className="mt-3.5 text-center font-luxe text-[17px] min-[861px]:text-[19px]">{product.name}</p>
      <p className="mt-1 text-center text-[13px] tracking-[0.06em] text-[#8a6a2c]">{formatMinorUnits(product.priceMinor, product.currency)}</p>
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={onAdd}
          disabled={!product.inStock}
          className="text-[11px] uppercase tracking-[0.1em] text-store-ink underline decoration-[#e9e4da] underline-offset-4 disabled:cursor-not-allowed disabled:text-[#b9b2a4] disabled:no-underline"
        >
          {product.inStock ? t.addToCart : t.outOfStock}
        </button>
      </div>
    </div>
  )
}
