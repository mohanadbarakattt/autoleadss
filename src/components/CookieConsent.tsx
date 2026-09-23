import { useEffect, useState } from 'react'
import { useLocale } from '../i18n/LocaleProvider'

const STORAGE_KEY = 'mbai-cookie-consent'
const CONSENT_EVENT = 'al-consent'

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

export function useCookieDecided() {
  const [decided, setDecided] = useState(() => !!getConsent())
  useEffect(() => {
    const sync = () => setDecided(!!getConsent())
    window.addEventListener(CONSENT_EVENT, sync)
    return () => window.removeEventListener(CONSENT_EVENT, sync)
  }, [])
  return decided
}

function save(analytics: boolean) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics, ts: Date.now() }))
  window.dispatchEvent(new CustomEvent('autoleadss:consent', { detail: { analytics } }))
  window.dispatchEvent(new Event(CONSENT_EVENT))
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
      className="fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-4xl rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-md sm:left-6 sm:right-6"
    >
      <div className="px-4 py-3 sm:flex sm:items-center sm:gap-5 sm:px-5">
        <p className="min-w-0 flex-1 text-sm text-foreground">{c.body}</p>

        {manage && (
          <label className="mt-3 flex items-center gap-2 text-sm text-muted-fg">
            <input
              type="checkbox"
              checked={analytics}
              onChange={e => setAnalytics(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-accent"
            />
            {c.analyticsLabel}
          </label>
        )}

        <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0">
          <button
            type="button"
            onClick={() => {
              save(true)
              setVisible(false)
            }}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-2"
          >
            {c.acceptAll}
          </button>
          <button
            type="button"
            onClick={() => {
              save(false)
              setVisible(false)
            }}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {c.rejectAll}
          </button>
          {manage ? (
            <button
              type="button"
              onClick={() => {
                save(analytics)
                setVisible(false)
              }}
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
