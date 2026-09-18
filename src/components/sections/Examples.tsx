import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { DEMOS } from '../../demos/data'
import SectionHeading from '../SectionHeading'
import DemoPreview from '../DemoPreview'

export default function Examples() {
  const t = useT()
  const { locale, localePath } = useLocale()
  const [picked, setPicked] = useState<Record<string, number>>({})

  return (
    <section id="examples" className="section-padding relative overflow-hidden" style={{ background: '#0A0A0B' }}>
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-50" />
      <div className="content-width relative z-10">
        <SectionHeading dark eyebrow={t.examples.eyebrow} title={t.examples.title} sub={t.examples.sub} />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {DEMOS.map((demo, i) => {
            const item = t.examples.items[i]
            const c = demo.copy[locale]
            const active = picked[demo.id] ?? 0
            return (
              <article key={demo.id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:-translate-y-1">
                <Link to={localePath(`/demo/${demo.id}`)} className="group block">
                  <DemoPreview demo={demo} />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-accent">{item?.kind ?? c.kind}</p>
                      <p className="mt-1 font-display text-xl font-bold text-white">{item?.name ?? c.brand}</p>
                      <p className="mt-1 text-sm text-white/55">{item?.body ?? c.sub}</p>
                    </div>
                    <Link
                      to={localePath(`/demo/${demo.id}`)}
                      className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm text-accent"
                    >
                      {t.examples.open}
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                  <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-white/45">{c.navBook}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.slots.slice(0, 3).map((s, si) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setPicked(p => ({ ...p, [demo.id]: si }))}
                          className="rounded px-2.5 py-1.5 font-mono text-[11px] transition-colors"
                          style={{
                            background: si === active ? demo.accent : 'rgba(255,255,255,0.06)',
                            color: si === active ? '#111' : 'rgba(255,255,255,0.75)',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        <p className="mt-10 text-center text-sm text-white/40">{t.examples.note}</p>
      </div>
    </section>
  )
}
