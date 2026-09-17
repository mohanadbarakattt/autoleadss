import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { DEMOS } from '../../demos/data'
import SectionHeading from '../SectionHeading'
import DemoPreview from '../DemoPreview'

export default function Examples() {
  const t = useT()
  const { localePath } = useLocale()

  return (
    <section id="examples" className="section-padding" style={{ background: '#0A0A0B' }}>
      <div className="content-width">
        <SectionHeading dark eyebrow={t.examples.eyebrow} title={t.examples.title} sub={t.examples.sub} />
        <div className="grid gap-6 sm:grid-cols-2">
          {DEMOS.map((demo, i) => {
            const item = t.examples.items[i]
            return (
              <Link
                key={demo.id}
                to={localePath(`/demo/${demo.id}`)}
                className="group block"
              >
                <DemoPreview demo={demo} />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-accent">{item.kind}</p>
                    <p className="mt-1 font-display text-xl font-bold text-white">{item.name}</p>
                    <p className="mt-1 text-sm text-white/55">{item.body}</p>
                  </div>
                  <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm text-accent">
                    {t.examples.open}
                    <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
        <p className="mt-10 text-center text-sm text-white/40">{t.examples.note}</p>
      </div>
    </section>
  )
}
