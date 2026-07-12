import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useLocale } from '../i18n/LocaleProvider'
import type { LegalDoc } from '../content/legal'

const HTML_LANG: Record<'en' | 'ar' | 'fr-eg', string> = { en: 'en', ar: 'ar', 'fr-eg': 'ar-Latn' }

const DRAFT_NOTICE: Record<'en' | 'ar' | 'fr-eg', string> = {
  en: 'Draft for legal review. This is a solid starting point written from how AutoLeadss actually works today, not a substitute for a qualified lawyer in your jurisdiction before you rely on it.',
  ar: 'مسودة قيد المراجعة القانونية. هذا نص أولي جيد مبني على طريقة عمل AutoLeadss الفعلية حالياً، وليس بديلاً عن محامٍ مختص في بلدك قبل الاعتماد عليه.',
  'fr-eg': 'Draft lessa mesh legally reviewed. Kwayes ka starting point, bas msh badeel 3an mo7amy mokhtas 2abl ma te3tamed 3aleeh.',
}

const OTHER_LINK: Record<'en' | 'ar' | 'fr-eg', { privacy: string; terms: string }> = {
  en: { privacy: 'Privacy Policy', terms: 'Terms of Service' },
  ar: { privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة' },
  'fr-eg': { privacy: 'Privacy Policy', terms: 'Terms of Service' },
}

export default function LegalPage({ doc, kind }: { doc: LegalDoc; kind: 'privacy' | 'terms' }) {
  const { locale, isRTL, localePath } = useLocale()
  const otherKind = kind === 'privacy' ? 'terms' : 'privacy'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet defer={false}>
        <html lang={HTML_LANG[locale]} dir={isRTL ? 'rtl' : 'ltr'} />
        <title>{doc.title} — AutoLeadss</title>
        <meta name="description" content={doc.intro} />
        <link rel="canonical" href={`https://autoleadss.com${localePath(`/${kind}`)}`} />
        <meta property="og:title" content={`${doc.title} — AutoLeadss`} />
        <meta property="og:description" content={doc.intro} />
        <meta property="og:url" content={`https://autoleadss.com${localePath(`/${kind}`)}`} />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navigation />
      <main className="section-padding pt-40">
        <div className="content-width max-w-3xl">
          <p className="eyebrow text-accent">AutoLeadss</p>
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
                <h2 className="font-display text-xl font-bold" style={{ letterSpacing: '-0.01em' }}>{s.heading}</h2>
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
