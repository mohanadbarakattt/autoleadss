import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { DEMOS } from '../../demos/data'
import SectionHeading from '../SectionHeading'
import DemoPreview from '../DemoPreview'

export default function Examples() {
  const t = useT()
  const { locale, localePath } = useLocale()

  const featured = DEMOS[0]
  const rest = DEMOS.slice(1)

  return (
    <section id="examples" className="section-padding relative overflow-hidden" style={{ background: '#0A0A0B' }}>
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-50" />
      <div className="content-width relative z-10">
        <SectionHeading dark eyebrow={t.examples.eyebrow} title={t.examples.title} sub={t.examples.sub} />

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.8)]">
          <div className="grid lg:grid-cols-12">
            <Link to={localePath(`/demo/${featured.id}`)} className="group block lg:col-span-7">
              <DemoPreview demo={featured} />
            </Link>
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-accent">{t.examples.items[0].kind}</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{t.examples.items[0].name}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{t.examples.items[0].body}</p>
              </div>
              <div className="mt-8">
                <Link
                  to={localePath(`/demo/${featured.id}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-[#0A0A0B]"
                >
                  {t.examples.open}
                  <ArrowUpRight size={14} />
                </Link>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-white/35">{featured.copy[locale].navBook}</p>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {rest.map((demo, i) => {
            const item = t.examples.items[i + 1]
            const c = demo.copy[locale]
            return (
              <article key={demo.id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-transform duration-300 hover:-translate-y-1">
                <Link to={localePath(`/demo/${demo.id}`)} className="group block">
                  <DemoPreview demo={demo} compact />
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
                </div>
              </article>
            )
          })}
        </div>
        <p className="mt-10 text-center text-sm text-white/50">{t.examples.packageNote}</p>
        <p className="mt-2 text-center text-sm text-white/35">{t.examples.note}</p>
      </div>
    </section>
  )
}
