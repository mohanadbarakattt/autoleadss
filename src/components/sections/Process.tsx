import { motion } from 'framer-motion'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'

export default function Process() {
  const t = useT()

  return (
    <section id="process" className="section-padding bg-background relative overflow-hidden">
      <div className="content-width">
        <SectionHeading eyebrow={t.process.eyebrow} title={t.process.title} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.process.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
              className="card-hover group relative rounded-2xl border border-border bg-card p-7"
            >
              <div className="mb-6 flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 font-mono text-sm font-semibold text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_8px_20px_-6px_rgba(255,92,42,0.5)]">
                  0{i + 1}
                </span>
                {i < t.process.steps.length - 1 && (
                  <span aria-hidden className="hidden lg:block h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                )}
              </div>
              <h3 className="font-display font-semibold text-foreground text-lg mb-2.5">{step.title}</h3>
              <p className="text-muted-fg text-sm leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
