import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocale, useT } from '../i18n/LocaleProvider'
import { DEMOS } from '../demos/data'

export default function HeroStage() {
  const t = useT()
  const { locale, localePath } = useLocale()
  const cafe = DEMOS[0]
  const c = cafe.copy[locale]
  const m = t.hero.mock
  const [slot, setSlot] = useState(0)
  const slots = c.slots.slice(0, 3)

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-2 rotate-1 rounded-2xl bg-white/[0.04]" />
      <div className="relative overflow-hidden rounded-xl border border-white/12 bg-[#1c1c1e] shadow-[0_28px_70px_-28px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2.5 sm:px-4">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          <p className="ms-1 min-w-0 flex-1 truncate rounded-md bg-black/30 px-2.5 py-1 text-center font-mono text-[10px] text-white/50" dir="ltr">
            autoleadss.com/demo/cafe
          </p>
          <span className="hidden font-mono text-[10px] uppercase tracking-wider text-white/35 sm:inline">{c.kind}</span>
        </div>

        <div className="grid md:grid-cols-12">
          <Link
            to={localePath('/demo/cafe')}
            className="flex flex-col justify-between gap-4 border-white/10 p-4 sm:p-5 md:col-span-7 md:border-e"
            style={{ background: cafe.bg, color: cafe.fg }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded font-serif text-xs font-bold"
                  style={{ background: cafe.accent, color: '#003824' }}
                >
                  Q
                </span>
                <span className="font-display text-sm font-bold">{c.brand}</span>
              </div>
              <span className="rounded px-2 py-0.5 font-mono text-[10px]" style={{ background: `${cafe.accent}22`, color: cafe.accent }}>
                {m.place}
              </span>
            </div>

            <div className="relative h-28 overflow-hidden rounded sm:h-32">
              <img src={cafe.img} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-2 start-2 rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] text-white">
                {c.navBook}
              </span>
            </div>

            <div>
              <p className="font-display text-lg font-bold leading-tight sm:text-xl">{c.headline}</p>
              <p className="mt-1 line-clamp-2 text-xs opacity-70">{c.sub}</p>
            </div>

            <div className="rounded-lg p-3 shadow-sm" style={{ background: cafe.bg.startsWith('#F') ? '#fff' : 'rgba(255,255,255,0.07)' }}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider">{m.slotLabel}</span>
                <span className="font-mono text-[10px]" style={{ color: cafe.accent }}>{c.navBook}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {slots.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSlot(i)
                    }}
                    className="rounded px-1 py-1.5 font-mono text-[11px]"
                    style={{
                      background: i === slot ? cafe.fg : 'transparent',
                      color: i === slot ? cafe.bg : cafe.fg,
                      border: `1px solid ${i === slot ? cafe.fg : 'rgba(127,127,127,0.25)'}`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Link>

          <div className="flex flex-col justify-between gap-3 bg-[#EFECE4] p-4 md:col-span-5">
            <div className="flex items-center gap-2 border-b border-black/10 pb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E7E48] text-[10px] font-bold text-white">AL</span>
              <div className="leading-tight">
                <p className="font-mono text-[11px] font-bold text-[#121110]">{m.chatName}</p>
                <p className="font-mono text-[10px] text-[#1E7E48]">{m.typing}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="ms-4 rounded-lg rounded-tr-none bg-white p-2.5 shadow-sm">
                <p className="text-[12px] leading-relaxed text-[#121110]">{m.userMsg}</p>
              </div>
              <div className="me-2 space-y-1 rounded-lg rounded-tl-none bg-[#1b3b2b] p-2.5 text-[#FAFAF7]">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/55">
                  <span>{m.quoteLabel}</span>
                  <span className="rounded bg-white px-1.5 py-0.5 font-bold text-[#1E7E48]">OK</span>
                </div>
                <p className="text-[12px] font-medium">{m.quoteBody}</p>
                <div className="flex items-baseline justify-between border-t border-white/15 pt-1.5">
                  <span className="font-mono text-[10px] text-white/50">{t.pricing.split}</span>
                  <span className="font-mono text-sm font-bold text-[#fe8c58]">{m.quotePrice}</span>
                </div>
              </div>
            </div>

            <p className="text-center font-mono text-[10px] uppercase tracking-wider text-[#6B6660]">{m.note}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
