import { motion } from 'framer-motion'
import { Star, TrendingUp } from 'lucide-react'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import imgLanding from '../../assets/landing-pages.jpg'
import imgSocial from '../../assets/social-content.jpg'
import imgAds from '../../assets/ads-management.jpg'

const CAL_URL = 'https://calendar.app.google/JU1WaieYFBNYpmhN9'
const IMAGES = [imgLanding, imgSocial, imgAds]

export default function Work() {
  const t = useT()
  const { isRTL } = useLocale()

  return (
    <section id="work" className="relative overflow-hidden bg-muted/50 py-24">
      {/* backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: 'linear-gradient(rgba(10,10,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,11,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black, transparent 75%)' }}
      />

      <div className="content-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <p className="eyebrow text-accent">{t.work.eyebrow}</p>
            <span className="h-px w-8 bg-accent" />
          </div>
          <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            {t.work.title}
          </h2>
          <p className="mt-3 text-sm text-muted-fg">{t.work.confidentiality}</p>
        </motion.div>

        <div className="flex flex-col gap-8">
          {t.work.cases.map((c, i) => {
            const flip = i % 2 === 1
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
                className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_20px_50px_-30px_rgba(10,10,11,0.25)] md:grid-cols-2"
              >
                {/* visual deliverable */}
                <div className={`relative min-h-[260px] overflow-hidden ${flip ? 'md:order-2' : ''}`} style={{ background: '#0A0A0B' }}>
                  <img src={IMAGES[i]} alt={c.imgAlt} className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 hover:scale-105" loading="lazy" />
                  <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,11,0.85), transparent 55%)' }} />
                  {/* platform chip */}
                  <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
                    {c.platform}
                  </span>
                  {/* result badge */}
                  <div className="absolute bottom-5 left-5 flex items-center gap-3">
                    <span className="font-display text-5xl font-bold leading-none text-gradient-accent" style={{ letterSpacing: '-0.03em' }}>{c.big}</span>
                    <span className="max-w-[130px] text-[12px] leading-tight text-white/80">{c.label}</span>
                  </div>
                </div>

                {/* testimonial + metrics */}
                <div className={`flex flex-col justify-center gap-5 p-8 md:p-10 ${flip ? 'md:order-1' : ''}`}>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent">
                    {c.industry}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={15} className="fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-[17px] font-medium leading-relaxed text-foreground">“{c.quote}”</p>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #FF7A4D, #FF5C2A)' }}>
                      {c.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-fg">{c.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                    {c.metrics.map((m, j) => (
                      <span key={j} className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                        <TrendingUp size={12} className="text-accent" />
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>

        <div className="mt-14 flex flex-col items-center gap-5">
          <p className="text-lg font-medium text-foreground">{t.work.ctaText}</p>
          <a
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgba(255,92,42,0.6)]"
          >
            {t.work.ctaBtn}
            <span className={`transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>{isRTL ? '←' : '→'}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
