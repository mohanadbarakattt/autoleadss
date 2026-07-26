import { useEffect, useState } from 'react'
import type { Locale } from '../types'

/** Per-funnel consent key: funnel pages share the /p/:slug origin with the marketing
 * site and with each other, so scope the decision to this funnel's owner-set tracking
 * rather than reusing the marketing site's global key. */
const keyFor = (slug: string) => `autoleadss-funnel-consent:${slug}`

type Consent = { essential: true; analytics: boolean; ts: number }

function read(slug: string): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(keyFor(slug))
    return raw ? (JSON.parse(raw) as Consent) : null
  } catch {
    return null
  }
}

/** Gate for the funnel's GA4/Pixel scripts: only inject once the visitor opted in. */
export function hasFunnelAnalyticsConsent(slug: string): boolean {
  return read(slug)?.analytics === true
}

function save(slug: string, analytics: boolean) {
  // Storage can throw (Chrome/Firefox "block all site data", sandboxed iframe).
  // An uncaught SecurityError here left the banner undismissable forever —
  // the consent decision is still honoured for this page view either way.
  try {
    window.localStorage.setItem(keyFor(slug), JSON.stringify({ essential: true, analytics, ts: Date.now() }))
  } catch {
    /* not persisted — the banner will ask again next visit */
  }
}

// Bilingual copy mirrors the main marketing banner (src/components/CookieConsent.tsx).
const STRINGS: Record<Locale, {
  region: string; body: string; analyticsLabel: string
  acceptAll: string; rejectAll: string; manage: string; saveChoices: string
}> = {
  en: {
    region: 'Cookie consent',
    body: 'We use essential cookies to run this site, and optional cookies for analytics. You can accept or reject anytime.',
    analyticsLabel: 'Analytics (optional) — helps us understand site usage',
    acceptAll: 'Accept all',
    rejectAll: 'Reject non-essential',
    manage: 'Manage',
    saveChoices: 'Save choices',
  },
  ar: {
    region: 'موافقة الكوكيز',
    body: 'بنستخدم كوكيز أساسية عشان الموقع يشتغل، وكوكيز تانية اختيارية للتحليلات. تقدر توافق أو ترفض في أي وقت.',
    analyticsLabel: 'تحليلات (اختياري) — تساعدنا نفهم استخدام الموقع',
    acceptAll: 'موافقة على الكل',
    rejectAll: 'رفض غير الأساسي',
    manage: 'إدارة',
    saveChoices: 'حفظ الاختيار',
  },
}

type Props = {
  slug: string
  accent: string
  language: Locale
  onDecision: (analytics: boolean) => void
}

export default function FunnelCookieConsent({ slug, accent, language, onDecision }: Props) {
  const s = STRINGS[language] ?? STRINGS.en
  const isRTL = language === 'ar'
  const [visible, setVisible] = useState(false)
  const [manage, setManage] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    if (!read(slug)) setVisible(true)
  }, [slug])

  if (!visible) return null

  const decide = (analyticsChoice: boolean) => {
    save(slug, analyticsChoice)
    onDecision(analyticsChoice)
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label={s.region}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white text-[#0A0A0B]"
    >
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <p className="text-sm">{s.body}</p>

        {manage && (
          <label className="mt-3 flex items-center gap-2 text-sm text-black/60">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              style={{ accentColor: accent }}
              className="h-5 w-5 shrink-0"
            />
            {s.analyticsLabel}
          </label>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide(true)}
            style={{ backgroundColor: accent }}
            className="rounded-full px-4 py-2 text-sm font-medium text-white"
          >
            {s.acceptAll}
          </button>
          <button
            type="button"
            onClick={() => decide(false)}
            className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5"
          >
            {s.rejectAll}
          </button>
          {manage ? (
            <button
              type="button"
              onClick={() => decide(analytics)}
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5"
            >
              {s.saveChoices}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setManage(true)}
              className="rounded-full px-4 py-2 text-sm font-medium text-black/60 hover:bg-black/5"
            >
              {s.manage}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
