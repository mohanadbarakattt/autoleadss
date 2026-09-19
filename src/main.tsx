import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'
import { LocaleProvider } from './i18n/LocaleProvider'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import PricingPage from './pages/PricingPage'
import DemoPage, { DemoRedirect } from './pages/DemoPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LocaleProvider locale="en" persist={false}><App /></LocaleProvider>} />
          <Route path="/demo/:kind" element={<DemoRedirect />} />
          <Route path="/en/demo/:kind" element={<LocaleProvider locale="en"><DemoPage /></LocaleProvider>} />
          <Route path="/ar/demo/:kind" element={<LocaleProvider locale="ar"><DemoPage /></LocaleProvider>} />
          <Route path="/en/privacy" element={<LocaleProvider locale="en"><Privacy /></LocaleProvider>} />
          <Route path="/en/terms" element={<LocaleProvider locale="en"><Terms /></LocaleProvider>} />
          <Route path="/ar/privacy" element={<LocaleProvider locale="ar"><Privacy /></LocaleProvider>} />
          <Route path="/ar/terms" element={<LocaleProvider locale="ar"><Terms /></LocaleProvider>} />
          <Route path="/en/pricing" element={<LocaleProvider locale="en"><PricingPage /></LocaleProvider>} />
          <Route path="/ar/se3r" element={<LocaleProvider locale="ar"><PricingPage /></LocaleProvider>} />
          <Route path="/ar/pricing" element={<LocaleProvider locale="ar"><PricingPage /></LocaleProvider>} />
          <Route path="/pricing" element={<Navigate to="/en/pricing" replace />} />
          <Route path="/en" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
          <Route path="/ar" element={<LocaleProvider locale="ar"><App /></LocaleProvider>} />
          <Route path="/en/*" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
          <Route path="/ar/*" element={<LocaleProvider locale="ar"><App /></LocaleProvider>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
