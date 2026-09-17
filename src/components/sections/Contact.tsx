import { motion } from 'framer-motion'
import { useT } from '../../i18n/LocaleProvider'
import { waLink } from '../../site'

export default function Contact() {
  const t = useT()
  const wa = waLink(t.hero.waText)
  return (
    <section id="contact" className="section-padding bg-background">
      <div className="content-width max-w-2xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="eyebrow text-accent"
        >
          {t.cta.eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 font-display font-bold"
          style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em' }}
        >
          {t.cta.title}
        </motion.h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-fg">{t.cta.body}</p>
        <motion.a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-sm font-medium text-white shadow-[0_12px_36px_-8px_rgba(37,211,102,0.45)]"
        >
          {t.cta.button}
        </motion.a>
      </div>
    </section>
  )
}
