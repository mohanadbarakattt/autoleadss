import { useEffect, useState } from 'react'
import { useLocale } from '../i18n/LocaleProvider'

const STORAGE_KEY = 'autoleadss-cookie-consent'

type Consent = { essential: true; analytics: boolean; ts: number }

/** Reads the stored consent choice, if any (null = not yet decided). */
export function getConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Consent) : null
  } catch {
    return null
  }
}

/** Gate for future analytics/pixel scripts: only load them once the user opted in. */
export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true
}

function save(analytics: boolean) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics, ts: Date.now() }))
}

export default function CookieConsent() {
  const { t, isRTL } = useLocale()
  const c = t.cookieConsent
  const [visible, setVisible] = useState(false)
  const [manage, setManage] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    if (!getConsent()) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card"
    >
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <p className="text-sm text-foreground">{c.body}</p>

        {manage && (
          <label className="mt-3 flex items-center gap-2 text-sm text-muted-fg">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-accent"
            />
            {c.analyticsLabel}
          </label>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { save(true); setVisible(false) }}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-2"
          >
            {c.acceptAll}
          </button>
          <button
            type="button"
            onClick={() => { save(false); setVisible(false) }}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {c.rejectAll}
          </button>
          {manage ? (
            <button
              type="button"
              onClick={() => { save(analytics); setVisible(false) }}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {c.saveChoices}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setManage(true)}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-fg hover:bg-muted"
            >
              {c.manage}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
