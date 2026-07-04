import { motion } from 'framer-motion'
import { useLocale, useT } from '../../i18n/LocaleProvider'

const CAL_URL = 'https://calendar.app.google/JU1WaieYFBNYpmhN9'

export default function CTABanner() {
  const t = useT()
  const { isRTL } = useLocale()

  return (
    <section className="relative overflow-hidden py-28" style={{ background: '#0A0A0B' }}>
      {/* dot grid + glow */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50 pointer-events-none"
        style={{ width: '60%', height: '120%', background: 'radial-gradient(ellipse, rgba(255,92,42,0.3) 0%, transparent 70%)' }}
      />
      <div className="content-width relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
          className="font-display font-bold"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
        >
          <span className="block text-white">{t.cta.titleA}</span>
          <span className="block text-gradient-accent">{t.cta.titleB}</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-white/70 text-base leading-relaxed"
        >
          {t.cta.sub}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(255,92,42,0.6)] hover:-translate-y-0.5"
          >
            {t.cta.book}
            <span className={`transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
              {isRTL ? '←' : '→'}
            </span>
          </a>
          <a
            href="https://wa.me/201100054278"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-sm font-medium text-white/90 transition-all duration-300 hover:border-white/60 hover:bg-white/5"
          >
            {t.cta.whatsapp}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
