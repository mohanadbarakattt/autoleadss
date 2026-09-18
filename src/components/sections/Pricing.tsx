import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useT } from '../../i18n/LocaleProvider'
import { useEgypt } from '../../hooks/useEgypt'
import { waLink } from '../../site'

export default function Pricing() {
  const t = useT()
  const egypt = useEgypt()
  const [egp, setEgp] = useState(egypt)
  const wa = waLink(t.hero.waText)

  useEffect(() => {
    setEgp(egypt)
  }, [egypt])

  return (
    <section id="pricing" className="section-padding bg-paper">
      <div className="content-width">
        <div className="mb-8 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-accent">{t.pricing.eyebrow}</p>
            <h2
              className="mt-3 font-display font-bold"
              style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
            >
              {t.pricing.title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-fg">{t.pricing.sub}</p>
          </div>
          <div className="inline-flex rounded-xl border border-border bg-[#EFECE4] p-1">
            <button
              type="button"
              onClick={() => setEgp(true)}
              className={`rounded-lg px-4 py-2.5 font-mono text-xs uppercase tracking-wider ${
                egp ? 'bg-[#1b3b2b] text-white' : 'text-muted-fg hover:text-foreground'
              }`}
            >
              {t.pricing.toggleEgypt}
            </button>
            <button
              type="button"
              onClick={() => setEgp(false)}
              className={`rounded-lg px-4 py-2.5 font-mono text-xs uppercase tracking-wider ${
                !egp ? 'bg-[#1b3b2b] text-white' : 'text-muted-fg hover:text-foreground'
              }`}
            >
              {t.pricing.toggleWorld}
            </button>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            className="relative overflow-hidden rounded-2xl border border-border bg-[#EFECE4] p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:col-span-7 lg:p-12"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{egp ? t.pricing.geoEgypt : t.pricing.geoWorld}</p>
            <p className="mt-3 font-serif text-[clamp(2.8rem,7vw,4.6rem)] font-medium leading-none tracking-tight text-[#121110]">
              {egp ? t.pricing.egp : t.pricing.usd}
            </p>
            <p className="mt-3 text-sm text-accent">{t.pricing.split}</p>

            <div className="mt-8 space-y-3 border-t border-black/10 pt-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#121110]">{t.pricing.packTitle}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {t.pricing.pack.map(item => (
                  <li key={item.title} className="flex gap-2.5 text-sm">
                    <span className="mt-0.5 font-mono font-bold text-wa">[✓]</span>
                    <span>
                      <span className="block font-medium text-[#121110]">{item.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-fg">{item.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl bg-white p-4 sm:flex-row sm:items-center">
              <p className="text-sm text-[#121110]">{t.pricing.split}</p>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-wa px-6 py-3 text-sm font-medium text-white"
              >
                {t.pricing.cta}
              </a>
            </div>
          </motion.div>

          <div className="space-y-5 lg:col-span-5">
            {[
              { title: t.pricing.egyptTitle, body: t.pricing.egyptPay },
              { title: t.pricing.otherTitle, body: t.pricing.otherPay },
            ].map(block => (
              <div key={block.title} className="rounded-2xl border border-border bg-card p-6">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-fg">{block.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#121110]">{block.body}</p>
              </div>
            ))}
            <div className="rounded-2xl bg-[#1b3b2b] p-6 text-[#FAFAF7]">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#abcfb8]">{t.pricing.eyebrow}</p>
              <p className="mt-2 font-display text-lg font-bold leading-snug">{t.pricing.sub}</p>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-sm text-[#fe8c58] hover:underline">
                {t.pricing.cta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
