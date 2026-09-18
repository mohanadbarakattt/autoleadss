import { useEffect, useState } from 'react'
import { useT } from '../../i18n/LocaleProvider'
import { useEgypt } from '../../hooks/useEgypt'
import { waLink } from '../../site'

const GET_ICONS = [
  '/offer/icon-website.png',
  '/offer/icon-booking.png',
  '/offer/icon-forms.png',
  '/offer/icon-chat.png',
  '/offer/icon-domain.png',
] as const

export default function Offer() {
  const t = useT()
  const egypt = useEgypt()
  const [egp, setEgp] = useState(egypt)
  const wa = waLink(t.hero.waText)

  useEffect(() => {
    setEgp(egypt)
  }, [egypt])

  return (
    <section id="offer" className="section-padding relative overflow-hidden bg-paper">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(10,10,11,0.05) 1px, transparent 0)', backgroundSize: '22px 22px' }} />
      <div className="content-width relative z-10">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="eyebrow text-accent">{t.offer.eyebrow}</p>
            <h2
              className="mt-3 font-display font-bold"
              style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
            >
              {t.offer.title}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-fg">{t.offer.sub}</p>

            <ul className="mt-10 divide-y divide-border border-y border-border">
              {t.offer.gets.map((item, i) => (
                <li key={item.title} className="flex items-start gap-4 py-5">
                  <img
                    src={GET_ICONS[i]}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl border border-border bg-white object-cover"
                  />
                  <div className="min-w-0 pt-0.5">
                    <p className="font-display text-lg font-bold leading-tight">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-fg">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-[#EFECE4] p-7 shadow-[0_28px_70px_-40px_rgba(18,17,16,0.55)] sm:p-8">
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                {egp ? t.pricing.geoEgypt : t.pricing.geoWorld}
              </p>
              <p className="mt-2 font-serif text-[clamp(2.6rem,8vw,4.2rem)] font-medium leading-none tracking-tight text-[#121110]">
                {egp ? t.pricing.egp : t.pricing.usd}
              </p>
              <p className="mt-3 text-sm text-accent">{t.pricing.split}</p>

              <div className="mt-6 inline-flex rounded-xl border border-border bg-white/70 p-1">
                <button
                  type="button"
                  onClick={() => setEgp(true)}
                  className={`rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-wider ${
                    egp ? 'bg-[#1b3b2b] text-white' : 'text-muted-fg hover:text-foreground'
                  }`}
                >
                  {t.pricing.toggleEgypt}
                </button>
                <button
                  type="button"
                  onClick={() => setEgp(false)}
                  className={`rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-wider ${
                    !egp ? 'bg-[#1b3b2b] text-white' : 'text-muted-fg hover:text-foreground'
                  }`}
                >
                  {t.pricing.toggleWorld}
                </button>
              </div>

              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-wa px-6 py-3.5 text-sm font-medium text-white"
              >
                {t.pricing.cta}
              </a>
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-fg">{t.offer.priceNote}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
