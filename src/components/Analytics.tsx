import { useEffect } from 'react'
import { installClickTracking, loadAnalytics } from '../lib/analytics'

export default function Analytics() {
  useEffect(() => {
    loadAnalytics()
    const onConsent = () => loadAnalytics()
    window.addEventListener('autoleadss:consent', onConsent)
    const cleanup = installClickTracking()
    return () => {
      cleanup()
      window.removeEventListener('autoleadss:consent', onConsent)
    }
  }, [])
  return null
}
