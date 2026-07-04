import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'
import TiltCard from '../TiltCard'

export default function Testimonials() {
  const t = useT()

  return (
    <section id="testimonials" className="section-padding bg-muted/60 relative overflow-hidden">
      <div className="content-width">
        <SectionHeading eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} center />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.testimonials.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
              className="h-full"
            >
              <TiltCard intensity={6} glare={false} className="flex h-full flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow duration-300 hover:shadow-[0_20px_50px_-20px_rgba(10,10,11,0.2)]">
                <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <Quote size={18} className="text-accent" />
                </span>
                <p className="flex-1 text-[15px] leading-relaxed text-foreground/90">{item.quote}</p>
                <div className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/12 font-display font-bold text-accent" style={{ background: 'rgba(255,92,42,0.12)' }}>
                    {item.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-fg">{item.role}</p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
