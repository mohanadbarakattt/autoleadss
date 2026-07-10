import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, type Variants } from 'framer-motion'
import { useLocale, useT } from '../../i18n/LocaleProvider'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const CAL_URL = 'https://calendar.app.google/JU1WaieYFBNYpmhN9'

/** Sparkline path for the mock dashboard */
const SPARK = 'M0 36 L14 30 L28 33 L42 24 L56 27 L70 18 L84 21 L98 12 L112 15 L126 6'

export default function Hero() {
  const t = useT()
  const { locale, isRTL } = useLocale()
  const isAr = locale === 'ar'
  const reduced = useReducedMotion()

  // Mouse parallax for the 3D composition
  const sceneRef = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 120, damping: 20 })
  const rotX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 120, damping: 20 })

  function onMove(e: React.MouseEvent) {
    if (reduced || !sceneRef.current) return
    const r = sceneRef.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }

  const titleLines = isAr
    ? [{ t: 'توقّف عن مطاردة العملاء.', c: 'white' }, { t: 'ابدأ في استقبالهم.', c: 'accent' }]
    : [{ t: 'Stop chasing customers.', c: 'white' }, { t: 'Start receiving them.', c: 'accent' }]

  const marqueeItems = [...t.hero.marquee, ...t.hero.marquee]

  return (
    <section className="relative overflow-hidden" style={{ background: '#0A0A0B' }}>
      {/* ambient background */}
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 60% 40%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 60% 40%, black 20%, transparent 75%)',
          }}
        />
        <div
          className="absolute -top-40 blur-3xl opacity-50"
          style={{
            insetInlineEnd: '-10%',
            width: '60%',
            height: '70%',
            background: 'radial-gradient(circle, rgba(255,92,42,0.35) 0%, rgba(255,92,42,0.06) 50%, transparent 75%)',
          }}
        />
        <div
          className="absolute bottom-0 blur-3xl opacity-30"
          style={{
            insetInlineStart: '-15%',
            width: '50%',
            height: '55%',
            background: 'radial-gradient(circle, rgba(255,138,92,0.22) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="content-width relative z-10 min-h-screen flex flex-col justify-center pt-32 pb-10 md:pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-[54fr_46fr] gap-14 lg:gap-8 items-center flex-1">
          {/* ── Copy ── */}
          <div className="flex flex-col gap-7">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="eyebrow text-white/70">{t.hero.eyebrow}</span>
            </motion.div>

            <motion.h1 custom={0.1} variants={fadeUp} initial="hidden" animate="show"
              className="font-display"
              style={{ fontSize: 'clamp(2.9rem, 6vw, 5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.02 }}>
              {titleLines.map((l, i) => (
                <span key={i} className={`block ${l.c === 'accent' ? 'text-gradient-accent' : ''}`}
                  style={l.c === 'accent' ? undefined : { color: '#FAFAF7' }}>
                  {l.t}
                </span>
              ))}
            </motion.h1>

            <motion.p custom={0.2} variants={fadeUp} initial="hidden" animate="show"
              className="text-white/80 max-w-lg" style={{ fontSize: '17px', lineHeight: 1.65 }}>
              {t.hero.sub}
            </motion.p>

            <motion.div custom={0.32} variants={fadeUp} initial="hidden" animate="show"
              className="flex flex-col sm:flex-row gap-3">
              <a href={CAL_URL} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-accent text-white font-medium px-8 py-4 rounded-full text-sm transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(255,92,42,0.6)] hover:-translate-y-0.5">
                {t.hero.ctaBook}
                <span className={`transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
                  {isRTL ? '←' : '→'}
                </span>
              </a>
              <a href="#work"
                className="inline-flex items-center justify-center border border-white/25 text-white/90 font-medium px-8 py-4 rounded-full text-sm transition-all duration-300 hover:border-white/60 hover:bg-white/5">
                {t.hero.ctaWork}
              </a>
            </motion.div>

            <motion.p custom={0.45} variants={fadeUp} initial="hidden" animate="show"
              className="text-white/45 text-xs">
              {t.hero.serving}
            </motion.p>
          </div>

          {/* ── 3D dashboard composition ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className="hidden lg:block"
          >
            <div
              ref={sceneRef}
              onMouseMove={onMove}
              className="relative mx-auto w-full max-w-[520px] aspect-[10/11]"
              style={{ perspective: 1200 }}
            >
              {/* orbit ring */}
              <div aria-hidden className="absolute inset-4 spin-slow rounded-full border border-dashed border-white/10" />

              <motion.div
                style={{ rotateX: reduced ? 0 : rotX, rotateY: reduced ? 0 : rotY, transformStyle: 'preserve-3d' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* main dashboard card */}
                <div
                  className="glass-dark relative w-[86%] rounded-3xl p-6 shadow-2xl float-slow"
                  style={{ transform: 'translateZ(40px)', boxShadow: '0 40px 90px -20px rgba(0,0,0,0.7), 0 0 60px rgba(255,92,42,0.12)' }}
                  dir="ltr"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
                    </div>
                    <span className="eyebrow text-white/40">autoleadss.com</span>
                  </div>

                  <p className="text-white/50 text-[11px] uppercase tracking-wider mb-1">{t.hero.thisWeek}</p>
                  <p className="text-white font-display font-bold text-4xl leading-none mb-4">
                    +247 <span className="text-accent text-base font-medium">{t.hero.leads}</span>
                  </p>

                  {/* sparkline */}
                  <svg viewBox="0 0 126 42" className="w-full h-16 mb-5" fill="none" aria-hidden preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="hero-spark-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#FF5C2A" stopOpacity="0.35" />
                        <stop offset="1" stopColor="#FF5C2A" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={`${SPARK} L126 42 L0 42 Z`} fill="url(#hero-spark-fill)" />
                    <path d={SPARK} stroke="#FF5C2A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="126" cy="6" r="3.5" fill="#FF5C2A" />
                  </svg>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-3.5">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider">{t.hero.convRate}</p>
                      <p className="text-white font-display font-bold text-xl mt-1">
                        4.8% <span className="text-emerald-400 text-xs font-medium">↑ 31%</span>
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-3.5">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider">{t.hero.liveCampaigns}</p>
                      <p className="text-white font-display font-bold text-xl mt-1">
                        12 <span className="text-accent text-xs font-medium">●</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* floating "new lead" chip */}
                <div
                  className="glass-dark absolute top-[4%] rounded-2xl px-4 py-3 shadow-xl float-slower"
                  style={{ transform: 'translateZ(90px)', insetInlineStart: '-2%' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-white text-xs font-medium">{t.hero.newLead}</span>
                  </div>
                  <p className="text-white/60 text-[10px] mt-0.5">{t.hero.secondsAgo}</p>
                </div>

                {/* floating WhatsApp chip */}
                <div
                  className="glass-dark absolute bottom-[6%] rounded-2xl px-4 py-3 shadow-xl float-slow"
                  style={{ transform: 'translateZ(70px)', insetInlineEnd: '-3%', animationDelay: '1.2s' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: '#25D366' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="white" aria-hidden>
                        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.1-1.7 1.2-.4 0-1 .1-1.6-.1a13 13 0 0 1-1.5-.5 11.6 11.6 0 0 1-4.4-3.9 5 5 0 0 1-1-2.7c0-1.3.7-2 1-2.2a1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c0 .2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6a8.8 8.8 0 0 0 1.6 2 8 8 0 0 0 2.3 1.4c.3.2.5.1.6 0l1-1.1c.2-.3.4-.2.6-.1l2 .9c.2.1.4.2.4.3 0 .2 0 .7-.1 1.3Z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-white text-xs font-medium">WhatsApp</p>
                      <p className="text-white/60 text-[10px]">{isAr ? 'ردّ تلقائي · 12 ث' : 'Auto-reply · 12s'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-white/80 text-xs">
                {t.hero.respBadge}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── services marquee ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-16 border-t border-white/10 pt-6 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
          }}
        >
          <div className="marquee-track flex w-max items-center gap-10">
            {marqueeItems.map((item, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap text-white/40 text-sm font-medium">
                {item}
                <span className="h-1 w-1 rounded-full bg-accent/60" />
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
