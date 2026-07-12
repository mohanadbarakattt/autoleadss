import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'
import { LocaleProvider } from './i18n/LocaleProvider'
import { LocaleProvider as SaasLocaleProvider } from './saas/i18n'
import AuthProvider from './saas/auth/AuthProvider'
import AuthRoute from './saas/auth/AuthRoute'
import RemoteBridge from './saas/auth/RemoteBridge'
import { UpgradeProvider } from './saas/billing/UpgradeContext'
import { clerkEnabled } from './saas/config'
import { isFunnelHost } from './saas/publish/host'
import Dashboard from './saas/pages/Dashboard'
import Wizard from './saas/pages/Wizard'
import Editor from './saas/pages/Editor'
import Connect from './saas/pages/Connect'
import Agency from './saas/pages/Agency'
import Published from './saas/pages/Published'
import Pricing from './saas/pages/Pricing'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

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
      <BrowserRouter>
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
          <Route path="/fr-eg/*" element={<LocaleProvider locale="fr-eg"><App /></LocaleProvider>} />

          {/* Legal pages — one per locale, take priority over the /:locale/* wildcard above */}
          <Route path="/en/privacy" element={<LocaleProvider locale="en"><Privacy /></LocaleProvider>} />
          <Route path="/en/terms" element={<LocaleProvider locale="en"><Terms /></LocaleProvider>} />
          <Route path="/ar/privacy" element={<LocaleProvider locale="ar"><Privacy /></LocaleProvider>} />
          <Route path="/ar/terms" element={<LocaleProvider locale="ar"><Terms /></LocaleProvider>} />
          <Route path="/fr-eg/privacy" element={<LocaleProvider locale="fr-eg"><Privacy /></LocaleProvider>} />
          <Route path="/fr-eg/terms" element={<LocaleProvider locale="fr-eg"><Terms /></LocaleProvider>} />

          {/* Self-serve platform (the AI funnel builder) */}
          <Route path="/pricing" element={withSaas(<Pricing />)} />
          <Route path="/login" element={withSaas(<AuthRoute mode="signin" />)} />
          <Route path="/signup" element={withSaas(<AuthRoute mode="signup" />)} />
          <Route path="/app" element={withSaas(<Dashboard />)} />
          <Route path="/app/new" element={withSaas(<Wizard />)} />
          <Route path="/app/funnel/:id" element={withSaas(<Editor />)} />
          <Route path="/app/connect" element={withSaas(<Connect />)} />
          <Route path="/app/agency" element={withSaas(<Agency />)} />

          {/* Published funnels */}
          <Route path="/p/:slug" element={withSaas(<Published />)} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        )}
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
