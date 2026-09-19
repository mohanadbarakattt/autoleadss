import { useEffect, useState } from 'react'
import { useT } from '../i18n/LocaleProvider'
import { useEgypt } from '../hooks/useEgypt'
import { mailLink, waLink } from '../site'

export default function PriceCard({ id }: { id?: string }) {
  const t = useT()
  const egypt = useEgypt()
  const [egp, setEgp] = useState(egypt)
  const wa = waLink(t.hero.waText)
  const mail = mailLink(t.hero.waText, t.hero.mailSubject)

  useEffect(() => {
    setEgp(egypt)
  }, [egypt])

  return (
    <div
      id={id}
      className="rounded-2xl border border-border bg-[#EFECE4] p-7 shadow-[0_28px_70px_-40px_rgba(18,17,16,0.55)] sm:p-8"
    >
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
      <a
        href={mail}
        className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#1b3b2b]/20 bg-white px-6 py-3 text-sm font-medium text-[#121110] hover:border-[#1b3b2b]/40"
      >
        {t.pricing.mailCta}
      </a>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted-fg">{t.offer.priceNote}</p>
      <p className="mt-2 text-center text-[11px] text-[#1E7E48]">{t.pricing.waFooter}</p>
    </div>
  )
}
