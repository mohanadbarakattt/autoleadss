import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleProvider'

export const LASH_ACCESS_CODE = 'cartel'
export const LASH_GATE_KEY = 'al-lashes-unlock'

const COPY = {
  en: {
    label: 'Access code',
    enter: 'Enter',
    error: 'That code doesn’t open it.',
    back: 'Back',
  },
  ar: {
    label: 'كود الدخول',
    enter: 'دخول',
    error: 'الكود مش صح.',
    back: 'رجوع',
  },
} as const

export function isLashUnlocked() {
  try {
    return sessionStorage.getItem(LASH_GATE_KEY) === 'ok'
  } catch {
    return false
  }
}

export function unlockLash() {
  try {
    sessionStorage.setItem(LASH_GATE_KEY, 'ok')
  } catch {
    /* ignore */
  }
}

export default function LashGate({ onUnlock }: { onUnlock: () => void }) {
  const { locale, localePath } = useLocale()
  const t = COPY[locale]
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (code.trim().toLowerCase() === LASH_ACCESS_CODE) {
      unlockLash()
      onUnlock()
      return
    }
    setError(true)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: '#0B0A0C', color: '#F6F0E8' }}>
      <div className="w-full max-w-sm text-center">
        <p className="font-serif text-3xl italic tracking-tight">Lash Cartel</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#E8C9A8]/70">{t.label}</p>
        <form className="mt-8 grid gap-3" onSubmit={onSubmit}>
          <input
            type="password"
            name="access-code"
            autoComplete="off"
            value={code}
            onChange={e => {
              setCode(e.target.value)
              setError(false)
            }}
            aria-label={t.label}
            className="rounded-full border border-[#E8C9A8]/30 bg-transparent px-5 py-3 text-center text-sm tracking-[0.2em] outline-none focus:border-[#E8C9A8]"
          />
          <button
            type="submit"
            className="rounded-full bg-[#E8C9A8] px-5 py-3 text-sm font-semibold text-[#14110E]"
          >
            {t.enter}
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-[#E8C9A8]">{t.error}</p> : null}
        <Link to={localePath()} className="mt-10 inline-block text-xs text-white/35 hover:text-white/70">
          {t.back}
        </Link>
      </div>
    </div>
  )
}
