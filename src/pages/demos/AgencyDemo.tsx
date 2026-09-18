import { useState } from 'react'
import type { Demo } from '../../demos/data'
import { siteCopy } from '../../demos/siteCopy'
import { useLocale } from '../../i18n/LocaleProvider'
import DemoChrome, { DemoFaqs } from './DemoChrome'
import DemoBook from './DemoBook'

export default function AgencyDemo({ demo }: { demo: Demo }) {
  const { locale } = useLocale()
  const c = demo.copy[locale]
  const s = siteCopy.agency[locale]
  const [slot, setSlot] = useState('')

  return (
    <DemoChrome demo={demo}>
      <header className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-center justify-between border-b pb-6" style={{ borderColor: `${demo.accent}55` }}>
          <div>
            <p className="font-serif text-2xl italic">{c.brand}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">{s.location}</p>
          </div>
          <a href="#book" className="rounded-full px-4 py-2 text-xs font-semibold text-[#141210]" style={{ background: demo.accent }}>
            {c.navBook}
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-12">
        <p className="eyebrow" style={{ color: demo.accent }}>{c.kind}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-[clamp(2.6rem,7vw,5rem)] font-medium italic leading-[1.05]">
          {c.headline}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed opacity-70">{c.sub}</p>
        <a href="#book" className="mt-8 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-[#141210]" style={{ background: demo.accent }}>
          {c.cta}
        </a>
        <div className="mt-12 overflow-hidden rounded-[1.2rem]">
          <img src={demo.img} alt="" className="aspect-[21/9] w-full object-cover" />
        </div>
      </section>

      <section id="work" className="mx-auto max-w-6xl px-5 py-8">
        <p className="eyebrow" style={{ color: demo.accent }}>{s.cardsTitle}</p>
        <div className="mt-8 grid gap-px md:grid-cols-3" style={{ background: `${demo.accent}33` }}>
          {s.cards.map((card, i) => (
            <article key={card.title} className="bg-[#141210] p-6">
              <p className="font-mono text-[11px]" style={{ color: demo.accent }}>{card.meta}</p>
              <h2 className="mt-4 font-serif text-2xl italic">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed opacity-65">{card.body}</p>
              <div className="mt-8 overflow-hidden rounded-lg">
                <img
                  src={demo.img}
                  alt=""
                  className="h-40 w-full object-cover"
                  style={{ objectPosition: `${20 + i * 30}% 50%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow" style={{ color: demo.accent }}>{c.aboutTitle}</p>
          <p className="mt-3 font-serif text-2xl italic leading-snug">{c.about}</p>
          <p className="mt-6 text-sm opacity-60">{c.hours}</p>
        </div>
        <DemoFaqs title={s.faqsTitle} items={s.faqs} accent={demo.accent} dark />
      </section>

      <section id="book" className="px-5 pb-24">
        <div className="mx-auto max-w-xl border p-7 sm:p-9" style={{ borderColor: `${demo.accent}44` }}>
          <p className="eyebrow" style={{ color: demo.accent }}>{c.bookTitle}</p>
          <h2 className="mt-2 font-serif text-3xl italic">{c.bookTitle}</h2>
          <p className="mt-2 text-sm opacity-65">{c.bookBody}</p>
          <div className="mt-8">
            <DemoBook demo={demo} slot={slot} setSlot={setSlot} prefers={s.prefers} preferLabel={s.prefer} dark />
          </div>
        </div>
      </section>
    </DemoChrome>
  )
}
