import { type ReactNode } from 'react'

export default function MacChrome({
  url,
  label,
  children,
  compact = false,
  dark = true,
}: {
  url: string
  label?: string
  children: ReactNode
  compact?: boolean
  dark?: boolean
}) {
  return (
    <div
      className={`shot-frame relative overflow-hidden rounded-xl border shadow-[0_28px_60px_-28px_rgba(0,0,0,0.85)] ${
        dark ? 'border-white/12 bg-[#1c1c1e]' : 'border-black/10 bg-[#e8e8ed]'
      }`}
    >
      <div className={`flex items-center gap-2 border-b ${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'} ${dark ? 'border-white/10' : 'border-black/10'}`}>
        <span className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} rounded-full bg-[#FF5F57]`} />
        <span className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} rounded-full bg-[#FEBC2E]`} />
        <span className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} rounded-full bg-[#28C840]`} />
        <p
          className={`ms-1 min-w-0 flex-1 truncate rounded-md px-2 py-0.5 text-center font-mono text-[10px] ${
            dark ? 'bg-black/30 text-white/45' : 'bg-white/80 text-black/45'
          }`}
          dir="ltr"
        >
          {url}
        </p>
        {label ? (
          <span className={`hidden shrink-0 font-mono text-[10px] uppercase tracking-wider sm:inline ${dark ? 'text-white/35' : 'text-black/35'}`}>
            {label}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  )
}
