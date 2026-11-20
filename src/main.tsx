import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import AppRoutes from './routes'
import RouteHead from './components/RouteHead'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <RouteHead />
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0B]" />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
