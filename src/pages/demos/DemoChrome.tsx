import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleProvider'
import LocalChat from '../../components/LocalChat'
import JsonLd from '../../components/JsonLd'
import { SITE, waLink } from '../../site'
import type { Demo } from '../../demos/data'
import { siteCopy } from '../../demos/siteCopy'
import { DEMO_SEO } from '../../demos/seo'
import { demoGraph } from '../../seo/jsonld'

export default function DemoChrome({ demo, children }: { demo: Demo; children: ReactNode }) {
  const { locale, localePath, isRTL, switchLocale } = useLocale()
  const c = demo.copy[locale]
  const s = siteCopy[demo.id][locale]
  const seo = DEMO_SEO[demo.id][locale]
  const BackIcon = isRTL ? ArrowRight : ArrowLeft
  const dark = demo.bg.startsWith('#0') || demo.bg.startsWith('#1')
  const canonical = `${SITE.origin}/${locale}/demo/${demo.id}`

  return (
    <div className="min-h-screen" style={{ background: demo.bg, color: demo.fg }}>
      <Helmet defer={false} prioritizeSeoTags>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en" href={`${SITE.origin}/en/demo/${demo.id}`} />
        <link rel="alternate" hrefLang="ar" href={`${SITE.origin}/ar/demo/${demo.id}`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE.origin}/en/demo/${demo.id}`} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <JsonLd data={demoGraph(locale, demo.id)} />

      <div
        className="border-b text-[11px]"
        style={{
          borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2.5">
          <Link to={localePath()} className="inline-flex items-center gap-1.5 opacity-70 hover:opacity-100">
            <BackIcon size={13} />
            AutoLeadss
          </Link>
          <p className="hidden opacity-55 sm:block">{s.ribbon}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => switchLocale(locale === 'en' ? 'ar' : 'en')}
              className="opacity-70 hover:opacity-100"
            >
              {locale === 'en' ? 'عربي' : 'EN'}
            </button>
            <a
              href={waLink(s.wantWa)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
              style={{ color: demo.accent }}
            >
              {s.want}
            </a>
          </div>
        </div>
      </div>

      {children}

      <footer
        className="border-t px-5 py-10"
        style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold">{c.brand}</p>
            <p className="mt-1 text-sm opacity-60">{s.footerNote}</p>
          </div>
          <a
            href={waLink(s.wantWa)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit rounded-full px-5 py-2.5 text-sm font-semibold text-[#111]"
            style={{ background: demo.accent }}
          >
            {s.want}
          </a>
        </div>
      </footer>

      <LocalChat copy={c.chat} accent={demo.accent} rtl={isRTL} />
    </div>
  )
}

export function DemoFaqs({
  title,
  items,
  accent,
  dark,
}: {
  title: string
  items: { q: string; a: string }[]
  accent: string
  dark?: boolean
}) {
  return (
    <div>
      <p className="eyebrow mb-6" style={{ color: accent }}>
        {title}
      </p>
      <ul className="divide-y" style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
        {items.map(item => (
          <li key={item.q} className="py-4" style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
            <details>
              <summary className="cursor-pointer list-none font-medium leading-snug [&::-webkit-details-marker]:hidden">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed opacity-70">{item.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}
