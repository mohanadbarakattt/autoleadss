import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'
import { useCountUp } from '../../hooks/useCountUp'

const COUNT_TARGETS = [12, 0, 15, 0] // stats with suffix animate to these values

function Stat({ stat, index }: { stat: { suffix?: string; staticVal?: string; label: string }; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const count = useCountUp(inView ? COUNT_TARGETS[index] : 0, 1400)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition-colors duration-300 hover:border-accent/40"
    >
      <div
        aria-hidden
        className="absolute -top-10 -end-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'rgba(255,92,42,0.25)' }}
      />
      <p className="font-display font-bold text-gradient-accent" style={{ fontSize: 'clamp(2.6rem, 4.5vw, 3.6rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {stat.staticVal ?? (
          <>
            {count}
            <span style={{ fontSize: '0.45em' }}>{stat.suffix}</span>
          </>
        )}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-white/65">{stat.label}</p>
    </motion.div>
  )
}

export default function Results() {
  const t = useT()

  return (
    <section className="section-padding relative overflow-hidden" style={{ background: '#0A0A0B' }}>
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="content-width relative z-10">
        <SectionHeading dark eyebrow={t.results.eyebrow} title={t.results.title} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.results.stats.map((s, i) => (
            <Stat key={i} stat={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
