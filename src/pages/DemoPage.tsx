import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLocale } from '../i18n/LocaleProvider'
import { demoById } from '../demos/data'
import LocalChat from '../components/LocalChat'
import NotFound from './NotFound'

export default function DemoPage() {
  const { kind } = useParams()
  const { locale, localePath, isRTL } = useLocale()
  const demo = demoById(kind)
  const [done, setDone] = useState(false)
  const [slot, setSlot] = useState('')

  const c = demo?.copy[locale]
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  if (!demo || !c) return <NotFound />

  return (
    <div className="min-h-screen" style={{ background: demo.bg, color: demo.fg }}>
      <Helmet defer={false}>
        <title>{`${c.brand} — AutoLeadss demo`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="border-b border-black/10" style={{ background: demo.bg === '#0C0C0D' || demo.bg === '#141210' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)' }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-2.5 text-[11px]">
          <Link to={localePath()} className="inline-flex items-center gap-1.5 opacity-70 hover:opacity-100">
            <BackIcon size={13} />
            AutoLeadss
          </Link>
          <p className="opacity-60">Demo · booking + local chatbot</p>
        </div>
      </div>

      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <p className="font-display text-lg font-bold">{c.brand}</p>
        <a
          href="#book"
          className="rounded-full px-4 py-2 text-xs font-semibold"
          style={{ background: demo.accent, color: demo.bg.startsWith('#F') ? demo.fg : '#111' }}
        >
          {c.navBook}
        </a>
      </header>

      <section className="relative min-h-[70vh] overflow-hidden">
        <img src={demo.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-end px-5 pb-16 pt-24">
          <p className="eyebrow mb-3 text-white/70">{c.kind}</p>
          <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.05] text-white sm:text-6xl">{c.headline}</h1>
          <p className="mt-4 max-w-md text-base text-white/80">{c.sub}</p>
          <a
            href="#book"
            className="mt-8 inline-flex w-fit rounded-full px-7 py-3.5 text-sm font-semibold"
            style={{ background: demo.accent, color: '#111' }}
          >
            {c.cta}
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-16 md:grid-cols-2">
        <div>
          <p className="eyebrow" style={{ color: demo.accent }}>{c.aboutTitle}</p>
          <p className="mt-3 text-lg leading-relaxed opacity-90">{c.about}</p>
        </div>
        <div>
          <p className="eyebrow" style={{ color: demo.accent }}>{c.hoursTitle}</p>
          <p className="mt-3 text-lg leading-relaxed opacity-90">{c.hours}</p>
        </div>
      </section>

      <section id="book" className="px-5 pb-28">
        <div
          className="mx-auto max-w-xl rounded-3xl border p-7 sm:p-9"
          style={{
            borderColor: 'rgba(127,127,127,0.22)',
            background: demo.bg.startsWith('#F') ? '#fff' : 'rgba(255,255,255,0.05)',
          }}
        >
          <p className="eyebrow" style={{ color: demo.accent }}>{c.bookTitle}</p>
          <h2 className="mt-2 font-display text-2xl font-bold">{c.bookTitle}</h2>
          <p className="mt-2 text-sm opacity-70">{c.bookBody}</p>

          {done ? (
            <p className="mt-8 rounded-2xl px-4 py-4 text-sm" style={{ background: `${demo.accent}22` }}>
              {c.success}
            </p>
          ) : (
            <form
              className="mt-8 grid gap-4"
              onSubmit={e => {
                e.preventDefault()
                setDone(true)
              }}
            >
              <label className="grid gap-1.5 text-xs font-medium opacity-80">
                {c.name}
                <input required className="rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none" style={{ color: demo.fg }} />
              </label>
              <label className="grid gap-1.5 text-xs font-medium opacity-80">
                {c.phone}
                <input required dir="ltr" className="rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none" style={{ color: demo.fg }} />
              </label>
              <label className="grid gap-1.5 text-xs font-medium opacity-80">
                {c.date}
                <input type="date" required min={today} className="rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none" style={{ color: demo.fg }} />
              </label>
              <div>
                <p className="mb-2 text-xs font-medium opacity-80">{c.slot}</p>
                <div className="flex flex-wrap gap-2">
                  {c.slots.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className="rounded-full border px-3 py-1.5 text-xs"
                      style={{
                        borderColor: slot === s ? demo.accent : 'rgba(127,127,127,0.3)',
                        background: slot === s ? demo.accent : 'transparent',
                        color: slot === s ? '#111' : demo.fg,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={!slot}
                className="mt-2 rounded-full py-3 text-sm font-semibold disabled:opacity-40"
                style={{ background: demo.accent, color: '#111' }}
              >
                {c.submit}
              </button>
            </form>
          )}
        </div>
      </section>

      <LocalChat copy={c.chat} accent={demo.accent} rtl={isRTL} />
    </div>
  )
}
