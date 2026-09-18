import { useState } from 'react'
import type { Demo } from '../../demos/data'
import { siteCopy } from '../../demos/siteCopy'
import { useLocale } from '../../i18n/LocaleProvider'
import DemoChrome, { DemoFaqs } from './DemoChrome'
import DemoBook from './DemoBook'

export default function GymDemo({ demo }: { demo: Demo }) {
  const { locale } = useLocale()
  const c = demo.copy[locale]
  const s = siteCopy.gym[locale]
  const [slot, setSlot] = useState('')
  const [pay, setPay] = useState('')
  const [paid, setPaid] = useState(false)

  return (
    <DemoChrome demo={demo}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center font-mono text-xs font-bold text-[#0C0C0D]" style={{ background: demo.accent }}>
            F
          </span>
          <p className="font-mono text-sm uppercase tracking-[0.18em]">{c.brand}</p>
        </div>
        <a href="#book" className="rounded-none px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0C0C0D]" style={{ background: demo.accent }}>
          {c.navBook}
        </a>
      </header>

      <section className="relative min-h-[72vh] overflow-hidden">
        <img src={demo.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0D] via-[#0C0C0D]/70 to-[#0C0C0D]/25" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-5 pb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: demo.accent }}>{s.location}</p>
          <h1 className="mt-3 max-w-2xl font-display text-[clamp(2.8rem,8vw,5.6rem)] font-bold uppercase leading-[0.92] tracking-tight">
            {c.headline}
          </h1>
          <p className="mt-4 max-w-md text-base text-white/70">{c.sub}</p>
          <a href="#board" className="mt-8 inline-flex w-fit px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-[#0C0C0D]" style={{ background: demo.accent }}>
            {c.cta}
          </a>
        </div>
      </section>

      <section id="board" className="border-y border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: demo.accent }}>{c.bookTitle}</p>
            <p className="text-sm text-white/50">{c.hours}</p>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {c.slots.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setSlot(item)
                  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="border px-4 py-5 text-start"
                style={{
                  borderColor: slot === item ? demo.accent : 'rgba(255,255,255,0.12)',
                  background: slot === item ? demo.accent : 'transparent',
                  color: slot === item ? '#0C0C0D' : demo.fg,
                  touchAction: 'manipulation',
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider opacity-60">{c.slot}</p>
                <p className="mt-2 font-display text-lg font-bold leading-tight">{item}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 lg:grid-cols-3">
        {s.cards.map(card => (
          <article key={card.title} className="border border-white/10 p-6">
            <p className="font-mono text-[11px]" style={{ color: demo.accent }}>{card.meta}</p>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{card.body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-8 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: demo.accent }}>{c.aboutTitle}</p>
          <p className="mt-3 text-lg leading-relaxed text-white/80">{c.about}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: demo.accent }}>{s.payTitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {s.payOptions.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setPay(opt)}
                className="border px-3 py-2 font-mono text-[11px] uppercase"
                style={{
                  borderColor: pay === opt ? demo.accent : 'rgba(255,255,255,0.15)',
                  background: pay === opt ? demo.accent : 'transparent',
                  color: pay === opt ? '#0C0C0D' : demo.fg,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!pay || paid}
            onClick={() => setPaid(true)}
            className="mt-4 px-5 py-2.5 font-mono text-[11px] font-bold uppercase text-[#0C0C0D] disabled:opacity-40"
            style={{ background: demo.accent }}
          >
            {s.payCta}
          </button>
          {paid && <p className="mt-3 text-sm text-white/55">{s.payDone}</p>}
        </div>
      </section>

      <section id="book" className="px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12">
          <div className="border border-white/10 bg-white/[0.03] p-7 sm:p-9 lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: demo.accent }}>{c.bookTitle}</p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase">{c.bookTitle}</h2>
            <p className="mt-2 text-sm text-white/55">{c.bookBody}</p>
            <div className="mt-8">
              <DemoBook demo={demo} slot={slot} setSlot={setSlot} dark />
            </div>
          </div>
          <div className="lg:col-span-5">
            <DemoFaqs title={s.faqsTitle} items={s.faqs} accent={demo.accent} dark />
          </div>
        </div>
      </section>
    </DemoChrome>
  )
}
