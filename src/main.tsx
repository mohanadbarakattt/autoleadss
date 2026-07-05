import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'
import { LocaleProvider } from './i18n/LocaleProvider'
import { LocaleProvider as SaasLocaleProvider } from './saas/i18n'
import AuthForm from './saas/components/AuthForm'
import Dashboard from './saas/pages/Dashboard'
import Wizard from './saas/pages/Wizard'
import Editor from './saas/pages/Editor'
import Published from './saas/pages/Published'
import Pricing from './saas/pages/Pricing'

const withSaas = (el: React.ReactNode) => <SaasLocaleProvider>{el}</SaasLocaleProvider>

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Marketing site (agency / done-with-you) */}
          <Route path="/" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
          <Route path="/en/*" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
          <Route path="/ar/*" element={<LocaleProvider locale="ar"><App /></LocaleProvider>} />

          {/* Self-serve platform (the AI funnel builder) */}
          <Route path="/pricing" element={withSaas(<Pricing />)} />
          <Route path="/login" element={withSaas(<AuthForm mode="login" />)} />
          <Route path="/signup" element={withSaas(<AuthForm mode="signup" />)} />
          <Route path="/app" element={withSaas(<Dashboard />)} />
          <Route path="/app/new" element={withSaas(<Wizard />)} />
          <Route path="/app/funnel/:id" element={withSaas(<Editor />)} />

          {/* Published funnels */}
          <Route path="/p/:slug" element={withSaas(<Published />)} />

          <Route path="*" element={<Navigate to="/en" replace />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
