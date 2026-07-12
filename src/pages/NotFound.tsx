import { Helmet } from 'react-helmet-async'
import Logo from '../components/Logo'

/**
 * Branded 404. The whole app is client-rendered (see main.tsx), so this can't send a
 * real HTTP 404 status — but it stops the previous silent `<Navigate to="/en">`
 * soft-redirect, gives the visitor real feedback, and tells crawlers not to index it.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center" style={{ background: '#0A0A0B' }}>
      <Helmet defer={false}>
        <title>Page not found — AutoLeadss</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div aria-hidden className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,92,42,0.18) 0%, transparent 70%)' }} />
      <div aria-hidden className="absolute inset-0 grid-bg-dark" style={{ maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent 75%)' }} />

      <div className="relative z-10 flex flex-col items-center">
        <Logo variant="dark" size={36} />

        <p className="mt-10 font-display font-bold text-gradient-accent" style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', lineHeight: 1 }}>
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
          This page took a wrong turn.
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/60">
          The link might be broken or the page may have moved. Here's how to get back on track.
        </p>
        <p className="mt-1 max-w-md text-sm text-white/40" dir="rtl">
          الرابط غير صحيح أو الصفحة انتقلت. تقدر ترجع من هنا.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="/en" className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(255,92,42,0.6)]">
            Back to homepage
          </a>
          <a href="/ar" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white/90 transition-all duration-300 hover:border-white/50 hover:bg-white/5">
            الصفحة الرئيسية
          </a>
        </div>
        <a href="https://wa.me/201100054278" target="_blank" rel="noopener noreferrer" className="mt-6 text-xs text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline">
          Still stuck? Message us on WhatsApp
        </a>
      </div>
    </div>
  )
}
