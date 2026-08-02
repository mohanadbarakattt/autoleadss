import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useT, useLocale } from '../../i18n/LocaleProvider'
import { retainerPrice } from '../../agency/offer'
import { resolveCurrency, setStoredCurrency, SUPPORTED_CURRENCIES } from '../../saas/currency'
import type { Currency } from '../../saas/types'
import imgContent from '../../assets/brand/content-cadence.webp'
import imgAds from '../../assets/brand/ads-variants.webp'
import imgWebsite from '../../assets/brand/website-layers.webp'
import imgChatbot from '../../assets/brand/chatbot-nightlight.webp'

const CAL_URL = 'https://calendar.app.google/JU1WaieYFBNYpmhN9'

/** Flag/globe glyphs for the currency switcher — a display convenience, kept
 * out of currency.ts (which stays UI-agnostic). */
const CURRENCY_FLAG: Record<Currency, string> = { USD: '🌍', AED: '🇦🇪', SAR: '🇸🇦', EGP: '🇪🇬' }

/** One image per retainer deliverable, in the same order as
 * t.pricingTeaser.includes. Deliberately abstract: a generated "dashboard"
 * would state a result the site cannot source, which is the same lie
 * src/i18n/claims.test.ts guards the copy against — see
 * docs/brand/VISUAL-SCRIPTS.md. */
const DELIVERABLE_IMAGES = [imgContent, imgAds, imgWebsite, imgChatbot]

/**
 * The agency retainer, on the marketing homepage.
 *
 * This used to render the self-serve SaaS tiers ($59/$149/$349). AutoLeadss is
 * a done-for-you agency now: the suite under src/saas is how the work gets
 * delivered, not something a visitor buys, so there is exactly one offer here
 * and its numbers come from src/agency/offer.ts.
 *
 * Two things are load-bearing and must not be "tidied" away:
 *   - the price is a FLOOR ("from"), because scope varies per client;
 *   - part of the retainer IS ad spend, shown next to the price rather than
 *     footnoted — whether media budget is included is the most disputed line in
 *     agency pricing, and a visitor should never have to hunt for it.
 *
 * Neither line states a RESULT. Outcome claims belong to a case study with
 * measured numbers behind it (src/i18n/claims.test.ts guards the difference).
 */
export default function PricingTeaser() {
  const t = useT()
  const { isRTL } = useLocale()
  const [currency, setCurrencyState] = useState<Currency>(resolveCurrency)
  const price = retainerPrice(currency, isRTL ? 'ar' : 'en')

  function chooseCurrency(c: Currency) {
    setStoredCurrency(c)
    setCurrencyState(c)
  }

  return (
    <section id="pricing" className="relative overflow-hidden bg-background py-24">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(255,92,42,0.05) 0%, transparent 60%)' }} />
      <div className="content-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <p className="eyebrow text-accent">{t.pricingTeaser.eyebrow}</p>
            <span className="h-px w-8 bg-accent" />
          </div>
          <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em' }}>
            {t.pricingTeaser.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-fg">{t.pricingTeaser.sub}</p>

          <div role="group" aria-label="Currency" className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
            {SUPPORTED_CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => chooseCurrency(c)}
                aria-pressed={currency === c}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${currency === c ? 'bg-accent text-white' : 'text-muted-fg hover:text-foreground'}`}
              >
                {CURRENCY_FLAG[c]} {c}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-accent bg-card shadow-[0_24px_60px_-30px_rgba(255,92,42,0.45)]"
        >
          <div className="border-b border-border px-8 py-10 text-center sm:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-fg">{t.pricingTeaser.from}</p>
            <p className="mt-2 font-display font-bold text-foreground" style={{ fontSize: 'clamp(2.4rem, 6vw, 3.6rem)', letterSpacing: '-0.035em', lineHeight: 1 }}>
              {price.amount}
              <span className="text-[0.3em] font-medium text-muted-fg">{t.pricingTeaser.mo}</span>
            </p>
            {/* Ad spend sits WITH the price, never in a footnote. */}
            <p className="mt-3 text-sm font-medium text-accent">
              {t.pricingTeaser.adSpendNote.replace('{adSpend}', price.adSpend)}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-muted-fg">{t.pricingTeaser.fromNote}</p>
            {price.quotedIn !== currency && (
              // EGP floats, so it is never derived — see src/agency/offer.ts.
              <p className="mt-2 text-xs text-muted-fg">{t.pricingTeaser.quotedInNote}</p>
            )}
          </div>

          <div className="px-8 py-8 sm:px-12">
            <p className="mb-5 text-sm font-semibold text-foreground">{t.pricingTeaser.includesTitle}</p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {t.pricingTeaser.includes.map((line, i) => (
                <li key={line} className="overflow-hidden rounded-2xl border border-border bg-background">
                  <img
                    src={DELIVERABLE_IMAGES[i]}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="h-24 w-full object-cover"
                  />
                  <div className="flex items-start gap-2.5 p-4">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Check size={12} className="text-accent" />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-fg">{line}</span>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(255,92,42,0.6)]"
            >
              {t.pricingTeaser.cta}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
