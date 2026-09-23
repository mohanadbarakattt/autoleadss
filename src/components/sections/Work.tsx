import { useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { WORK } from '../../site'
import SectionHeading from '../SectionHeading'
import SiteShot from '../SiteShot'

function wrappedOffset(i: number, active: number, n: number) {
  let d = i - active
  if (d > Math.floor(n / 2)) d -= n
  if (d < -Math.floor(n / 2)) d += n
  return d
}

export default function Work() {
  const t = useT()
  const { isRTL } = useLocale()
  const [active, setActive] = useState(0)
  const n = WORK.length
  const copy = t.work.items[active]
  const shot = WORK[active]
  const dir = isRTL ? -1 : 1

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') setActive(i => (i + (isRTL ? -1 : 1) + n) % n)
    if (e.key === 'ArrowLeft') setActive(i => (i + (isRTL ? 1 : -1) + n) % n)
  }

  return (
    <section id="work" className="section-padding relative overflow-hidden" style={{ background: '#0A0A0B' }}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[420px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,92,42,0.22) 0%, transparent 70%)' }}
      />
      <div className="content-width relative z-10">
        <SectionHeading dark eyebrow={t.work.eyebrow} title={t.work.title} sub={t.work.sub} />

        <div className="mb-14 grid gap-4 md:grid-cols-3">
          {[
            ['Live product', 'TUT', 'Travel product built and operated by the same studio.'],
            ['Live product', 'IBNI', 'Commerce tooling built for Egyptian sellers.'],
            ['Ongoing client work', 'Lash Cartel', 'Website demo plus continued UGC ad and ad-management work.'],
          ].map(([label, name, body]) => (
            <article key={name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#4ade80]">{label}</p>
              <h3 className="mt-2 font-display text-xl font-bold text-white">{name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
            </article>
          ))}
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div
            role="listbox"
            aria-label={t.nav.work}
            tabIndex={0}
            onKeyDown={onKey}
            className="relative mx-auto h-[min(58vw,420px)] outline-none sm:h-[460px] lg:h-[500px]"
            style={{ perspective: 1400 }}
          >
            {WORK.map((item, i) => {
              const offset = wrappedOffset(i, active, n)
              const front = offset === 0
              return (
                <motion.div
                  key={item.id}
                  role="option"
                  aria-selected={front}
                  className={`absolute left-1/2 top-1/2 w-[min(82%,620px)] origin-center ${front ? '' : 'pointer-events-none'}`}
                  initial={false}
                  animate={{
                    x: `calc(-50% + ${offset * 14 * dir}vw)`,
                    y: '-50%',
                    scale: front ? 1 : 0.7,
                    rotate: offset * 5 * dir,
                    zIndex: front ? 20 : 10 - Math.abs(offset),
                    opacity: front ? 1 : 0.4,
                    filter: front ? 'brightness(1)' : 'brightness(0.55)',
                  }}
                  transition={{ type: 'spring', stiffness: 220, damping: 30 }}
                >
                  <SiteShot src={item.img} url={item.url} alt={t.work.items[i].name} />
                </motion.div>
              )
            })}
          </div>

          <div className="mt-8 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className="max-w-lg"
              >
                <p className="inline-flex items-center gap-2 rounded-full bg-wa/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#4ade80]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-wa" />
                  {t.work.live}
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-white">{copy.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/40">{copy.kind}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{copy.body}</p>
                <a
                  href={shot.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  {t.work.open}
                  <ArrowUpRight size={14} />
                </a>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {WORK.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition-colors touch-manipulation ${
                    i === active ? 'bg-white text-[#0A0A0B]' : 'border border-white/15 text-white/60 hover:text-white'
                  }`}
                >
                  {t.work.items[i].name}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-white/30">{t.work.hint}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
