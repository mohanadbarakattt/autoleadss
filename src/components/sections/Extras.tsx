import { motion } from 'framer-motion'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'

const IMAGES = ['/life/booking.png', '/demos/agency.png', '/life/cafe-cup.png'] as const

export default function Extras() {
  const t = useT()
  return (
    <section id="extras" className="section-padding bg-background">
      <div className="content-width">
        <SectionHeading eyebrow={t.extras.eyebrow} title={t.extras.title} sub={t.extras.sub} />
        <div className="grid gap-5 md:grid-cols-3">
          {t.extras.items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, borderColor: 'rgba(255,92,42,0.45)' }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={IMAGES[i]} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <p className="eyebrow text-accent">0{i + 1}</p>
                <p className="mt-3 font-display text-lg font-bold">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-fg">{item.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
