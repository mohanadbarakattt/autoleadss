import { type FormEvent, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  BookOpen,
  Calendar,
  Check,
  Coffee,
  Factory,
  Info,
  Leaf,
  MapPin,
  Sparkles,
  Trees,
} from 'lucide-react'
import type { Demo } from '../../demos/data'
import { cafeUi } from '../../demos/cafeCopy'
import { siteCopy } from '../../demos/siteCopy'
import { useLocale } from '../../i18n/LocaleProvider'
import DemoChrome from './DemoChrome'

const ZONE_ICONS = [Trees, Factory, BookOpen]
const PRODUCT_ACCENT = ['#4edea3', '#dfb67a', '#e89968', '#4edea3']

export default function CafeDemo({ demo }: { demo: Demo }) {
  const { locale } = useLocale()
  const c = demo.copy[locale]
  const s = siteCopy.cafe[locale]
  const u = cafeUi[locale]
  const [zone, setZone] = useState(0)
  const [slot, setSlot] = useState(0)
  const [guests, setGuests] = useState(2)
  const [method, setMethod] = useState(0)
  const [done, setDone] = useState(false)
  const [ordered, setOrdered] = useState<string | null>(null)

  const slots = c.slots
  const zoneTitle = u.zones[zone].title
  const slotLabel = `${slots[slot]} · ${u.slotNotes[slot] ?? ''}`
  const guestLabel = `${guests} ${guests === 1 ? u.guestWord : u.guestsWord}`

  function onBook(e: FormEvent) {
    e.preventDefault()
    setDone(true)
  }

  return (
    <DemoChrome demo={demo}>
      <Helmet>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
        />
      </Helmet>

      <div className="qahwa relative overflow-x-hidden selection:bg-[#4edea3] selection:text-[#0a0a0c]">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-16 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-[#dfb67a]/10 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute right-0 top-[520px] h-[450px] w-[450px] rounded-full bg-[#4edea3]/10 blur-[120px]" />

        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#121214]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6">
            <a href="#top" className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfb67a]/40 bg-gradient-to-br from-[#dfb67a]/30 to-[#121214] font-display text-lg font-bold text-[#dfb67a]">
                Q
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold tracking-tight sm:text-lg">{c.brand}</span>
                  <span className="rounded border border-[#dfb67a]/20 bg-[#dfb67a]/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#dfb67a]">
                    {u.roastBadge}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[#a8a29e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]/70" />
                  {s.location}
                </p>
              </div>
            </a>
            <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-widest text-[#a8a29e] lg:flex">
              <a className="hover:text-[#4edea3]" href="#beans">{u.navBeans}</a>
              <a className="hover:text-[#4edea3]" href="#reservations">{u.navReserve}</a>
              <a className="hover:text-[#4edea3]" href="#sanctuary">{u.navPlace}</a>
            </nav>
            <a
              href="#reservations"
              className="inline-flex items-center gap-2 rounded-full bg-[#4edea3] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#003824] shadow-[0_0_20px_rgba(78,222,163,0.3)]"
            >
              <Calendar size={14} />
              {c.navBook}
            </a>
          </div>
        </header>

        <section id="top" className="relative border-b border-white/5 px-5 pb-24 pt-12 grain-overlay sm:px-6">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="z-10 flex flex-col items-start gap-6 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1e1d22] px-3 py-1 font-mono text-xs text-[#a8a29e]">
                  <span className="h-2 w-2 animate-ping rounded-full bg-[#4edea3]" />
                  <span className="text-[#f6f2ec]">{u.roasting}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-[#dfb67a]">{u.originLive}</span>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-[#1e1d22]/60 px-3 py-1 font-mono text-[11px] text-[#a8a29e] sm:inline-flex">
                  <Sparkles size={14} className="text-[#dfb67a]" />
                  {u.audio}
                </div>
              </div>

              <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {u.titleLead}{' '}
                <span className="bg-gradient-to-r from-[#dfb67a] to-[#cfa068] bg-clip-text font-serif text-[0.92em] font-normal italic text-transparent">
                  {u.titlePlace}
                </span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#a8a29e] sm:text-lg">{c.sub}</p>

              <div className="flex w-full flex-wrap items-center gap-4 pt-2 sm:w-auto">
                <a
                  href="#reservations"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4edea3] to-[#008157] px-7 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#003824] shadow-[0_4px_30px_rgba(78,222,163,0.35)] sm:w-auto"
                >
                  {u.heroCta}
                </a>
                <a
                  href="#beans"
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#27262c] px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#f6f2ec] hover:border-[#4edea3]/40 sm:w-auto"
                >
                  <Coffee size={16} className="text-[#4edea3]" />
                  {u.heroOrder}
                  <span className="rounded bg-[#4edea3]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#4edea3]">{u.heroHint}</span>
                </a>
              </div>

              <div className="w-full border-t border-white/10 pt-4">
                <p className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[#a8a29e]">
                  <Leaf size={13} className="text-[#dfb67a]" />
                  {u.notesLabel}
                </p>
                <div className="flex flex-wrap gap-2">
                  {u.notes.map(note => (
                    <span key={note} className="rounded-md border border-white/5 bg-[#1e1d22] px-2.5 py-1 font-mono text-xs text-[#f6f2ec]">
                      ✦ {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-b from-white/15 via-white/5 to-transparent p-2 shadow-2xl">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#060608]">
                  <img alt="" className="h-full w-full object-cover brightness-90" src={demo.img} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 end-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0c]/85 px-3.5 py-2 backdrop-blur-md">
                    <span className="font-display text-base font-bold text-[#dfb67a]">{u.qGrade}</span>
                    <div className="flex flex-col font-mono text-[9px] uppercase leading-tight text-[#a8a29e]">
                      <span className="font-bold text-white">{u.qGradeSub}</span>
                      <span>{u.qGradeFloor}</span>
                    </div>
                  </div>
                  <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/10 bg-[#0a0a0c]/90 p-4 shadow-2xl backdrop-blur-md">
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#4edea3]" />
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#4edea3]">{u.extractLive}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#a8a29e]">{u.extractTds}</span>
                    </div>
                    <p className="font-display text-sm font-semibold text-white">{u.extractBody}</p>
                    <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 font-mono text-[10px] text-[#a8a29e]">
                      <span>{u.extractPlace}</span>
                      <span className="text-[#dfb67a]">{u.extractLimit}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -start-2 hidden items-center gap-3 rounded-xl border border-white/10 bg-[#27262c] p-3 shadow-2xl sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dfb67a]/20 text-[#dfb67a]">
                  <Check size={16} />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-[#a8a29e]">{u.giesenSub}</div>
                  <div className="font-mono text-xs font-bold text-white">{u.giesen}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="reservations" className="relative border-b border-white/5 bg-[#0a0a0c] px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#4edea3]">
                  <Coffee size={14} />
                  {u.reserveEyebrow}
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{u.reserveTitle}</h2>
                <p className="mt-2 max-w-xl text-sm text-[#a8a29e] sm:text-base">{u.reserveBody}</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1e1d22] px-4 py-2.5 font-mono text-xs text-[#a8a29e]">
                <Check size={16} className="text-[#dfb67a]" />
                {u.reserveBadge}
              </div>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-12">
              <div className="space-y-8 rounded-2xl border border-white/10 bg-[#161619] p-6 shadow-xl sm:p-8 lg:col-span-7">
                <div>
                  <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-[#a8a29e]">
                    <span>{u.zoneStep}</span>
                    <span className="text-[11px] text-[#4edea3]">{zoneTitle}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {u.zones.map((z, i) => {
                      const Icon = ZONE_ICONS[i]
                      const on = zone === i
                      return (
                        <button
                          key={z.title}
                          type="button"
                          onClick={() => setZone(i)}
                          className={`group rounded-xl border-2 p-4 text-start transition-all ${
                            on ? 'border-[#4edea3] bg-[#1e1d22]' : 'border-transparent bg-[#1e1d22] hover:border-white/20'
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <Icon size={20} className={on ? 'text-[#4edea3]' : 'text-[#dfb67a]'} />
                            <span className={`h-2 w-2 rounded-full ${on ? 'bg-[#4edea3]' : 'bg-white/20'}`} />
                          </div>
                          <div className="font-display text-sm font-bold text-white">{z.title}</div>
                          <div className="mt-1 font-mono text-[11px] text-[#a8a29e]">{z.body}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-[#a8a29e]">
                    <span>{u.slotStep}</span>
                    <span className="text-[11px] text-[#dfb67a]">{u.slotsLeft}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {slots.map((time, i) => {
                      const on = slot === i
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSlot(i)}
                          className={`rounded-xl border p-3 text-start transition-all ${
                            on ? 'border-[#4edea3] bg-[#1e1d22]' : 'border-white/5 bg-[#1e1d22] hover:border-white/20'
                          }`}
                        >
                          <div className={`font-mono text-sm font-bold ${on ? 'text-[#4edea3]' : 'text-white'}`}>{time}</div>
                          <div className="font-mono text-[10px] text-[#a8a29e]">{u.slotNotes[i]}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[#a8a29e]">{u.party}</p>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1e1d22] p-2">
                      <button
                        type="button"
                        onClick={() => setGuests(g => Math.max(1, g - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#27262c] font-mono text-lg text-white hover:bg-white/10"
                      >
                        –
                      </button>
                      <p className="text-center font-mono">
                        <span className="text-lg font-bold text-white">{guests}</span>
                        <span className="ms-1 text-xs text-[#a8a29e]">{guests === 1 ? u.guestWord : u.guestsWord}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setGuests(g => Math.min(8, g + 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#27262c] font-mono text-lg text-white hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-[#a8a29e]" htmlFor="brewMethod">
                      {u.method}
                    </label>
                    <select
                      id="brewMethod"
                      value={method}
                      onChange={e => setMethod(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-[#1e1d22] p-3 font-mono text-xs text-white outline-none focus:border-[#4edea3]"
                    >
                      {u.methods.map((m, i) => (
                        <option key={m} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:col-span-5">
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#1e1d22] via-[#27262c] to-[#0a0a0c] p-6 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4edea3]/20 font-display text-sm font-bold text-[#4edea3]">Q</span>
                      <span className="font-display text-sm font-bold tracking-wide text-white">{u.passTitle}</span>
                    </div>
                    <span className="rounded border border-[#4edea3]/20 bg-[#4edea3]/10 px-2 py-0.5 font-mono text-[10px] uppercase text-[#4edea3]">
                      {u.passVerified}
                    </span>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#a8a29e]">{u.passZone}</span>
                      <span className="font-semibold text-white">{zoneTitle}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#a8a29e]">{u.passSlot}</span>
                      <span className="text-end font-semibold text-[#dfb67a]">{slotLabel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#a8a29e]">{u.passParty}</span>
                      <span className="font-semibold text-white">{guestLabel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#a8a29e]">{u.passMethod}</span>
                      <span className="max-w-[200px] truncate text-end font-semibold text-white">{u.methods[method]}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-2">
                      <span className="text-[#a8a29e]">{u.passWater}</span>
                      <span className="font-bold text-[#4edea3]">{u.passWaterVal}</span>
                    </div>
                  </div>

                  {done ? (
                    <div className="mt-6 rounded-xl border border-[#4edea3]/30 bg-[#4edea3]/10 p-4 text-center">
                      <Check size={22} className="mx-auto mb-1 text-[#4edea3]" />
                      <div className="font-display text-sm font-bold text-white">{u.successTitle}</div>
                      <div className="mt-1 font-mono text-[11px] text-[#a8a29e]">{u.successBody}</div>
                    </div>
                  ) : (
                    <form className="mt-6 space-y-3 border-t border-dashed border-white/20 pt-6" onSubmit={onBook}>
                      <input
                        required
                        name="name"
                        autoComplete="name"
                        placeholder={u.namePh}
                        className="w-full rounded-xl border border-white/10 bg-[#0a0a0c] p-3 font-mono text-xs text-white outline-none placeholder:text-white/40 focus:border-[#4edea3]"
                      />
                      <input
                        required
                        name="phone"
                        dir="ltr"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder={u.phonePh}
                        className="w-full rounded-xl border border-white/10 bg-[#0a0a0c] p-3 font-mono text-xs text-white outline-none placeholder:text-white/40 focus:border-[#4edea3]"
                      />
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4edea3] py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#003824] shadow-[0_4px_25px_rgba(78,222,163,0.3)] hover:bg-white"
                      >
                        <Check size={16} />
                        {u.confirm}
                      </button>
                    </form>
                  )}
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#1e1d22]/60 p-4">
                  <Info size={16} className="mt-0.5 shrink-0 text-[#dfb67a]" />
                  <p className="font-mono text-[11px] leading-relaxed text-[#a8a29e]">{u.policy}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="beans" className="relative border-b border-white/5 bg-[#0c0b0c] px-5 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-1 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#dfb67a]">
                  <Coffee size={14} />
                  {u.beansEyebrow}
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{u.beansTitle}</h2>
                <p className="mt-1 text-sm text-[#a8a29e] sm:text-base">{u.beansSub}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#4edea3]/20 bg-[#4edea3]/10 px-3 py-1.5 font-mono text-xs text-[#4edea3]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#4edea3]" />
                {u.dispatch}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {s.cards.map((card, i) => {
                const extra = u.products[i]
                const accent = PRODUCT_ACCENT[i]
                return (
                  <article
                    key={card.title}
                    className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#161619] p-5 shadow-lg transition-all hover:border-white/25"
                  >
                    <div>
                      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-[#1e1d22]">
                        <img
                          alt=""
                          src={demo.img}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: `${12 + i * 22}% 50%` }}
                        />
                        {extra && (
                          <>
                            <span
                              className="absolute top-2.5 end-2.5 rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md"
                              style={{ background: 'rgba(10,10,12,0.8)', color: accent, border: `1px solid ${accent}55` }}
                            >
                              {extra.badge}
                            </span>
                            <span className="absolute bottom-2.5 start-2.5 rounded bg-[#0a0a0c]/80 px-2 py-0.5 font-mono text-[10px] text-[#a8a29e] backdrop-blur-md">
                              {extra.alt}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-mono text-[11px] uppercase text-[#dfb67a]">{extra?.origin}</span>
                        <span className="font-mono text-sm font-bold text-white">{card.meta}</span>
                      </div>
                      <h3 className="mb-2 font-display text-lg font-bold text-white group-hover:text-[#4edea3]">{card.title}</h3>
                      {extra && (
                        <div className="mb-3">
                          <div className="mb-1 flex justify-between font-mono text-[10px] text-[#a8a29e]">
                            <span>{u.roastLabel}</span>
                            <span className="font-bold" style={{ color: accent }}>{extra.roast}</span>
                          </div>
                          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#1e1d22]">
                            <div className="h-full" style={{ width: `${extra.roastPct}%`, background: accent }} />
                            <div className="h-full flex-1 bg-white/10" />
                          </div>
                        </div>
                      )}
                      <p className="mb-3 text-sm leading-relaxed text-[#a8a29e]">{card.body}</p>
                      {extra && (
                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {extra.tags.map(tag => (
                            <span key={tag} className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[#f6f2ec]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrdered(card.title)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1e1d22] py-2.5 font-mono text-xs uppercase tracking-wider text-[#f6f2ec] hover:border-[#4edea3]/40"
                    >
                      <Coffee size={14} className="text-[#4edea3]" />
                      {ordered === card.title ? s.orderDone : s.order}
                    </button>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="sanctuary" className="relative border-b border-white/5 bg-[#0a0a0c] px-5 py-24 sm:px-6">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#dfb67a]">
                <MapPin size={14} />
                {u.mapEyebrow}
              </p>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{u.mapTitle}</h2>
              <p className="text-sm leading-relaxed text-[#a8a29e] sm:text-base">{u.mapBody}</p>
              <p className="font-mono text-[10px] uppercase text-[#dfb67a]">{u.footerAr}</p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-[#161619] p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dfb67a]/15 text-[#dfb67a]">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="font-display text-sm font-semibold text-white">{u.walkTitle}</div>
                    <div className="font-mono text-[11px] text-[#a8a29e]">{u.walkHint}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-[#161619] p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4edea3]/15 text-[#4edea3]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className="font-display text-sm font-semibold text-white">{c.hours}</div>
                    <div className="font-mono text-[11px] text-[#a8a29e]">{u.hoursHint}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="group relative h-96 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <img alt="" src={demo.img} className="h-full w-full object-cover brightness-75 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/30 to-transparent" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-12 w-12 animate-ping rounded-full bg-[#4edea3] opacity-40" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#4edea3] font-display text-sm font-extrabold text-[#003824] shadow-2xl">
                      QH
                    </div>
                  </div>
                  <div className="mt-2 rounded-full border border-white/20 bg-[#0a0a0c]/90 px-3 py-1 font-mono text-[10px] text-white shadow-xl">
                    {u.pin}
                  </div>
                </div>
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl border border-white/10 bg-[#0a0a0c]/90 p-3.5 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#4edea3]" />
                    <span className="font-mono text-xs text-white">{u.pin}</span>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Road+9+Maadi+Cairo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e1d22] px-3 py-1.5 font-mono text-xs text-[#f6f2ec] hover:bg-white/20"
                  >
                    {u.maps}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DemoChrome>
  )
}
