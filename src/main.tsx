import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import DefaultSeo from './components/DefaultSeo'
import App from './App'
import { frEgToAr } from './legacyFrEgRedirect'
import { LocaleProvider } from './i18n/LocaleProvider'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Start from './pages/Start'

/**
 * autoleadss.com is an AGENCY SITE. It has no accounts, no login, no dashboard
 * and no self-serve product.
 *
 * The self-serve platform (Clerk auth, the funnel builder under /app, the
 * published-funnel host at /p/:slug, the SaaS pricing tiers, and every
 * serverless function under api/) was removed on 2026-08-15. It is recoverable
 * from git history if it is ever wanted back; nothing here depends on it.
 *
 * What that removal also bought:
 *  - No Clerk publishable key, no auth provider, no session handling.
 *  - No serverless functions, so no Vercel function-count ceiling and no
 *    database env vars to hold.
 *  - A visitor cannot land anywhere that asks them to sign in, which was the
 *    point: the site sells a service, it is not the service.
 *
 * Routes that used to exist and now legitimately 404: /app*, /login, /signup,
 * /pricing, /p/:slug. They are also Disallowed in public/robots.txt so nothing
 * keeps asking for them.
 */

// Any bookmarked/shared /fr-eg/... URL from before the Franco locale was
// removed — see legacyFrEgRedirect.ts for why /ar and not a 404.
function FrEgRedirect() {
  const location = useLocation()
  return <Navigate to={frEgToAr(location.pathname, location.search, location.hash)} replace />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      {/* Mounted first and outside the router so it applies on EVERY route.
          Route-level <Helmet>s mount after it and win — Helmet resolves meta by
          name/property, last mount takes precedence. Without this baseline, a
          route that sets no meta would have index.html's marked defaults
          deleted with nothing to replace them. See DefaultSeo.tsx. */}
      <DefaultSeo />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* The bare "/" fallback passes persist={false} so its hardcoded
                "en" default never overwrites a language the user already chose
                (see LocaleProvider's `persist` doc). */}
            <Route path="/" element={<LocaleProvider locale="en" persist={false}><App /></LocaleProvider>} />
            <Route path="/en/*" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
            <Route path="/ar/*" element={<LocaleProvider locale="ar"><App /></LocaleProvider>} />
            <Route path="/fr-eg/*" element={<FrEgRedirect />} />

            {/* Legal pages — one per locale, take priority over the /:locale/* wildcard above */}
            <Route path="/en/privacy" element={<LocaleProvider locale="en"><Privacy /></LocaleProvider>} />
            <Route path="/en/terms" element={<LocaleProvider locale="en"><Terms /></LocaleProvider>} />
            <Route path="/ar/privacy" element={<LocaleProvider locale="ar"><Privacy /></LocaleProvider>} />
            <Route path="/ar/terms" element={<LocaleProvider locale="ar"><Terms /></LocaleProvider>} />

            {/* Onboarding: brief → payment → WhatsApp handoff. Descriptive URL
                on purpose — /start reads as what it is in a search result. */}
            <Route path="/en/start" element={<LocaleProvider locale="en"><Start /></LocaleProvider>} />
            <Route path="/ar/start" element={<LocaleProvider locale="ar"><Start /></LocaleProvider>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
