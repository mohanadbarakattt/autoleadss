import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useT, useLocale } from '../../i18n/LocaleProvider'
import { toContentLocale } from '../../saas/i18n'
import { TIERS, priceForCurrency } from '../../saas/pricing'
import { resolveCurrency, setStoredCurrency, SUPPORTED_CURRENCIES } from '../../saas/currency'
import type { Currency } from '../../saas/types'

/** Flag/globe glyphs for the currency switcher below — a display convenience,
 * kept out of currency.ts (which stays UI-agnostic). Duplicated in
 * saas/pages/Pricing.tsx rather than shared — four map entries isn't worth a
 * cross-cutting UI constants module. */
const CURRENCY_FLAG: Record<Currency, string> = { USD: '🌍', AED: '🇦🇪', SAR: '🇸🇦', EGP: '🇪🇬' }

/** Teaser for the SaaS pricing page (/pricing) — the marketing homepage had no way
 * to reach it before this. Reuses the SaaS's own TIERS data so the numbers can't
 * drift between the two pages. Defaults to the visitor's stored currency choice,
 * else a timezone-based guess (see `resolveCurrency`), with the same currency
 * switcher /pricing itself uses. */
export default function PricingTeaser() {
  const t = useT()
  const { locale } = useLocale()
  const contentLocale = toContentLocale(locale)
  const tiers = TIERS.slice(0, 3)
  const [currency, setCurrencyState] = useState<Currency>(resolveCurrency)
  function chooseCurrency(c: Currency) {
    setStoredCurrency(c)
    setCurrencyState(c)
  }

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(255,92,42,0.05) 0%, transparent 60%)' }} />
      <div className="content-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
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

        <div className="grid gap-5 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.a
              key={tier.id}
              href="/pricing"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`card-hover flex flex-col rounded-2xl border bg-card p-7 ${tier.popular ? 'border-accent shadow-[0_24px_60px_-30px_rgba(255,92,42,0.5)]' : 'border-border'}`}
            >
              <p className="font-display text-lg font-bold text-foreground">{tier.name[contentLocale]}</p>
              <p className="mt-1 text-sm text-muted-fg">{tier.tagline[contentLocale]}</p>
              <p className="mt-5 font-display text-3xl font-bold text-foreground">
                {priceForCurrency(tier, currency, contentLocale)}
                <span className="text-sm font-normal text-muted-fg">{t.pricingTeaser.mo}</span>
              </p>
              <ul className="mt-5 flex flex-1 flex-col gap-2">
                {tier.features.slice(0, 3).map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={14} className="mt-0.5 shrink-0 text-accent" /> {f[contentLocale]}
                  </li>
                ))}
              </ul>
            </motion.a>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(255,92,42,0.6)]"
          >
            {t.pricingTeaser.cta}
          </a>
        </div>
      </div>
    </section>
  )
}
