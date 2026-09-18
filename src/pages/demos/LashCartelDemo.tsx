import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { Demo } from '../../demos/data'
import { siteCopy } from '../../demos/siteCopy'
import { useLocale } from '../../i18n/LocaleProvider'
import DemoChrome, { DemoFaqs } from './DemoChrome'
import DemoBook from './DemoBook'

export default function LashCartelDemo({ demo }: { demo: Demo }) {
  const { locale } = useLocale()
  const c = demo.copy[locale]
  const s = siteCopy.lashes[locale]
  const [slot, setSlot] = useState('')

  return (
    <DemoChrome demo={demo}>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8C9A8]/40 font-serif text-lg italic text-[#E8C9A8]">
              LC
            </span>
            <div>
              <p className="font-serif text-xl italic tracking-tight">{c.brand}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E8C9A8]/70">{s.location}</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.18em] text-white/55 lg:flex">
            <a href="#sets" className="hover:text-[#E8C9A8]">{s.navAbout}</a>
            <a href="#hours" className="hover:text-[#E8C9A8]">{s.navHours}</a>
            <a href="#book" className="rounded-full bg-[#E8C9A8] px-4 py-2 font-sans text-xs font-semibold tracking-normal text-[#14110E]">
              {c.navBook}
            </a>
          </nav>
          <a href="#book" className="rounded-full bg-[#E8C9A8] px-4 py-2 text-xs font-semibold text-[#14110E] lg:hidden">
            {c.navBook}
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 grain-overlay opacity-70" />
        <div aria-hidden className="pointer-events-none absolute -top-24 end-[-10%] h-80 w-80 rounded-full bg-[#E8C9A8]/15 blur-[90px]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#E8C9A8]">
              <Sparkles size={13} />
              {c.kind} · {s.location}
            </p>
            <h1 className="mt-5 font-serif text-[clamp(2.8rem,8vw,5.4rem)] font-medium italic leading-[0.95] text-[#F6F0E8]">
              {c.headline}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/60">{c.sub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#book" className="rounded-full bg-[#E8C9A8] px-7 py-3.5 text-sm font-semibold text-[#14110E]">
                {c.cta}
              </a>
              <a href="#sets" className="rounded-full border border-white/15 px-5 py-3.5 text-sm text-white/80 hover:border-[#E8C9A8]/50">
                {s.cardsTitle}
              </a>
            </div>
          </div>
          <div className="relative lg:col-span-6">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/10">
              <img src={demo.img} alt="" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]" />
            </div>
            <div className="absolute -bottom-5 start-6 hidden max-w-xs rounded-2xl border border-[#E8C9A8]/25 bg-[#14110E]/90 p-4 backdrop-blur-md sm:block">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#E8C9A8]">{s.mapLabel}</p>
              <p className="mt-1 text-sm text-white/75">{s.locationHint}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="sets" className="border-y border-white/10 bg-[#100E10] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#E8C9A8]">{s.cardsTitle}</p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {s.cards.map((card, i) => (
              <article key={card.title} className="bg-[#0B0A0C] p-7">
                <p className="font-mono text-[11px] text-[#E8C9A8]">{card.meta}</p>
                <h2 className="mt-3 font-serif text-3xl italic">{card.title}</h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">{card.body}</p>
                <div className="mt-6 overflow-hidden rounded-xl">
                  <img
                    src={demo.img}
                    alt=""
                    className="h-36 w-full object-cover opacity-80"
                    style={{ objectPosition: `${18 + i * 20}% 40%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="hours" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#E8C9A8]">{c.aboutTitle}</p>
          <p className="mt-4 font-serif text-3xl italic leading-snug">{c.about}</p>
          <p className="mt-6 text-sm text-white/55">{c.hours}</p>
        </div>
        <DemoFaqs title={s.faqsTitle} items={s.faqs} accent={demo.accent} dark />
      </section>

      <section id="book" className="px-5 pb-24">
        <div className="mx-auto max-w-xl rounded-[1.5rem] border border-[#E8C9A8]/25 bg-[#14110E] p-7 sm:p-9">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#E8C9A8]">{c.bookTitle}</p>
          <h2 className="mt-2 font-serif text-3xl italic">{c.bookTitle}</h2>
          <p className="mt-2 text-sm text-white/60">{c.bookBody}</p>
          <div className="mt-8">
            <DemoBook demo={demo} slot={slot} setSlot={setSlot} prefers={s.prefers} preferLabel={s.prefer} dark />
          </div>
        </div>
      </section>
    </DemoChrome>
  )
}
