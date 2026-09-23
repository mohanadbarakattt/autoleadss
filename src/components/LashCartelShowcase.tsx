import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocale, useT } from '../i18n/LocaleProvider'

export const LASH_SHOT_IDS = ['hero', 'sets', 'book', 'chat'] as const
export type LashShotId = (typeof LASH_SHOT_IDS)[number]

function shotSrc(locale: 'en' | 'ar', id: LashShotId) {
  return `/demos/lashes/${locale}-${id}.png`
}

export default function LashCartelShowcase() {
  const t = useT()
  const { locale, localePath } = useLocale()
  const [active, setActive] = useState<LashShotId>('hero')
  const labels = t.examples.shots
  const activeLabel = labels.find(s => s.id === active)?.label ?? active

  return (
    <div>
      <Link to={localePath('/demo/lashes')} className="group block overflow-hidden rounded-xl border border-white/10 bg-[#0B0A0C]">
        <img
          src={shotSrc(locale, active)}
          alt={`${t.examples.items[4]?.name ?? 'Lash Cartel'} — ${activeLabel}`}
          className="aspect-[16/10] w-full object-cover object-top"
        />
      </Link>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {LASH_SHOT_IDS.map(id => {
          const label = labels.find(s => s.id === id)?.label ?? id
          const selected = id === active
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`overflow-hidden rounded-lg border text-start transition-colors ${
                selected ? 'border-accent' : 'border-white/10 hover:border-white/25'
              }`}
            >
              <img src={shotSrc(locale, id)} alt="" className="aspect-[16/10] w-full object-cover object-top" />
              <p className="px-1.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-white/50">{label}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
