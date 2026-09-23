const LEAD_FORM_CONVERSION = 'AW-18455548368/EJHKCPznr_0cENCjpeBE'

/** Google Ads "Submit lead form" conversion. No-ops if gtag has not loaded. */
export function trackLeadFormConversion() {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', 'conversion', {
    send_to: LEAD_FORM_CONVERSION,
    value: 1.0,
    currency: 'EGP',
  })
}
