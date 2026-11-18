import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ArrowDown, ArrowUpRight, Check, MessageCircle } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import CookieConsent from '../components/CookieConsent'
import JsonLd from '../components/JsonLd'
import SeoIcons from '../components/SeoIcons'
import { useLocale } from '../i18n/LocaleProvider'
import type { Locale } from '../i18n/translations'
import { SITE, waLink } from '../site'
import { trackLeadFormConversion } from '../analytics'
import { onCallGraph } from '../seo/jsonld'
import {
  ON_CALL_COPY,
  ON_CALL_CURRENCIES,
  ON_CALL_PATH,
  ON_CALL_PRICES,
  ON_CALL_TIERS,
  WA_DISPLAY_ISOLATED,
  formatOnCallAmount,
  formatOnCallPrice,
  type OnCallCurrency,
} from '../content/onCall'

const HTML_LANG: Record<Locale, string> = { en: 'en', ar: 'ar' }

const GULF = new Set(['AE', 'SA', 'QA', 'KW', 'BH', 'OM'])

function timezoneCurrency(): OnCallCurrency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz === 'Africa/Cairo') return 'EGP'
    if (tz === 'Asia/Riyadh') return 'SAR'
    if (tz === 'Europe/London') return 'GBP'
    if (['Asia/Dubai', 'Asia/Muscat', 'Asia/Qatar', 'Asia/Bahrain', 'Asia/Kuwait'].includes(tz)) return 'AED'
  } catch {
    /* ignore */
  }
  return 'USD'
}

