import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { trackLeadFormConversion } from '../../analytics'
import { waLink } from '../../site'
import HeroStage from '../HeroStage'

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
  const { localePath } = useLocale()
  const wa = waLink(t.hero.waText)
  const loop = [...t.hero.marquee, ...t.hero.marquee]
  const cafeName = t.examples.items[0].name

  return (
    <section className="relative overflow-hidden" style={{ background: '#0A0A0B' }}>
      <div aria-hidden className="absolute inset-0">
        <div className="grain-overlay absolute inset-0 opacity-80" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 70% 40%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 70% 40%, black 20%, transparent 75%)',
          }}
        />
        <div
          className="absolute -top-40 blur-3xl opacity-55"
          style={{
            insetInlineEnd: '-8%',
            width: '55%',
            height: '70%',
            background: 'radial-gradient(circle, rgba(255,92,42,0.38) 0%, rgba(255,92,42,0.06) 50%, transparent 75%)',
          }}
        />
        <div
          className="absolute bottom-0 start-0 h-64 w-64 blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(30,126,72,0.35) 0%, transparent 70%)' }}
        />
      </div>

      <div className="content-width relative z-10 grid items-center gap-12 pb-20 pt-32 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pb-16 lg:pt-36">
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
            <span className="font-serif font-normal italic text-[#fe8c58]">{t.hero.titleB}</span>
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

          <motion.div custom={0.24} variants={fadeUp} initial="hidden" animate="show" className="mt-8 flex flex-row flex-wrap items-center gap-2 sm:mt-10 sm:gap-3">
            <motion.a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackLeadFormConversion}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-full bg-wa px-5 py-3.5 text-sm font-medium text-white shadow-[0_12px_36px_-8px_rgba(30,126,72,0.45)] sm:px-8 sm:py-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              {t.hero.cta}
            </motion.a>
            <Link
              to={localePath('/demo/cafe')}
              className="inline-flex items-center rounded-full border border-white/20 px-5 py-3.5 text-sm font-medium text-white/85 hover:border-white/40 hover:text-white sm:px-6 sm:py-4"
            >
              {t.hero.openDemo}
              <span className="hidden sm:inline"> · {cafeName}</span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <HeroStage />
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
