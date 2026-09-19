import { motion } from 'framer-motion'
import { useT } from '../../i18n/LocaleProvider'
import { mailLink, waLink } from '../../site'

export default function Contact() {
  const t = useT()
  const wa = waLink(t.hero.waText)
  const mail = mailLink(t.hero.waText, t.hero.mailSubject)
  return (
    <section id="contact" className="section-padding bg-paper">
      <div className="content-width">
        <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl bg-[#121110] px-8 py-12 text-center md:flex-row md:text-start lg:px-14">
          <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-40" />
          <div aria-hidden className="pointer-events-none absolute -end-10 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="eyebrow text-[#fe8c58]"
            >
              {t.cta.eyebrow}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-3 font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium leading-tight text-white"
            >
              {t.cta.title}
            </motion.h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/55 md:mx-0">{t.cta.body}</p>
          </div>
          <div className="relative z-10 flex w-full max-w-sm flex-col gap-3">
            <motion.a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-wa px-8 py-4 text-sm font-medium text-white shadow-[0_12px_36px_-8px_rgba(30,126,72,0.45)]"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              {t.cta.button}
            </motion.a>
            <a
              href={mail}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-white/90 hover:border-white/40"
            >
              {t.cta.mail}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
