import { useEffect, useState, type FormEvent } from 'react'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import type { PublicProduct } from '../types'
import type { Dict } from '../i18n'
import { formatMinorUnits } from '../lib/money/minorUnits'
import type { Cart } from './cart'

type Step = 'cart' | 'checkout' | 'gated' | 'success' | 'error'

/**
 * Locks background scroll while the drawer is open and restores the exact
 * prior scroll position on close, with no layout shift: `position: fixed`
 * takes body out of flow (so the page behind can't scroll), and
 * `padding-inline-end` backfills the width the vanished scrollbar leaves
 * behind so content doesn't reflow. The logical property (not `padding-right`)
 * keeps this correct in RTL — it always pads the edge the scrollbar actually
 * disappeared from, mirrored automatically by direction.
 */
function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { body } = document
    const scrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      paddingInlineEnd: body.style.paddingInlineEnd,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    if (scrollbarWidth > 0) body.style.paddingInlineEnd = `${scrollbarWidth}px`
    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.left = prev.left
      body.style.right = prev.right
      body.style.width = prev.width
      body.style.paddingInlineEnd = prev.paddingInlineEnd
      window.scrollTo(0, scrollY)
    }
  }, [active])
}

/**
 * The cart panel + checkout form for the public storefront. `onCheckout`
 * throwing `Error('payments_not_connected')` is how the caller (Published.tsx)
 * signals the fail-closed gateway gate — see api/published/order.ts's 409 —
 * so this never simulates a purchase; any other failure shows a generic
 * retry state instead. That's a defense-in-depth fallback for a mid-session
 * race (gateway disconnected between page load and submit) — the primary
 * defense is `acceptsPayments`, which hides the checkout button (and with it
 * the contact form) entirely so a shopper is never asked for their name/
 * email/phone for an order the store categorically cannot accept.
 */
export default function CartDrawer({
  open,
  onClose,
  cart,
  products,
  acceptsPayments,
  t,
  onCheckout,
}: {
  open: boolean
  onClose: () => void
  cart: Cart
  products: PublicProduct[]
  acceptsPayments: boolean
  t: Dict['storefront']
  onCheckout: (input: {
    items: { productId: string; quantity: number }[]
    buyer: { name: string; email?: string; phone: string }
  }) => Promise<{ orderId: string; paymentId: string }>
}) {
  const [step, setStep] = useState<Step>('cart')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useLockBodyScroll(open)

  if (!open) return null

  const byId = new Map(products.map((p) => [p.id, p]))
  const lines = cart.items
    .map((item) => ({ item, product: byId.get(item.productId) }))
    .filter((l): l is { item: (typeof cart.items)[number]; product: PublicProduct } => !!l.product)
  const currency = lines[0]?.product.currency
  const subtotalMinor = lines.reduce((sum, l) => sum + l.product.priceMinor * l.item.quantity, 0)

  function close() {
    setStep('cart')
    onClose()
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await onCheckout({
        items: lines.map((l) => ({ productId: l.item.productId, quantity: l.item.quantity })),
        buyer: { name: name.trim(), email: email.trim() || undefined, phone: phone.trim() },
      })
      cart.clear()
      setStep('success')
    } catch (err) {
      setStep(err instanceof Error && err.message === 'payments_not_connected' ? 'gated' : 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end" role="dialog" aria-modal="true" aria-label={t.cart}>
      <button type="button" aria-label={t.close} onClick={close} className="absolute inset-0 bg-store-ink/40" />
      <div className="relative flex h-full w-full max-w-[420px] flex-col overflow-y-auto bg-store-pearl p-6">
        <div className="flex items-center justify-between">
          <p className="font-luxe text-xl">{t.cart}</p>
          <button type="button" onClick={close} aria-label={t.close} className="text-store-ink">
            <X size={18} strokeWidth={1.6} aria-hidden />
          </button>
        </div>

        {step === 'success' ? (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <p className="font-luxe text-lg">{t.orderSuccess.title}</p>
            <p className="text-sm text-[#8a8479]">{t.orderSuccess.body}</p>
          </div>
        ) : step === 'gated' ? (
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <p className="font-luxe text-lg">{t.gated.title}</p>
            <p className="text-sm text-[#8a8479]">{t.gated.body}</p>
            <button type="button" onClick={() => setStep('cart')} className="mt-2 text-xs uppercase tracking-[0.1em] underline">
              {t.continueShopping}
            </button>
          </div>
        ) : step === 'error' ? (
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-[#8a8479]">{t.orderError}</p>
            <button type="button" onClick={() => setStep('checkout')} className="text-xs uppercase tracking-[0.1em] underline">
              {t.tryAgain}
            </button>
          </div>
        ) : step === 'checkout' ? (
          <form onSubmit={submit} className="mt-6 flex flex-1 flex-col gap-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.buyerName}
              className="rounded border border-[#e9e4da] bg-white px-3 py-2.5 text-sm text-store-ink outline-none focus:border-store-gold"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.buyerEmail}
              type="email"
              className="rounded border border-[#e9e4da] bg-white px-3 py-2.5 text-sm text-store-ink outline-none focus:border-store-gold"
            />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.buyerPhone}
              className="rounded border border-[#e9e4da] bg-white px-3 py-2.5 text-sm text-store-ink outline-none focus:border-store-gold"
            />
            {currency && (
              <p className="mt-auto flex items-center justify-between text-sm">
                <span>{t.subtotal}</span>
                <span className="text-store-gold">{formatMinorUnits(subtotalMinor, currency)}</span>
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 bg-store-ink py-3 text-xs uppercase tracking-[0.16em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t.placingOrder : t.placeOrder}
            </button>
          </form>
        ) : (
          <>
            {lines.length === 0 ? (
              <p className="mt-10 text-center text-sm text-[#8a8479]">{t.empty}</p>
            ) : (
              <div className="mt-6 flex-1">
                {lines.map(({ item, product }) => (
                  <div key={item.productId} className="flex items-center gap-3 border-b border-[#e9e4da] py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-luxe text-sm">{product.name}</p>
                      <p className="text-xs text-[#8a6a2c]">{formatMinorUnits(product.priceMinor, product.currency)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => cart.setQuantity(item.productId, item.quantity - 1)} aria-label={t.decrease} className="text-store-ink">
                        <Minus size={13} strokeWidth={1.8} aria-hidden />
                      </button>
                      <span className="w-5 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => cart.setQuantity(item.productId, item.quantity + 1)} aria-label={t.increase} className="text-store-ink">
                        <Plus size={13} strokeWidth={1.8} aria-hidden />
                      </button>
                    </div>
                    <button type="button" onClick={() => cart.remove(item.productId)} aria-label={t.remove} className="text-[#8a8479] hover:text-store-ink">
                      <Trash2 size={14} strokeWidth={1.8} aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {lines.length > 0 && currency && (
              <div className="mt-4">
                <p className="flex items-center justify-between text-sm">
                  <span>{t.subtotal}</span>
                  <span className="text-store-gold">{formatMinorUnits(subtotalMinor, currency)}</span>
                </p>
                {acceptsPayments ? (
                  <button type="button" onClick={() => setStep('checkout')} className="mt-3 w-full bg-store-ink py-3 text-xs uppercase tracking-[0.16em] text-white">
                    {t.checkout}
                  </button>
                ) : (
                  <div className="mt-3 rounded border border-[#e9e4da] px-4 py-3 text-center">
                    <p className="font-luxe text-sm text-store-ink">{t.gated.title}</p>
                    <p className="mt-1 text-xs text-[#8a8479]">{t.gated.body}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
