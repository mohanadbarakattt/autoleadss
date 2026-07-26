import { motion } from 'framer-motion'
import { useT } from '../../i18n/LocaleProvider'

/** Card 1 — a sweeping ring standing in for "reply time", no numbers/UI. */
function ReplyVisual() {
  return (
    <div aria-hidden className="relative flex h-16 w-16 items-center justify-center">
      <span className="absolute inset-0 rounded-full border-2 border-accent/15" />
      <span className="feature-sweep absolute inset-0 rounded-full border-2 border-transparent border-t-accent" />
      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
    </div>
  )
}

/** Card 2 — two language chips that take turns pulsing, standing in for native
 * EN/AR output (no words claimed to "translate", just alternating emphasis). */
function LanguageVisual() {
  const chips = ['EN', 'AR']
  return (
    <div aria-hidden className="flex h-16 items-center justify-center gap-2.5">
      {chips.map((c, i) => (
        <span
          key={c}
          className="feature-cycle-item flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent"
          style={{ animationDelay: `${i}s` }}
        >
          {c}
        </span>
      ))}
    </div>
  )
}

/** Card 3 — three dots orbiting a hub, standing in for "every channel, one system". */
function OrbitVisual() {
  return (
    <div aria-hidden className="relative flex h-16 w-16 items-center justify-center">
      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
      <div className="feature-orbit absolute inset-0">
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-accent/70" />
        <span className="absolute left-1/2 bottom-0 h-2 w-2 -translate-x-1/2 rounded-full bg-accent/50" />
        <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent/40" />
      </div>
      <span className="absolute inset-0 rounded-full border border-dashed border-accent/20" />
    </div>
  )
}

const VISUALS = [ReplyVisual, LanguageVisual, OrbitVisual]

export default function Features() {
  const t = useT()

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="content-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <p className="eyebrow text-accent">{t.features.eyebrow}</p>
            <span className="h-px w-8 bg-accent" />
          </div>
          <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            {t.features.titleA} <span className="text-gradient-accent">{t.features.titleB}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {t.features.items.map((item, i) => {
            const Visual = VISUALS[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-hover rounded-2xl border border-border bg-card p-7"
              >
                <Visual />
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-fg">{item.body}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
