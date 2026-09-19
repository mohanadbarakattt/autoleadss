import { Helmet } from 'react-helmet-async'
import Logo from '../components/Logo'
import SeoIcons from '../components/SeoIcons'
import { SITE, waLink } from '../site'

export default function NotFound() {
  const wa = waLink('Hi AutoLeadss, I landed on a missing page and want a quote.')
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center" style={{ background: '#0A0A0B' }}>
      <Helmet defer={false}>
        <title>Page not found — {SITE.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <SeoIcons />
      <div aria-hidden className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,92,42,0.18) 0%, transparent 70%)' }} />
      <div className="relative z-10 flex flex-col items-center">
        <Logo variant="dark" size={36} />
        <p className="mt-10 font-display font-bold text-gradient-accent" style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', lineHeight: 1 }}>
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
          This page took a wrong turn.
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/60">
          The link might be broken or the page may have moved.
        </p>
        <p className="mt-1 max-w-md text-sm text-white/40" dir="rtl">
          الرابط غير صحيح أو الصفحة انتقلت.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="/en" className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5">
            Back to homepage
          </a>
          <a href="/ar" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white/90">
            الصفحة الرئيسية
          </a>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-6 text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
          WhatsApp a quote
        </a>
      </div>
    </div>
  )
}
