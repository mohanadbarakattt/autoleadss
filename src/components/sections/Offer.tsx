import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useT } from '../../i18n/LocaleProvider'
import { DEMOS } from '../../demos/data'
import SectionHeading from '../SectionHeading'
import DemoPreview from '../DemoPreview'

export default function Offer() {
  const t = useT()
  const [active, setActive] = useState(0)
  const demo = DEMOS[active]
  const item = t.offer.items[active]

  return (
    <section id="offer" className="section-padding bg-background">
      <div className="content-width">
        <SectionHeading eyebrow={t.offer.eyebrow} title={t.offer.title} sub={t.offer.sub} />
        <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div className="flex flex-col gap-2">
            {t.offer.items.map((entry, i) => {
              const selected = i === active
              return (
                <button
                  key={entry.title}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`rounded-2xl border p-5 text-start transition-colors ${
                    selected
                      ? 'border-accent/40 bg-[#0A0A0B] text-white'
                      : 'border-border bg-card hover:border-accent/30'
                  }`}
                >
                  <p className={`eyebrow ${selected ? 'text-accent' : 'text-accent/80'}`}>0{i + 1}</p>
                  <p className="mt-2 font-display text-lg font-bold">{entry.title}</p>
                  <p className={`mt-1 text-sm leading-relaxed ${selected ? 'text-white/60' : 'text-muted-fg'}`}>{entry.body}</p>
                </button>
              )
            })}
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <DemoPreview demo={demo} />
                <p className="mt-4 text-center text-xs text-muted-fg">{t.offer.previewHint}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
