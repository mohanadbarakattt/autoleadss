import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import Published from './saas/pages/Published'
import Pricing from './saas/pages/Pricing'

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
          {/* Marketing site (agency / done-with-you) */}
          <Route path="/" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
          <Route path="/en/*" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
          <Route path="/ar/*" element={<LocaleProvider locale="ar"><App /></LocaleProvider>} />

          {/* Self-serve platform (the AI funnel builder) */}
          <Route path="/pricing" element={withSaas(<Pricing />)} />
          <Route path="/login" element={withSaas(<AuthRoute mode="signin" />)} />
          <Route path="/signup" element={withSaas(<AuthRoute mode="signup" />)} />
          <Route path="/app" element={withSaas(<Dashboard />)} />
          <Route path="/app/new" element={withSaas(<Wizard />)} />
          <Route path="/app/funnel/:id" element={withSaas(<Editor />)} />
          <Route path="/app/connect" element={withSaas(<Connect />)} />

          {/* Published funnels */}
          <Route path="/p/:slug" element={withSaas(<Published />)} />

          <Route path="*" element={<Navigate to="/en" replace />} />
        </Routes>
        )}
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
