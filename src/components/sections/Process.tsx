import { motion } from 'framer-motion'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'

export default function Process() {
  const t = useT()
  return (
    <section id="process" className="section-padding" style={{ background: '#0A0A0B' }}>
      <div className="content-width">
        <SectionHeading dark eyebrow={t.process.eyebrow} title={t.process.title} />
        <div className="grid gap-5 md:grid-cols-3">
          {t.process.steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, borderColor: 'rgba(255,92,42,0.4)' }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className={`relative rounded-2xl border bg-white/[0.04] p-7 ${
                i === 1 ? 'border-accent/40' : 'border-white/10'
              }`}
            >
              <p className="eyebrow text-accent">{step.n}</p>
              <p className="mt-4 font-display text-xl font-bold text-white">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
