import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'

/** Blue-ocean comparison — AutoLeadss has no direct product competitor, so this
 * compares against the two ways businesses actually try to solve this today.
 * Agency/DIY cells are hedged general industry ranges (see t.comparison.footnote),
 * never a specific competitor's claim. */
export default function Comparison() {
  const t = useT()

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
                  <td className="p-5 align-top text-muted-fg">{row.agency}</td>
                  <td className="p-5 align-top text-muted-fg">{row.diy}</td>
                  <td className="bg-accent/[0.06] p-5 align-top font-medium text-foreground">
                    <span className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                      {row.us}
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
