import { useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { waLink } from '../../site'
import { DEMOS } from '../../demos/data'
import DemoPreview from '../DemoPreview'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function Hero() {
  const t = useT()
  const { localePath, isRTL } = useLocale()
  const wa = waLink(t.hero.waText)
  const loop = [...t.hero.marquee, ...t.hero.marquee]
  const reduced = usePrefersReducedMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  function onMove(e: MouseEvent) {
    if (reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x: py * -2.5, y: px * 3.5 })
  }

  return (
    <section className="relative overflow-hidden" style={{ background: '#0A0A0B' }}>
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 70% 40%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 70% 40%, black 20%, transparent 75%)',
          }}
        />
        <div
          className="absolute -top-40 blur-3xl opacity-50"
          style={{
            insetInlineEnd: '-8%',
            width: '55%',
            height: '70%',
            background: 'radial-gradient(circle, rgba(255,92,42,0.32) 0%, rgba(255,92,42,0.05) 50%, transparent 75%)',
          }}
        />
        <img
          src="/life/cafe-cup.png"
          alt=""
          className="pointer-events-none absolute -bottom-16 opacity-25 blur-[1px]"
          style={{ insetInlineStart: '-6%', width: '28%', maxWidth: 340, transform: isRTL ? 'scaleX(-1)' : undefined }}
        />
      </div>

      <div className="content-width relative z-10 grid min-h-[100svh] items-center gap-12 pb-16 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="eyebrow mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-white/70"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {t.hero.eyebrow}
          </motion.p>

          <motion.h1
            custom={0.08}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="max-w-xl font-display font-bold text-white"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.4rem)', letterSpacing: '-0.04em', lineHeight: 1.02 }}
          >
            {t.hero.titleA}
            <br />
            <span className="text-gradient-accent">{t.hero.titleB}</span>
          </motion.h1>

          <motion.p
            custom={0.16}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
          >
            {t.hero.body}
          </motion.p>

          <motion.ul
            custom={0.2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-7 flex flex-wrap gap-2"
          >
            {t.hero.pills.map(pill => (
              <li key={pill} className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/70">
                {pill}
              </li>
            ))}
          </motion.ul>

          <motion.div custom={0.24} variants={fadeUp} initial="hidden" animate="show" className="mt-10 flex flex-wrap items-center gap-4">
            <motion.a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-sm font-medium text-white shadow-[0_12px_36px_-8px_rgba(37,211,102,0.45)]"
            >
              <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M16.003 3C9.374 3 4 8.373 4 15c0 2.385.69 4.61 1.882 6.49L4 29l7.7-1.84A12 12 0 0 0 16.003 27C22.633 27 28 21.626 28 15S22.633 3 16.003 3Zm0 21.6c-1.94 0-3.83-.52-5.48-1.5l-.39-.23-4.57 1.09 1.12-4.45-.25-.41A9.6 9.6 0 1 1 25.6 15c0 5.293-4.31 9.6-9.597 9.6Z" />
              </svg>
              {t.hero.cta}
            </motion.a>
            <p className="text-xs text-white/40">{t.hero.proof}</p>
          </motion.div>
        </div>

        <motion.div
          ref={wrap}
          onMouseMove={onMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0, rotateX: tilt.x, rotateY: tilt.y }}
          transition={{ rotateX: { type: 'spring', stiffness: 90, damping: 22 }, rotateY: { type: 'spring', stiffness: 90, damping: 22 }, opacity: { duration: 0.8, delay: 0.2 } }}
          className="grid grid-cols-2 gap-3 touch-manipulation"
          style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
        >
          {DEMOS.map((demo, i) => (
            <Link
              key={demo.id}
              to={localePath(`/demo/${demo.id}`)}
              className={i % 2 === 1 ? 'mt-6' : ''}
            >
              <DemoPreview demo={demo} compact />
            </Link>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 border-t border-white/10 py-4">
        <div className="marquee-wrap overflow-hidden">
          <div className="marquee-track flex w-max gap-10 px-6">
            {loop.map((item, i) => (
              <span key={`${item}-${i}`} className="flex items-center gap-10 text-xs uppercase tracking-[0.18em] text-white/35">
                {item}
                <span className="h-1 w-1 rounded-full bg-accent" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
