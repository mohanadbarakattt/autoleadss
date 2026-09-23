import { MessageCircle } from 'lucide-react'
import { useLocale } from '../i18n/LocaleProvider'
import type { Demo } from '../demos/data'
import MacChrome from './MacChrome'

export default function DemoPreview({ demo, compact = false }: { demo: Demo; compact?: boolean }) {
  const { locale } = useLocale()
  const c = demo.copy[locale]
  const dark = demo.bg.startsWith('#0') || demo.bg.startsWith('#1')

  return (
    <MacChrome url={demo.url} label={c.kind} compact={compact}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={demo.img} alt={`${c.kind} website — ${c.brand}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: dark
              ? 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.82) 100%)'
              : 'linear-gradient(180deg, rgba(20,16,12,0.18) 0%, rgba(20,16,12,0.35) 50%, rgba(20,16,12,0.78) 100%)',
          }}
        />
        <div className={`relative flex h-full flex-col ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
          <div className="flex items-center justify-between gap-2">
            <p className={`font-display font-bold text-white ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>{c.brand}</p>
            <span
              className={`rounded-full font-medium text-black ${compact ? 'px-2 py-0.5 text-[8px]' : 'px-2.5 py-1 text-[10px]'}`}
              style={{ background: demo.accent }}
            >
              {c.navBook}
            </span>
          </div>
          <div className="mt-auto max-w-[90%]">
            <p
              className={`font-display font-bold leading-[1.08] text-white ${compact ? 'text-sm sm:text-base' : 'text-lg sm:text-2xl'}`}
            >
              {c.headline}
            </p>
            {!compact && <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-white/75 sm:text-xs">{c.sub}</p>}
          </div>
        </div>
        <span
          className={`absolute bottom-3 end-3 flex items-center justify-center rounded-full text-black shadow-md ${compact ? 'h-7 w-7' : 'h-8 w-8'}`}
          style={{ background: demo.accent }}
          aria-hidden
        >
          <MessageCircle size={compact ? 12 : 14} />
        </span>
      </div>
    </MacChrome>
  )
}
