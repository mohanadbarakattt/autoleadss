type SiteShotProps = {
  src: string
  url: string
  alt: string
  className?: string
  compact?: boolean
}

export default function SiteShot({ src, url, alt, className = '', compact = false }: SiteShotProps) {
  return (
    <div className={`shot-frame relative overflow-hidden rounded-xl border border-white/12 bg-[#111113] shadow-[0_28px_60px_-28px_rgba(0,0,0,0.85)] ${className}`}>
      <div className={`flex items-center gap-1.5 border-b border-white/10 ${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'}`}>
        <span className="h-2 w-2 rounded-full bg-[#FF5C2A]" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="ms-2 truncate font-mono text-[10px] text-white/40" dir="ltr">
          {url}
        </span>
      </div>
      <div className="relative overflow-hidden bg-[#111113]">
        <img src={src} alt={alt} loading="lazy" decoding="async" className="block h-auto w-full" />
      </div>
    </div>
  )
}
