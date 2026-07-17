import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'

// [NEEDS-OWNER: real testimonials] — `testimonials.items` in src/i18n/translations.ts
// is intentionally empty; we don't have real client quotes/names to show yet. Flip
// this on only once real testimonials are supplied — never fill it with invented ones.
const SHOW_TESTIMONIALS = false

export default function Testimonials() {
  const t = useT()
  if (!SHOW_TESTIMONIALS || t.testimonials.items.length === 0) return null

  return (
    <section className="relative overflow-hidden bg-muted/50 py-24">
      <div className="content-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-4 max-w-2xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <p className="eyebrow text-accent">{t.testimonials.eyebrow}</p>
            <span className="h-px w-8 bg-accent" />
          </div>
          <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            {t.testimonials.title}
          </h2>
        </motion.div>
        <p className="mb-12 text-center text-sm text-muted-fg">{t.testimonials.confidentiality}</p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {t.testimonials.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-hover flex flex-col rounded-2xl border border-border bg-card p-7"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground">“{item.quote}”</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #FF7A4D, #FF5C2A)' }}
                >
                  {item.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-fg">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
