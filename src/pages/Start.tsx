import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Check, Copy, ShieldCheck, MessageCircle } from 'lucide-react'
import { useT, useLocale } from '../i18n/LocaleProvider'
import { packagePrice } from '../agency/offer'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

const WHATSAPP_NUMBER = '201100054278'
const EMAIL = 'info@autoleadss.com'
/** wa.me silently truncates very long prefills, so the brief is capped and the
 * Copy button is offered as the lossless path. */
const WA_TEXT_LIMIT = 1800

/**
 * The onboarding page — brief → payment → handoff.
 *
 * WHY THERE IS NO BACKEND HERE. autoleadss.com has no server: the SaaS and
 * every serverless function were removed on 2026-08-15. So this form does not
 * POST anywhere. It assembles what the client typed into a formatted brief and
 * hands it to WhatsApp (or the clipboard, or email), which is also how these
 * deals actually close in this market — and it means the proof-of-payment
 * screenshot rides along in the same thread as the answers instead of being
 * uploaded somewhere and separated from them.
 *
 * TWO THINGS DELIBERATELY ABSENT, both non-negotiable:
 *
 *  1. NO CARD FIELDS. There is no card number, no CVV, no billing form
 *     anywhere on this page and there must never be one. The client pays
 *     through their own bank or a payment link and sends a receipt. A
 *     marketing site with no server has no business touching card data, and
 *     the copy says out loud that we never ask for it — so that anyone
 *     phishing our clients is easier to spot.
 *  2. NO PUBLISHED ACCOUNT DETAILS. Bank/IBAN details are not in this
 *     codebase. Publishing them invites impersonation, and they are not mine
 *     to invent — they are given on the call. See t.onboarding.payDetailsPending.
 */
export default function Start() {
  const t = useT()
  const { locale, isRTL } = useLocale()
  const o = t.onboarding
  const price = packagePrice()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const set = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }))

  /** The brief, as plain text — the same string for WhatsApp, clipboard and email. */
  const brief = useMemo(() => {
    const lines: string[] = [`*${o.briefHeading}*`, '']
    for (const section of o.sections) {
      lines.push(`— ${section.title} —`)
      for (const f of section.fields) {
        const v = (answers[f.id] ?? '').trim()
        lines.push(`${f.label}: ${v || o.notAnswered}`)
      }
      lines.push('')
    }
    return lines.join('\n').trim()
  }, [answers, o])

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(brief.slice(0, WA_TEXT_LIMIT))}`
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(o.briefHeading)}&body=${encodeURIComponent(brief)}`

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard blocked — the WhatsApp and email paths still work */
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet defer={false}>
        <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} />
        <title>{`${o.title} — AutoLeadss`}</title>
        <meta name="description" content={o.sub} />
        <link rel="canonical" href={`https://autoleadss.com/${locale}/start`} />
      </Helmet>

      <Navigation />

      <main className="content-width max-w-[880px] py-28 sm:py-32">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <p className="eyebrow text-accent">{o.eyebrow}</p>
          </div>
          <h1 className="font-display font-bold" style={{ fontSize: 'clamp(2.1rem, 4.6vw, 3.2rem)', letterSpacing: '-0.03em', lineHeight: 1.06 }}>
            {o.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-fg">{o.sub}</p>
        </motion.header>

        {/* ---------- the three steps ---------- */}
        <ol className="mb-16 grid gap-4 sm:grid-cols-3">
          {o.steps.map((s) => (
            <li key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 font-display text-sm font-bold text-accent">
                {s.n}
              </span>
              <p className="font-display text-lg font-bold">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-fg">{s.body}</p>
            </li>
          ))}
        </ol>

        {/* ---------- the brief ---------- */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold" style={{ letterSpacing: '-0.025em' }}>{o.formTitle}</h2>
          <p className="mt-2 text-sm text-muted-fg">{o.formSub}</p>

          <div className="mt-8 flex flex-col gap-10">
            {o.sections.map((section) => (
              <fieldset key={section.title} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <legend className="px-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-accent">
                  {section.title}
                </legend>
                <div className="mt-4 grid gap-5">
                  {section.fields.map((f) => (
                    <label key={f.id} className="block">
                      <span className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-foreground">
                        {f.label}
                        {f.req && <span className="text-[11px] font-normal text-accent">{o.required}</span>}
                      </span>
                      {f.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={answers[f.id] ?? ''}
                          onChange={(e) => set(f.id, e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-fg/60 focus:border-accent"
                        />
                      ) : (
                        <input
                          type="text"
                          value={answers[f.id] ?? ''}
                          onChange={(e) => set(f.id, e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-fg/60 focus:border-accent"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        {/* ---------- payment ---------- */}
        <section className="mb-14 rounded-2xl border border-accent/40 bg-accent/[0.04] p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold" style={{ letterSpacing: '-0.025em' }}>{o.payTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-fg">{o.payBody}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-3xl font-bold">{price.amount}</span>
            <span className="text-sm text-muted-fg">{t.pricingTeaser.mo}</span>
            <span className="text-sm font-medium text-accent">
              {t.pricingTeaser.adSpendNote.replace('{adSpend}', price.adSpend)}
            </span>
          </div>

          {/* Account details are NOT published here — see the file header. */}
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">{o.payDetailsTitle}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-fg">{o.payDetailsPending}</p>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-card p-5">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-sm leading-relaxed text-muted-fg">{o.paySafety}</p>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">{o.proofTitle}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-fg">{o.proofBody}</p>
          </div>
        </section>

        {/* ---------- send ---------- */}
        <section className="mb-14 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold" style={{ letterSpacing: '-0.025em' }}>{o.sendTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-fg">{o.sendBody}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(255,92,42,0.6)]"
            >
              <MessageCircle size={16} />
              {o.sendWa}
            </a>
            <button
              type="button"
              onClick={copyBrief}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
              {copied ? o.copied : o.copyBrief}
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-fg">
            <a href={mailHref} className="underline underline-offset-2 hover:text-accent">{o.emailInstead}</a>
          </p>
        </section>

        {/* ---------- after / questions ---------- */}
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold">{o.afterTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-fg">{o.afterBody}</p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold">{o.questionsTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-fg">{o.questionsBody}</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              {o.questionsCta}
              <span>{isRTL ? '←' : '→'}</span>
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
