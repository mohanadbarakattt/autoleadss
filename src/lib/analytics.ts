import { hasAnalyticsConsent } from '../components/CookieConsent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
const META_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined
let loaded = false

function appendScript(src: string) {
  const script = document.createElement('script')
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

export function loadAnalytics() {
  if (loaded || !hasAnalyticsConsent()) return
  loaded = true

  if (GA_ID) {
    appendScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args)
    window.gtag('js', new Date())
    window.gtag('config', GA_ID, { anonymize_ip: true })
  }

  if (META_ID) {
    const fbq = (...args: unknown[]) => {
      ;(fbq as unknown as { queue: unknown[] }).queue.push(args)
    }
    ;(fbq as unknown as { queue: unknown[] }).queue = []
    window.fbq = fbq
    appendScript('https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', META_ID)
    window.fbq('track', 'PageView')
  }
}

export function track(name: string, params: Record<string, string | number | boolean> = {}) {
  window.gtag?.('event', name, params)
  window.fbq?.('trackCustom', name, params)
}

export function installClickTracking() {
  const handler = (event: MouseEvent) => {
    const link = (event.target as HTMLElement | null)?.closest('a')
    if (!link) return
    const href = link.getAttribute('href') || ''
    if (href.includes('wa.me')) track('whatsapp_click', { location: link.dataset.trackLocation || 'site' })
    else if (href.includes('/demo/')) track('demo_open', { demo: href.split('/').pop() || 'unknown' })
    else if (href.startsWith('mailto:')) track('email_click')
  }
  document.addEventListener('click', handler)
  return () => document.removeEventListener('click', handler)
}
