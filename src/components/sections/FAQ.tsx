import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'

export default function FAQ() {
  const t = useT()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="section-padding bg-muted/60">
      <div className="content-width max-w-[860px]">
        <SectionHeading eyebrow="FAQ" title={t.faq.title} center />
        <div className="flex flex-col gap-3">
          {t.faq.items.map((item, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                className={`overflow-hidden rounded-2xl border bg-card transition-colors duration-300 ${isOpen ? 'border-accent/40 shadow-[0_12px_32px_-16px_rgba(255,92,42,0.25)]' : 'border-border hover:border-accent/25'}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                >
                  <span className="font-display font-semibold text-foreground text-[15px]">{item.q}</span>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 bg-accent text-white' : 'bg-muted text-muted-fg'}`}>
                    <Plus size={16} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                    >
                      <p className="px-6 pb-6 text-sm leading-relaxed text-muted-fg">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
