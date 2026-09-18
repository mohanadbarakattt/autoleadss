import { useState } from 'react'
import type { Demo } from '../../demos/data'
import { siteCopy } from '../../demos/siteCopy'
import { useLocale } from '../../i18n/LocaleProvider'
import DemoChrome, { DemoFaqs } from './DemoChrome'
import DemoBook from './DemoBook'

export default function DentistDemo({ demo }: { demo: Demo }) {
  const { locale } = useLocale()
  const c = demo.copy[locale]
  const s = siteCopy.dentist[locale]
  const [slot, setSlot] = useState('')

  return (
    <DemoChrome demo={demo}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold text-white" style={{ background: demo.accent }}>
            N
          </span>
          <p className="text-sm font-semibold tracking-tight">{c.brand}</p>
        </div>
        <nav className="hidden items-center gap-6 text-sm lg:flex">
          <a href="#care" className="opacity-70 hover:opacity-100">{s.navAbout}</a>
          <a href="#hours" className="opacity-70 hover:opacity-100">{s.navHours}</a>
          <a href="#book" className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: demo.accent }}>
            {c.navBook}
          </a>
        </nav>
        <a href="#book" className="rounded-full px-4 py-2 text-xs font-semibold text-white lg:hidden" style={{ background: demo.accent }}>
          {c.navBook}
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl items-stretch gap-8 px-5 pb-16 xl:grid-cols-12">
        <div className="relative min-w-0 overflow-hidden rounded-[1.4rem] xl:col-span-6">
          <img src={demo.img} alt="" className="h-full min-h-[280px] w-full object-cover sm:min-h-[360px]" />
        </div>
        <div className="flex min-w-0 flex-col justify-center xl:col-span-6 xl:ps-6">
          <p className="eyebrow" style={{ color: demo.accent }}>{c.kind} · {s.location}</p>
          <h1 className="mt-4 text-balance font-display text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.08]">{c.headline}</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed opacity-75">{c.sub}</p>
          <div className="mt-8 flex gap-6 border-t border-black/10 pt-6">
            <div>
              <p className="font-serif text-3xl" style={{ color: demo.accent }}>{s.cards[0].meta}</p>
              <p className="mt-1 text-xs opacity-60">{s.cards[0].title}</p>
            </div>
            <p className="max-w-xs text-sm leading-relaxed opacity-70">{s.locationHint}</p>
          </div>
          <a href="#book" className="mt-8 inline-flex w-fit rounded-full px-7 py-3.5 text-sm font-semibold text-white" style={{ background: demo.accent }}>
            {c.cta}
          </a>
        </div>
      </section>

      <section id="care" className="bg-white/70 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <p className="eyebrow" style={{ color: demo.accent }}>{s.cardsTitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {s.cards.map(card => (
              <article key={card.title} className="rounded-2xl border border-black/[0.06] bg-white p-6">
                <p className="font-mono text-[11px]" style={{ color: demo.accent }}>{card.meta}</p>
                <h2 className="mt-3 font-display text-xl font-bold">{card.title}</h2>
                <p className="mt-2 text-sm leading-relaxed opacity-70">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="hours" className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow" style={{ color: demo.accent }}>{c.aboutTitle}</p>
          <p className="mt-3 text-lg leading-relaxed">{c.about}</p>
          <p className="mt-6 text-sm opacity-70">{c.hours}</p>
        </div>
        <DemoFaqs title={s.faqsTitle} items={s.faqs} accent={demo.accent} />
      </section>

      <section id="book" className="px-5 pb-24">
        <div className="mx-auto max-w-xl rounded-[1.4rem] border border-black/10 bg-white p-7 sm:p-9">
          <p className="eyebrow" style={{ color: demo.accent }}>{c.bookTitle}</p>
          <h2 className="mt-2 font-display text-2xl font-bold">{c.bookTitle}</h2>
          <p className="mt-2 text-sm opacity-70">{c.bookBody}</p>
          <div className="mt-8">
            <DemoBook demo={demo} slot={slot} setSlot={setSlot} prefers={s.prefers} preferLabel={s.prefer} />
          </div>
        </div>
      </section>
    </DemoChrome>
  )
}
