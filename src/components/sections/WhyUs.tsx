import { motion } from 'framer-motion'
import { MapPinned, KeyRound, Handshake, ShieldCheck } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'

const ICONS = [MapPinned, KeyRound, Handshake, ShieldCheck]

export default function WhyUs() {
  const t = useT()

  return (
    <section id="why" className="relative overflow-hidden bg-background py-24">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(255,92,42,0.05) 0%, transparent 60%)' }} />
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
            <p className="eyebrow text-accent">{t.why.eyebrow}</p>
            <span className="h-px w-8 bg-accent" />
          </div>
          <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em' }}>
            {t.why.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.items.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex flex-col items-center text-center lg:items-start lg:text-start"
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:-translate-y-1" style={{ background: 'rgba(255,92,42,0.1)' }}>
                  <Icon size={20} className="text-accent" />
                </span>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-fg">{item.body}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
