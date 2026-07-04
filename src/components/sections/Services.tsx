import { motion } from 'framer-motion'
import { Filter, PanelsTopLeft, Megaphone, Share2, Bot, Search } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'
import TiltCard from '../TiltCard'

const ICONS = [Filter, PanelsTopLeft, Megaphone, Share2, Bot, Search]

export default function Services() {
  const t = useT()

  return (
    <section id="services" className="section-padding relative overflow-hidden" style={{ background: '#0A0A0B' }}>
      {/* ambient glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 blur-3xl opacity-40 pointer-events-none"
        style={{ width: '70%', height: '40%', background: 'radial-gradient(ellipse, rgba(255,92,42,0.18) 0%, transparent 70%)' }}
      />
      <div className="content-width relative z-10">
        <SectionHeading
          dark
          eyebrow={t.services.eyebrow}
          title={t.services.titleA}
          titleAccent={t.services.titleB}
          sub={t.services.sub}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.services.items.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
                className="h-full"
              >
                <TiltCard className="group h-full rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-colors duration-300 hover:border-accent/50 hover:bg-white/[0.06]">
                  <div style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}>
                    <div className="mb-6 flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/12 border border-accent/25 transition-all duration-300 group-hover:bg-accent group-hover:shadow-[0_8px_24px_-6px_rgba(255,92,42,0.6)]"
                        style={{ background: 'rgba(255,92,42,0.12)' }}>
                        <Icon size={21} className="text-accent transition-colors duration-300 group-hover:text-white" />
                      </span>
                      <span className="eyebrow rounded-full border border-white/10 px-3 py-1 text-white/40">{item.tag}</span>
                    </div>
                    <h3 className="font-display font-semibold text-white text-xl mb-3">{item.title}</h3>
                    <p className="text-white/65 text-sm leading-relaxed">{item.body}</p>
                  </div>
                  {/* corner accent line */}
                  <span aria-hidden className="pointer-events-none absolute bottom-0 h-px w-0 bg-gradient-to-r from-accent to-transparent transition-all duration-500 group-hover:w-2/3" style={{ insetInlineStart: 0 }} />
                </TiltCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