function useOnCallCurrency() {
  const [currency, setCurrency] = useState<OnCallCurrency>(timezoneCurrency)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch('https://ipwho.is/?fields=country_code,success', { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d?.success === false || typeof d.country_code !== 'string') return
        const code = d.country_code
        if (code === 'EG') setCurrency('EGP')
        else if (code === 'SA') setCurrency('SAR')
        else if (GULF.has(code)) setCurrency('AED')
        else if (code === 'GB') setCurrency('GBP')
        else if (code === 'US') setCurrency('USD')
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  return [currency, setCurrency] as const
}

function Price({ currency, amount, ar, perMonth, dark }: { currency: OnCallCurrency; amount: number; ar: boolean; perMonth: string; dark?: boolean }) {
  const p = formatOnCallPrice(currency, amount, ar)
  const unitClass = dark ? 'text-white/50' : 'text-muted-fg'
  const showLeadingUnit = !p.unitAfter && currency !== 'USD' && currency !== 'GBP'
  return (
    <div className="mt-6 flex flex-wrap items-end gap-2">
      {showLeadingUnit ? <span className={`pb-1 text-sm font-semibold ${unitClass}`}>{p.unit}</span> : null}
      <span className="font-serif text-[2.9rem] leading-[0.85]" dir="ltr">
        {p.amount}
      </span>
      {p.unitAfter ? <span className={`pb-1 text-sm font-semibold ${unitClass}`}>{p.unit}</span> : null}
      <span className={`pb-1 text-sm ${unitClass}`}>{perMonth}</span>
    </div>
  )
}

function PhoneLine({ ar, className }: { ar: boolean; className?: string }) {
  if (ar) {
    return (
      <p className={className}>
        أو ابعت على:
        <br />
        <span dir="ltr" className="font-mono">
          {WA_DISPLAY_ISOLATED}
        </span>
      </p>
    )
  }
  return (
    <p className={className}>
      Or message <span dir="ltr" className="font-mono">{SITE.whatsappDisplay}</span>
    </p>
  )
}

export default function OnCallPage() {
  const { locale, isRTL } = useLocale()
  const ar = isRTL
  const copy = ON_CALL_COPY[locale]
  const tiers = ON_CALL_TIERS[locale]
  const [currency, setCurrency] = useOnCallCurrency()
  const wa = waLink(copy.waText)
  const eye = ar ? 'font-mono text-[11px] font-medium' : 'eyebrow'
  const title = copy.seo.title
  const description = copy.seo.description
  const canonical = `${SITE.origin}/${locale}${ON_CALL_PATH}`

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet defer={false} prioritizeSeoTags>
        <html lang={HTML_LANG[locale]} dir={ar ? 'rtl' : 'ltr'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={copy.seo.keywords} />
        <meta name="geo.region" content="EG-C" />
        <meta name="geo.placename" content="Cairo" />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en" href={`${SITE.origin}/en${ON_CALL_PATH}`} />
        <link rel="alternate" hrefLang="ar" href={`${SITE.origin}/ar${ON_CALL_PATH}`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE.origin}/en${ON_CALL_PATH}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE.origin}/og-image.png`} />
        <meta property="og:locale" content={ar ? 'ar_EG' : 'en_US'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${SITE.origin}/og-image.png`} />
      </Helmet>
      <SeoIcons />
      <JsonLd data={onCallGraph(locale, title, description)} />
      <Navigation />
      <main>
        <section className="relative overflow-hidden bg-[#0A0A0B] text-white">
          <div aria-hidden className="absolute inset-0 grain-overlay opacity-70" />
          <div aria-hidden className="absolute -end-32 -top-48 h-[620px] w-[620px] rounded-full bg-[#ff5c2a]/20 blur-[120px]" />
          <div className="content-width relative pb-20 pt-28 sm:pt-32 lg:pb-28 lg:pt-40">
            <p className={`font-mono text-[10px] uppercase text-white/40 ${ar ? 'tracking-normal' : 'tracking-[0.18em]'}`}>{ar ? 'أوتوليدز / القاهرة · دبي' : 'AutoLeadss / Cairo · Dubai'}</p>
            <p className={`${eye} mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-white/70`}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              {copy.hero.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,5.4vw,5.2rem)] font-bold leading-[0.95] tracking-[-0.055em]">
              {copy.hero.title}
              <span className="mt-1 block font-serif font-normal italic text-[#fe8c58]">{copy.hero.titleEm}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/62 sm:text-lg">{copy.hero.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackLeadFormConversion}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-wa px-7 text-sm font-semibold text-white shadow-[0_10px_28px_-8px_rgba(30,126,72,0.55)] transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle size={17} />
                {copy.hero.cta}
              </a>
              <a
                href="#plans"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-sm font-semibold text-white transition-colors hover:border-white/30"
              >
                {copy.hero.secondary}
                <ArrowDown size={16} />
              </a>
            </div>
            <ul className="mt-10 grid gap-2 sm:grid-cols-3">
              {copy.hero.chips.map((chip) => (
                <li key={chip} className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-medium">
                  <Check size={15} className="shrink-0 text-[#fe8c58]" />
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="who" className="scroll-mt-36 bg-[#FAFAF7] py-20 sm:py-28">
          <div className="content-width">
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className={`${eye} text-accent`}>{copy.who.eyebrow}</p>
                <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[#0A0A0B]">{copy.who.title}</h2>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-muted-fg lg:justify-self-end">{copy.who.body}</p>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              <article className="rounded-[26px] border border-border bg-white p-7 sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{copy.who.marketsTitle}</p>
                <ul className="mt-5 space-y-3">
                  {copy.who.markets.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
                      <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm leading-relaxed text-muted-fg">{copy.who.platforms}</p>
              </article>
              <article className="rounded-[26px] bg-[#0A0A0B] p-7 text-white sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#fe8c58]">{copy.who.fitTitle}</p>
                <ul className="mt-5 space-y-3">
                  {copy.who.fit.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-white/80">
                      <Check size={16} className="mt-0.5 shrink-0 text-[#fe8c58]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="included" className="scroll-mt-36 bg-[#EFECE4] py-20 sm:py-28">
          <div className="content-width">
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className={`${eye} text-accent`}>{copy.included.eyebrow}</p>
                <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em]">{copy.included.title}</h2>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-muted-fg lg:justify-self-end">{copy.included.body}</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {copy.included.items.map((item) => (
                <article key={item.title} className="rounded-[26px] border border-border bg-white p-6 sm:p-7">
                  <h3 className="font-display text-xl font-bold leading-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-fg">{item.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-[26px] border border-border bg-white p-7 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{copy.included.notTitle}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {copy.included.notItems.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-muted-fg">{item}</li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-[#0A0A0B]">{copy.included.addon}</p>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-36 bg-[#FAFAF7] py-20 sm:py-28">
          <div className="content-width">
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className={`${eye} text-accent`}>{copy.how.eyebrow}</p>
                <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em]">{copy.how.title}</h2>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-muted-fg lg:justify-self-end">{copy.how.body}</p>
            </div>
            <ol className="mt-12 divide-y divide-border overflow-hidden rounded-[28px] border border-border bg-white">
              {copy.how.steps.map((step) => (
                <li key={step.n} className="grid gap-3 px-6 py-6 sm:grid-cols-[4rem_16rem_1fr] sm:items-start sm:px-8">
                  <span className="font-mono text-xs text-accent">{step.n}</span>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-fg">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="plans" className="scroll-mt-36 bg-[#FAFAF7] pb-20 sm:pb-28">
          <div className="content-width">
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className={`${eye} text-accent`}>{copy.plans.eyebrow}</p>
                <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em]">{copy.plans.title}</h2>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-muted-fg lg:justify-self-end">{copy.plans.body}</p>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-fg">{copy.plans.terms}</p>
              <div className="inline-flex shrink-0 flex-wrap rounded-full border border-border bg-white p-1" role="tablist" aria-label={copy.plans.currencyLabel}>
                {ON_CALL_CURRENCIES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    role="tab"
                    aria-selected={currency === code}
                    onClick={() => setCurrency(code)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${currency === code ? 'bg-[#0A0A0B] text-white' : 'text-black/50 hover:text-black'}`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {tiers.map((tier) => {
                const dark = Boolean(tier.featured)
                const amount = ON_CALL_PRICES[tier.id][currency]
                const planWa = waLink(
                  ar
                    ? `أهلاً أوتوليدز، عايز أسأل عن باقة ${tier.name} في أوتوليدز أون كول.`
                    : `Hi AutoLeadss, I'd like to ask about the ${tier.name} plan on AutoLeadss On Call.`,
                )
                return (
                  <article
                    key={tier.id}
                    className={`flex flex-col rounded-[26px] border p-6 sm:p-7 ${dark ? 'border-[#0A0A0B] bg-[#101112] text-white shadow-[0_32px_90px_-58px_rgba(10,10,11,0.7)]' : 'border-border bg-white'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${dark ? 'text-[#fe8c58]' : 'text-accent'}`}>{tier.name}</p>
                      {dark ? <span className="rounded-full bg-[#fe8c58]/15 px-2.5 py-1 text-[10px] font-semibold text-[#fe8c58]">{copy.plans.recommended}</span> : null}
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-bold leading-tight">{tier.title}</h3>
                    <Price currency={currency} amount={amount} ar={ar} perMonth={copy.plans.perMonth} dark={dark} />
                    <p className={`mt-2 text-xs ${dark ? 'text-white/50' : 'text-muted-fg'}`}>
                      {formatOnCallAmount(tier.hours, ar)} {copy.plans.hours}
                    </p>
                    <p className={`mt-4 text-sm leading-relaxed ${dark ? 'text-white/60' : 'text-muted-fg'}`}>{tier.intro}</p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {tier.items.map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
                          <Check size={16} className={`mt-0.5 shrink-0 ${dark ? 'text-[#fe8c58]' : 'text-accent'}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={planWa}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={trackLeadFormConversion}
                      className={`mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${dark ? 'bg-white text-[#101112]' : 'bg-[#0A0A0B] text-white'}`}
                    >
                      {copy.plans.cta}
                    </a>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="proof" className="scroll-mt-36 bg-[#0A0A0B] py-20 text-white sm:py-28">
          <div className="content-width">
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className={`${eye} text-[#fe8c58]`}>{copy.proof.eyebrow}</p>
                <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em]">{copy.proof.title}</h2>
              </div>
            </div>
            <div className="mt-10 overflow-hidden rounded-[28px] border border-white/12 bg-[#151618]">
              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <div className="bg-[#f5d6d2]">
                  <img src="/work/lashcartel.png" alt={`${copy.proof.name} website homepage`} className="aspect-[2467/1297] h-full w-full object-contain object-top" />
                </div>
                <div className="flex flex-col p-7 sm:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#fe8c58]">{copy.proof.label}</p>
                  <h3 className="mt-3 font-display text-3xl font-bold">{copy.proof.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{copy.proof.body}</p>
                  <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.14em] text-[#fe8c58]">{copy.proof.builtTitle}</p>
                  <ul className="mt-3 space-y-2">
                    {copy.proof.built.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-white/75">
                        <Check size={15} className="mt-0.5 shrink-0 text-[#fe8c58]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://lashcartelcosmetics.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center gap-2 border-b border-white/25 pb-1 text-sm font-semibold transition-colors hover:border-[#fe8c58] hover:text-[#fe8c58]"
                  >
                    {copy.proof.openStore}
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-5 rounded-[26px] border border-white/12 px-6 py-7 sm:px-8">
              <span className="shrink-0 font-serif text-5xl leading-none text-[#fe8c58]" dir="ltr">{copy.proof.leads}</span>
              <span className="text-sm leading-snug text-white/62">{copy.proof.leadsLabel}</span>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-36 bg-[#FAFAF7] py-20 sm:py-28">
          <div className="content-width">
            <p className={`${eye} text-accent`}>{copy.faq.eyebrow}</p>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em]">{copy.faq.title}</h2>
            <div className="mt-10 divide-y divide-border border-y border-border">
              {copy.faq.items.map((item, index) => (
                <details key={item.q} className="group py-1" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 font-display text-lg font-bold">
                    <span>{item.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-3xl pb-6 pe-12 text-sm leading-relaxed text-muted-fg">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="bg-[#FAFAF7] pb-20 sm:pb-28">
          <div className="content-width">
            <div className="relative overflow-hidden rounded-[32px] bg-[#1B3B2B] px-7 py-12 text-white sm:px-12 sm:py-16">
              <div aria-hidden className="absolute -end-24 -top-32 h-80 w-80 rounded-full bg-[#ff5c2a]/25 blur-[90px]" />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className={`${eye} text-[#fe8c58]`}>{copy.cta.eyebrow}</p>
                  <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.25rem,5.5vw,4.4rem)] font-bold leading-[0.95] tracking-[-0.05em]">{copy.cta.title}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">{copy.cta.body}</p>
                  <PhoneLine ar={ar} className="mt-4 text-sm text-white/60" />
                </div>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackLeadFormConversion}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#1B3B2B] transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={17} />
                  {copy.cta.button}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}
