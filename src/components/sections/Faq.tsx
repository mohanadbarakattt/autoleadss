import { useState } from 'react'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { PAGE_FAQ } from '../../seo/pageFaq'
import SectionHeading from '../SectionHeading'
import ChatWidget from '../ChatWidget'

export default function Faq() {
  const t = useT()
  const { locale } = useLocale()
  const items = PAGE_FAQ[locale]
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="section-padding bg-background">
      <div className="content-width">
        <SectionHeading eyebrow={t.faqPage.eyebrow} title={t.faqPage.title} sub={t.faqPage.sub} />
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ul className="divide-y divide-border border-y border-border">
              {items.map((item, i) => {
                const expanded = open === i
                return (
                  <li key={item.q}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpen(expanded ? -1 : i)}
                      className="flex w-full items-start justify-between gap-4 py-5 text-start"
                    >
                      <span className="font-display text-lg font-bold leading-snug">{item.q}</span>
                      <span className="mt-1 font-mono text-xs text-accent">{expanded ? '–' : '+'}</span>
                    </button>
                    {expanded && (
                      <p className="pb-5 text-sm leading-relaxed text-muted-fg">{item.a}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
          <aside className="lg:col-span-5">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-accent">{t.faqPage.botLabel}</p>
            <ChatWidget inline />
          </aside>
        </div>
      </div>
    </section>
  )
}
