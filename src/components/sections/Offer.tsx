import { useT } from '../../i18n/LocaleProvider'
import PriceCard from '../PriceCard'

const GET_ICONS = [
  '/offer/icon-website.png',
  '/offer/icon-booking.png',
  '/offer/icon-forms.png',
  '/offer/icon-chat.png',
  '/offer/icon-domain.png',
] as const

export default function Offer() {
  const t = useT()

  return (
    <section id="offer" className="section-padding relative overflow-hidden bg-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundImage: 'radial-gradient(rgba(10,10,11,0.05) 1px, transparent 0)', backgroundSize: '22px 22px' }}
      />
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

            <ol className="mt-10 divide-y divide-border border-y border-border">
              {t.offer.gets.map((item, i) => (
                <li key={item.title} className="flex items-start gap-4 py-5">
                  <span className="mt-1 hidden font-mono text-[11px] uppercase tracking-wider text-accent sm:block">
                    0{i + 1}
                  </span>
                  <img
                    src={GET_ICONS[i]}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl border border-border bg-white object-cover"
                  />
                  <div className="min-w-0 pt-0.5">
                    <p className="font-display text-lg font-bold leading-tight">
                      <span className="me-2 font-mono text-[11px] uppercase tracking-wider text-accent sm:hidden">0{i + 1}</span>
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-fg">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">{t.offer.chip}</p>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-fg">{t.offer.craft}</p>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <PriceCard id="pricing" />
          </aside>
        </div>
      </div>
    </section>
  )
}
