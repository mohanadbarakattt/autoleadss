import { useState } from 'react'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { PAGE_FAQ } from '../../seo/pageFaq'
import SectionHeading from '../SectionHeading'

export default function Faq() {
  const t = useT()
  const { locale } = useLocale()
  const items = PAGE_FAQ[locale].slice(0, 4)
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="section-padding bg-background">
      <div className="content-width">
        <SectionHeading eyebrow={t.faqPage.eyebrow} title={t.faqPage.title} sub={t.faqPage.sub} />
        <div className="max-w-4xl">
          <div>
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
        </div>
      </div>
    </section>
  )
}
