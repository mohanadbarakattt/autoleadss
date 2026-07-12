import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useT, useLocale } from '../../i18n/LocaleProvider'
import { toContentLocale } from '../../saas/i18n'
import { TIERS, priceFor } from '../../saas/pricing'

/** Teaser for the SaaS pricing page (/pricing) — the marketing homepage had no way
 * to reach it before this. Reuses the SaaS's own TIERS data so the numbers can't
 * drift between the two pages. Always shows Gulf ($) pricing here; the full
 * region toggle (Gulf/Egypt) lives on /pricing itself. */
export default function PricingTeaser() {
  const t = useT()
  const { locale } = useLocale()
  const contentLocale = toContentLocale(locale)
  const tiers = TIERS.slice(0, 3)

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
                {priceFor(tier, 'gulf')}
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
