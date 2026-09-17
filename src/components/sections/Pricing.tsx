import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useT } from '../../i18n/LocaleProvider'
import { useEgypt } from '../../hooks/useEgypt'
import { waLink } from '../../site'

export default function Pricing() {
  const t = useT()
  const egypt = useEgypt()
  const [egp, setEgp] = useState(egypt)
  const wa = waLink(t.hero.waText)

  useEffect(() => {
    setEgp(egypt)
  }, [egypt])

  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="content-width">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[28px] border border-white/10"
          style={{ background: '#0A0A0B' }}
        >
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 sm:p-12">
              <p className="eyebrow text-accent">{t.pricing.eyebrow}</p>
              <h2
                className="mt-4 font-display font-bold text-white"
                style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
              >
                {t.pricing.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">{t.pricing.sub}</p>

              <p className="mt-8 text-[11px] uppercase tracking-[0.14em] text-white/40">
                {egp ? t.pricing.geoEgypt : t.pricing.geoWorld}
              </p>
              <div className="relative mt-3 h-[clamp(4rem,8vw,6.2rem)] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={egp ? 'egp' : 'usd'}
                    initial={{ y: 28, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -28, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="absolute inset-x-0 top-0 font-display font-bold leading-none text-white"
                    style={{ fontSize: 'clamp(2.6rem, 6vw, 4.4rem)', letterSpacing: '-0.04em', paddingBottom: '0.2em' }}
                  >
                    {egp ? t.pricing.egp : t.pricing.usd}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="mt-3 text-sm text-accent">{t.pricing.split}</p>
              <button
                type="button"
                onClick={() => setEgp(v => !v)}
                className="mt-3 text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
              >
                {egp ? t.pricing.seeUsd : t.pricing.seeEgp}
              </button>

              <motion.a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 inline-flex rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white"
              >
                {t.pricing.cta}
              </motion.a>
            </div>

            <div className="flex flex-col justify-center gap-6 border-t border-white/10 p-8 sm:p-12 lg:border-s lg:border-t-0">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/40">{t.pricing.packTitle}</p>
                <ul className="mt-4 space-y-3">
                  {t.pricing.pack.map(item => (
                    <li key={item.title} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>
                        <span className="block text-sm font-medium text-white">{item.title}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-white/55">{item.body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: t.pricing.egyptTitle, body: t.pricing.egyptPay },
                  { title: t.pricing.otherTitle, body: t.pricing.otherPay },
                ].map(block => (
                  <div key={block.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">{block.title}</p>
                    <p className="mt-1.5 text-sm text-white/80">{block.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
