import { lazy } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import App from './App'
import { LocaleProvider } from './i18n/LocaleProvider'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import DemoRedirect from './pages/DemoRedirect'
import PricingPage from './pages/PricingPage'

const DemoPage = lazy(() => import('./pages/DemoPage'))
const VerticalLanding = lazy(() => import('./pages/VerticalLanding'))
const PilotStorefront = lazy(() => import('./pages/PilotStorefront'))
const PilotAdmin = lazy(() => import('./pages/PilotAdmin'))
const PilotsIndex = lazy(() => import('./pages/PilotsIndex'))
const WorkIndex = lazy(() => import('./pages/WorkIndex'))
const MembershipFlowDemoPage = lazy(() => import('./pages/MembershipFlowDemoPage'))
const PackagesPage = lazy(() => import('./pages/PackagesPage'))
const GuidedShowcasePage = lazy(() => import('./pages/GuidedShowcasePage'))
const OnCallPage = lazy(() => import('./pages/OnCallPage'))

/** One route table shared by the browser bundle and the build-time pre-renderer. */
export default function AppRoutes() {
  return (
        <Routes>
          <Route path="/" element={<LocaleProvider locale="en" persist={false}><App /></LocaleProvider>} />
          <Route path="/demo/:kind" element={<DemoRedirect />} />
          <Route path="/showroom" element={<Navigate to="/en/showroom" replace />} />
          <Route path="/en/showroom" element={<LocaleProvider locale="en"><GuidedShowcasePage /></LocaleProvider>} />
          <Route path="/ar/showroom" element={<LocaleProvider locale="ar"><GuidedShowcasePage /></LocaleProvider>} />
          <Route path="/en/demo/membership-flow" element={<LocaleProvider locale="en"><MembershipFlowDemoPage /></LocaleProvider>} />
          <Route path="/ar/demo/membership-flow" element={<LocaleProvider locale="ar"><MembershipFlowDemoPage /></LocaleProvider>} />
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
          <Route path="/packages" element={<Navigate to="/en/packages" replace />} />
          <Route path="/en/packages" element={<LocaleProvider locale="en"><PackagesPage /></LocaleProvider>} />
          <Route path="/ar/packages" element={<LocaleProvider locale="ar"><PackagesPage /></LocaleProvider>} />
          <Route path="/work" element={<Navigate to="/en/work" replace />} />
          <Route path="/en/work" element={<LocaleProvider locale="en"><WorkIndex /></LocaleProvider>} />
          <Route path="/ar/work" element={<LocaleProvider locale="ar"><WorkIndex /></LocaleProvider>} />
          <Route path="/pilots" element={<Navigate to="/en/pilots" replace />} />
          <Route path="/en/pilots" element={<LocaleProvider locale="en"><PilotsIndex /></LocaleProvider>} />
          <Route path="/ar/pilots" element={<LocaleProvider locale="ar"><PilotsIndex /></LocaleProvider>} />
          <Route path="/en/pilot/:slug/admin" element={<LocaleProvider locale="en"><PilotAdmin /></LocaleProvider>} />
          <Route path="/ar/pilot/:slug/admin" element={<LocaleProvider locale="ar"><PilotAdmin /></LocaleProvider>} />
          <Route path="/en/pilot/:slug" element={<LocaleProvider locale="en"><PilotStorefront /></LocaleProvider>} />
          <Route path="/ar/pilot/:slug" element={<LocaleProvider locale="ar"><PilotStorefront /></LocaleProvider>} />
          <Route path="/on-call" element={<Navigate to="/en/on-call" replace />} />
          <Route path="/en/on-call" element={<LocaleProvider locale="en"><OnCallPage /></LocaleProvider>} />
          <Route path="/ar/on-call" element={<LocaleProvider locale="ar"><OnCallPage /></LocaleProvider>} />
          <Route path="/en/:slug" element={<LocaleProvider locale="en"><VerticalLanding /></LocaleProvider>} />
          <Route path="/en" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
          <Route path="/ar" element={<LocaleProvider locale="ar"><App /></LocaleProvider>} />
          <Route path="/en/*" element={<LocaleProvider locale="en"><App /></LocaleProvider>} />
          <Route path="/ar/*" element={<LocaleProvider locale="ar"><App /></LocaleProvider>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
  )
}
