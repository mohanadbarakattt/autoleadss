import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, PhoneCall } from 'lucide-react'
import { useT, useLocale } from '../../i18n/LocaleProvider'
import { packagePrice } from '../../agency/offer'
import imgContent from '../../assets/brand/content-cadence.webp'
import imgAds from '../../assets/brand/ads-variants.webp'
import imgWebsite from '../../assets/brand/website-layers.webp'
import imgChatbot from '../../assets/brand/chatbot-nightlight.webp'

const CAL_URL = 'https://calendar.app.google/JU1WaieYFBNYpmhN9'

/**
 * One image per deliverable, in the SAME ORDER as t.pricingTeaser.includes
 * (content, ads, website, chatbot). Reordering the copy without reordering
 * this silently mismatches every image, so both carry a warning.
 *
 * Deliberately abstract: a generated "dashboard" would state a result the site
 * cannot source, which is the same lie src/i18n/claims.test.ts guards the copy
 * against — see docs/brand/VISUAL-SCRIPTS.md.
 *
 * Alt text is descriptive rather than empty. These are not decorative: they
 * illustrate a named service, so per Google's image guidance they get alt text
 * that explains the image in context. They sit directly beside the text they
 * relate to, which is also what that guidance asks for.
 */
const DELIVERABLES = [
  { img: imgContent, alt: 'Rows of blank content cards receding into the distance, representing a steady weekly publishing schedule' },
  { img: imgAds, alt: 'Several ad variants laid out side by side with one lit from above, representing weekly ad campaign testing' },
  { img: imgWebsite, alt: 'Translucent panels stacked in parallel layers, representing a website built and maintained in layers' },
  { img: imgChatbot, alt: 'A single warm light in a dark space, representing an AI chatbot answering enquiries overnight' },
]

/**
 * The agency package, on the marketing homepage.
 *
 * AutoLeadss is a done-for-you agency: the suite under src/saas is how the work
 * gets delivered, not something a visitor buys, so there is exactly one offer
 * here and its numbers come from src/agency/offer.ts.
 *
 * Two things are load-bearing and must not be "tidied" away:
 *   - the price is FIXED. One package, one number, no "from" — a visitor should
 *     read the price and know what they will pay. (This replaced a "from
 *     $3,500" floor on 2026-08-15.)
 *   - part of the price IS ad spend, shown next to the price rather than
 *     footnoted — whether media budget is included is the most disputed line in
 *     agency pricing, and a visitor should never have to hunt for it.
 *
 * Neither line states a RESULT. Outcome claims belong to a case study with
 * measured numbers behind it (src/i18n/claims.test.ts guards the difference).
 */
export default function PricingTeaser() {
  const t = useT()
  const { locale } = useLocale()
  const price = packagePrice()

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

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-accent bg-card shadow-[0_24px_60px_-30px_rgba(255,92,42,0.45)]"
        >
          <div className="border-b border-border px-8 py-10 text-center sm:px-12">
            <p className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(2.6rem, 6.4vw, 3.8rem)', letterSpacing: '-0.035em', lineHeight: 1 }}>
              {price.amount}
              <span className="text-[0.3em] font-medium text-muted-fg">{t.pricingTeaser.mo}</span>
            </p>
            {/* Ad spend sits WITH the price, never in a footnote. */}
            <p className="mt-3 text-sm font-medium text-accent">
              {t.pricingTeaser.adSpendNote.replace('{adSpend}', price.adSpend)}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-muted-fg">{t.pricingTeaser.priceNote}</p>
          </div>

          <div className="px-8 py-8 sm:px-12">
            <p className="mb-5 text-sm font-semibold text-foreground">{t.pricingTeaser.includesTitle}</p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {t.pricingTeaser.includes.map((line, i) => (
                <li key={line} className="overflow-hidden rounded-2xl border border-border bg-background">
                  <img
                    src={DELIVERABLES[i]?.img}
                    alt={DELIVERABLES[i]?.alt ?? ''}
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

            {/* The free 30-minute call is the actual first step, so it gets its
                own block rather than living inside the feature list. */}
            <div className="mt-8 rounded-2xl border border-border bg-background p-6 text-center">
              <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <PhoneCall size={18} className="text-accent" />
              </span>
              <p className="text-base font-semibold text-foreground">{t.pricingTeaser.consultTitle}</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-fg">{t.pricingTeaser.consultSub}</p>
            </div>

            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(255,92,42,0.6)]"
            >
              {t.pricingTeaser.cta}
            </a>

            {/* The call is the default first step, but a visitor who has already
                made up their mind should not be forced through it. */}
            <Link
              to={`/${locale}/start`}
              className="mt-4 flex w-full items-center justify-center text-sm font-semibold text-accent transition-opacity hover:opacity-75"
            >
              {t.pricingTeaser.startCta}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
