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
import { LocaleProvider as SaasLocaleProvider } from './saas/i18n'
import AuthProvider from './saas/auth/AuthProvider'
import AuthRoute from './saas/auth/AuthRoute'
import RemoteBridge from './saas/auth/RemoteBridge'
import { UpgradeProvider } from './saas/billing/UpgradeContext'
import { clerkEnabled } from './saas/config'
import { isFunnelHost } from './saas/publish/host'
import Hub from './saas/pages/Hub'
import Start from './saas/pages/Start'
import Products from './saas/pages/Products'
import Leads from './saas/pages/Leads'
import Insights from './saas/pages/Insights'
import Dashboard from './saas/pages/Dashboard'
import Wizard from './saas/pages/Wizard'
import AdSuite from './saas/pages/AdSuite'
import Editor from './saas/pages/Editor'
import Connect from './saas/pages/Connect'
import Whatsapp from './saas/pages/Whatsapp'
import Agency from './saas/pages/Agency'
import Published from './saas/pages/Published'
import Pricing from './saas/pages/Pricing'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

// Any bookmarked/shared /fr-eg/... URL from before the Franco locale was
// removed — see legacyFrEgRedirect.ts for why /ar and not a 404.
function FrEgRedirect() {
  const location = useLocation()
  return <Navigate to={frEgToAr(location.pathname, location.search, location.hash)} replace />
}

// Every SaaS route: optional Clerk provider → locale → Clerk↔store bridge → page.
const withSaas = (el: React.ReactNode) => (
  <AuthProvider>
    <SaasLocaleProvider>
      {clerkEnabled && <RemoteBridge />}
      <UpgradeProvider>{el}</UpgradeProvider>
    </SaasLocaleProvider>
  </AuthProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      {/* Mounted first and outside the router so it applies on EVERY route
          (including the funnel-host branch below). Route-level <Helmet>s mount
          after it and win — Helmet resolves meta by name/property, last mount
          takes precedence. Without this baseline, a route that sets no meta
          would have index.html's marked defaults deleted with nothing to
          replace them. See src/components/DefaultSeo.tsx. */}
      <DefaultSeo />
      <BrowserRouter>
        <ErrorBoundary>
        {isFunnelHost() ? (
          // On a {slug}.autoleadss.site subdomain or a mapped custom domain, the whole site is the funnel.
          <Routes>
            <Route path="*" element={withSaas(<Published />)} />
          </Routes>
        ) : (
        <Routes>
          {/* Marketing site (agency / done-with-you). The bare "/" fallback passes
              persist={false} so its hardcoded "en" default never overwrites a
              language the user already chose (see LocaleProvider's `persist` doc). */}
          <Route path="/" element={<LocaleProvider locale="en" persist={false}><App /></LocaleProvider>} />
          <Route path="/en/*" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
          <Route path="/ar/*" element={<LocaleProvider locale="ar"><App /></LocaleProvider>} />
          <Route path="/fr-eg/*" element={<FrEgRedirect />} />

          {/* Legal pages — one per locale, take priority over the /:locale/* wildcard above */}
          <Route path="/en/privacy" element={<LocaleProvider locale="en"><Privacy /></LocaleProvider>} />
          <Route path="/en/terms" element={<LocaleProvider locale="en"><Terms /></LocaleProvider>} />
          <Route path="/ar/privacy" element={<LocaleProvider locale="ar"><Privacy /></LocaleProvider>} />
          <Route path="/ar/terms" element={<LocaleProvider locale="ar"><Terms /></LocaleProvider>} />

          {/* Self-serve platform (the AI funnel builder) */}
          <Route path="/pricing" element={withSaas(<Pricing />)} />
          <Route path="/login" element={withSaas(<AuthRoute mode="signin" />)} />
          <Route path="/signup" element={withSaas(<AuthRoute mode="signup" />)} />
          <Route path="/app" element={withSaas(<Hub />)} />
          <Route path="/app/start" element={withSaas(<Start />)} />
          <Route path="/app/products" element={withSaas(<Products />)} />
          <Route path="/app/leads" element={withSaas(<Leads />)} />
          <Route path="/app/insights" element={withSaas(<Insights />)} />
          <Route path="/app/pages" element={withSaas(<Dashboard />)} />
          <Route path="/app/new" element={withSaas(<Wizard />)} />
          <Route path="/app/ads" element={withSaas(<AdSuite />)} />
          <Route path="/app/funnel/:id" element={withSaas(<Editor />)} />
          <Route path="/app/connect" element={withSaas(<Connect />)} />
          <Route path="/app/whatsapp" element={withSaas(<Whatsapp />)} />
          <Route path="/app/agency" element={withSaas(<Agency />)} />

          {/* Published funnels */}
          <Route path="/p/:slug" element={withSaas(<Published />)} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        )}
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)