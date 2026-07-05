import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'
import WhatsAppChat from '../mockups/WhatsAppChat'
import LandingPreview from '../mockups/LandingPreview'
import GoogleAd from '../mockups/GoogleAd'
import SocialGrid from '../mockups/SocialGrid'

const VISUALS = [<WhatsAppChat />, <LandingPreview />, <GoogleAd />, <SocialGrid />]

export default function Services() {
  const t = useT()

  return (
    <section id="services" className="relative overflow-hidden bg-background py-24">
      {/* soft textured backdrop */}
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,92,42,0.06) 0%, transparent 60%)' }} />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(rgba(10,10,11,0.05) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(180deg, black, transparent 30%)',
          WebkitMaskImage: 'linear-gradient(180deg, black, transparent 30%)',
        }}
      />

      <div className="content-width relative z-10">
        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <p className="eyebrow text-accent">{t.services.eyebrow}</p>
            <span className="h-px w-8 bg-accent" />
          </div>
          <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            {t.services.titleA} <span className="text-gradient-accent">{t.services.titleB}</span>
          </h2>
        </motion.div>

        {/* alternating visual demos */}
        <div className="flex flex-col gap-20 md:gap-28">
          {t.services.demos.map((demo, i) => {
            const flip = i % 2 === 1
            return (
              <div key={i} className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
                {/* visual */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                  className={`flex justify-center ${flip ? 'md:order-2' : ''}`}
                >
                  <div className="relative w-full max-w-[440px]">
                    <div aria-hidden className="absolute -inset-6 rounded-[2rem] opacity-70 blur-2xl" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,92,42,0.22), transparent 70%)' }} />
                    <div className="relative">{VISUALS[i]}</div>
                  </div>
                </motion.div>

                {/* copy */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: 0.1 }}
                  className={flip ? 'md:order-1' : ''}
                >
                  <span className="eyebrow text-accent">{demo.tag}</span>
                  <h3 className="mt-3 font-display text-3xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>{demo.title}</h3>
                  <p className="mt-3 max-w-md text-muted-fg">{demo.body}</p>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {demo.points.map((p, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm font-medium text-foreground">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12" style={{ background: 'rgba(255,92,42,0.12)' }}>
                          <Check size={12} className="text-accent" />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* supporting services strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-10"
        >
          <span className="text-sm font-medium text-muted-fg">{t.services.alsoLabel}</span>
          {t.services.also.map((a, i) => (
            <span key={i} className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {a}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
