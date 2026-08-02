import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useT, useLocale } from '../../i18n/LocaleProvider'
import { retainerPrice } from '../../agency/offer'
import { resolveCurrency } from '../../saas/currency'

/**
 * How this compares to the usual way of assembling the same work.
 *
 * It used to compare against "Hiring an Agency" — which stopped making sense
 * the moment AutoLeadss became one, and it still quoted the retired $59
 * self-serve price. The comparison is now against piecing the work together
 * across several people, which is the real alternative a client is weighing.
 *
 * The first two columns describe a COMMON arrangement, never a named
 * competitor's terms (see t.comparison.footnote). The AutoLeadss column states
 * deliverables only — no outcome claims (src/i18n/claims.test.ts guards that).
 *
 * `{from}` and `{adSpend}` are substituted from src/agency/offer.ts rather than
 * written into the copy, so this table can never quote a price the pricing
 * section has moved on from — which is exactly how the dead $59 survived here.
 */
export default function Comparison() {
  const t = useT()
  const { isRTL } = useLocale()
  const price = retainerPrice(resolveCurrency(), isRTL ? 'ar' : 'en')
  const fill = (v: string) => v.replace('{from}', price.amount).replace('{adSpend}', price.adSpend)

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,92,42,0.05) 0%, transparent 60%)' }} />
      <div className="content-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <p className="eyebrow text-accent">{t.comparison.eyebrow}</p>
            <span className="h-px w-8 bg-accent" />
          </div>
          <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em' }}>
            {t.comparison.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-fg">{t.comparison.sub}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
          className="overflow-x-auto rounded-2xl border border-border bg-card"
        >
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-5 text-start font-display text-sm font-semibold text-muted-fg">&nbsp;</th>
                <th className="p-5 text-start font-display text-sm font-semibold text-muted-fg">{t.comparison.columns.agency}</th>
                <th className="p-5 text-start font-display text-sm font-semibold text-muted-fg">{t.comparison.columns.diy}</th>
                <th className="rounded-t-2xl bg-accent/[0.06] p-5 text-start font-display text-sm font-bold text-accent">{t.comparison.columns.us}</th>
              </tr>
            </thead>
            <tbody>
              {t.comparison.rows.map((row, i) => (
                <tr key={i} className={i < t.comparison.rows.length - 1 ? 'border-b border-border' : ''}>
                  <td className="p-5 align-top font-display text-sm font-semibold text-foreground">{row.dimension}</td>
                  <td className="p-5 align-top text-muted-fg">{fill(row.agency)}</td>
                  <td className="p-5 align-top text-muted-fg">{fill(row.diy)}</td>
                  <td className="bg-accent/[0.06] p-5 align-top font-medium text-foreground">
                    <span className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                      {fill(row.us)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p className="mt-5 text-center text-xs text-muted-fg">{t.comparison.footnote}</p>
      </div>
    </section>
  )
}
