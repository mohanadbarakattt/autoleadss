import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'
import TiltCard from '../TiltCard'
import imgDashboard from '../../assets/dashboard.jpg'
import imgLeads from '../../assets/leads-flowing.jpg'
import imgChatbot from '../../assets/chatbot-action.jpg'
import imgLanding from '../../assets/landing-pages.jpg'
import imgSocial from '../../assets/social-content.jpg'
import imgAds from '../../assets/ads-management.jpg'

const CAL_URL = 'https://calendar.app.google/JU1WaieYFBNYpmhN9'
const CASE_IMAGES = [imgDashboard, imgLeads, imgChatbot, imgLanding, imgSocial, imgAds]

export default function Work() {
  const t = useT()
  const { isRTL } = useLocale()

  return (
    <section id="work" className="section-padding bg-background relative overflow-hidden">
      <div className="content-width">
        <SectionHeading eyebrow={t.work.eyebrow} title={t.work.title} sub={t.work.confidentiality} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.work.cases.map((c, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
              className="h-full"
            >
              <TiltCard intensity={7} className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-accent/50">
                <div className="flex h-full flex-col" style={{ transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }}>
                  {/* header band */}
                  <div className="relative overflow-hidden px-7 pt-7 pb-6" style={{ background: '#0A0A0B' }}>
                    <img
                      src={CASE_IMAGES[i]}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-[0.18] transition-all duration-500 group-hover:opacity-30 group-hover:scale-105"
                    />
                    <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,11,0.5) 0%, rgba(10,10,11,0.85) 100%)' }} />
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-70"
                      style={{ background: 'radial-gradient(circle at 80% 0%, rgba(255,92,42,0.35) 0%, transparent 60%)' }}
                    />
                    <span className="relative inline-block rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-wider text-white/60">
                      {c.industry}
                    </span>
                    <p className="relative mt-4 font-display font-bold leading-none text-gradient-accent" style={{ fontSize: 'clamp(2.4rem, 4vw, 3.2rem)', letterSpacing: '-0.03em' }}>
                      {c.big}
                    </p>
                    <p className="relative mt-2 text-white/70 text-sm">{c.label}</p>
                  </div>

                  {/* body */}
                  <div className="flex flex-1 flex-col gap-5 p-7">
                    <div>
                      <p className="eyebrow mb-2 text-muted-fg">{t.work.challengeLabel}</p>
                      <p className="text-foreground/85 text-sm leading-relaxed">{c.challenge}</p>
                    </div>
                    <div>
                      <p className="eyebrow mb-2 text-accent">{t.work.changedLabel}</p>
                      <p className="text-foreground/85 text-sm leading-relaxed">{c.changed}</p>
                    </div>
                    <ul className="mt-auto flex flex-col gap-2.5 border-t border-border pt-5">
                      {c.metrics.map((m, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-foreground">
                          <TrendingUp size={14} className="mt-0.5 shrink-0 text-accent" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </motion.article>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-xs text-muted-fg">{t.work.footnote}</p>

        <div className="mt-10 flex flex-col items-center gap-5">
          <p className="text-lg font-medium text-foreground">{t.work.ctaText}</p>
          <a
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(255,92,42,0.6)] hover:-translate-y-0.5"
          >
            {t.work.ctaBtn}
            <span className={`transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
              {isRTL ? '←' : '→'}
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
