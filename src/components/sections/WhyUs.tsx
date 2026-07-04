import { motion } from 'framer-motion'
import { MapPinned, KeyRound, Handshake, ShieldCheck } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'

const ICONS = [MapPinned, KeyRound, Handshake, ShieldCheck]

export default function WhyUs() {
  const t = useT()

  return (
    <section id="why" className="section-padding bg-background">
      <div className="content-width">
        <SectionHeading eyebrow={t.why.eyebrow} title={t.why.title} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {t.why.items.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
                className="card-hover group flex gap-5 rounded-2xl border border-border bg-card p-7"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:bg-accent group-hover:shadow-[0_8px_20px_-6px_rgba(255,92,42,0.5)]" style={{ background: 'rgba(255,92,42,0.1)' }}>
                  <Icon size={20} className="text-accent transition-colors duration-300 group-hover:text-white" />
                </span>
                <div>
                  <h3 className="font-display font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-fg text-sm leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
