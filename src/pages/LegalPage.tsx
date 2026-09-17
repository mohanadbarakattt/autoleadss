import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useLocale } from '../i18n/LocaleProvider'
import type { LegalDoc } from '../content/legal'
import { SITE } from '../site'
import type { Locale } from '../i18n/translations'

const HTML_LANG: Record<Locale, string> = { en: 'en', ar: 'ar' }

const DRAFT_NOTICE: Record<Locale, string> = {
  en: 'Draft for legal review — not a substitute for advice in your jurisdiction.',
  ar: 'مسودة للمراجعة القانونية — ليست بديلاً عن استشارة في بلدك.',
}

const OTHER_LINK: Record<Locale, { privacy: string; terms: string }> = {
  en: { privacy: 'Privacy Policy', terms: 'Terms of Use' },
  ar: { privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام' },
}

export default function LegalPage({ doc, kind }: { doc: LegalDoc; kind: 'privacy' | 'terms' }) {
  const { locale, isRTL, localePath } = useLocale()
  const otherKind = kind === 'privacy' ? 'terms' : 'privacy'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet defer={false}>
        <html lang={HTML_LANG[locale]} dir={isRTL ? 'rtl' : 'ltr'} />
        <title>{doc.title} — {SITE.name}</title>
        <meta name="description" content={doc.intro} />
        <link rel="canonical" href={`${SITE.origin}${localePath(`/${kind}`)}`} />
      </Helmet>
      <Navigation />
      <main className="section-padding pt-40">
        <div className="content-width max-w-3xl">
          <p className="eyebrow text-accent">{SITE.name}</p>
          <h1 className="mt-3 font-display font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
            {doc.title}
          </h1>
          <p className="mt-2 text-sm text-muted-fg">{doc.updated}</p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/50 bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>{DRAFT_NOTICE[locale]}</p>
          </div>
          <p className="mt-8 leading-relaxed text-foreground/90">{doc.intro}</p>
          <div className="mt-10 flex flex-col gap-9">
            {doc.sections.map((s, i) => (
              <section key={i}>
                <h2 className="font-display text-xl font-bold">{s.heading}</h2>
                <div className="mt-2.5 flex flex-col gap-3">
                  {s.body.map((p, j) => (
                    <p key={j} className="leading-relaxed text-muted-fg">{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-14 border-t border-border pt-6 text-sm">
            <Link to={localePath(`/${otherKind}`)} className="font-medium text-accent hover:underline">
              {OTHER_LINK[locale][otherKind]} →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
