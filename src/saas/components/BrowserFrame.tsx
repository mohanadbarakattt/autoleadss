import type { ReactNode } from 'react'

export default function BrowserFrame({ url, children, className = '' }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_40px_90px_-40px_rgba(10,10,11,0.55)] ${className}`} dir="ltr">
      <div className="flex items-center gap-3 border-b border-black/10 bg-[#f6f5f2] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex w-full max-w-[260px] items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] text-black/50">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 0 0-7 7v2H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1V9a7 7 0 0 0-7-7Zm-5 9V9a5 5 0 0 1 10 0v2H7Z" fill="#28c840" /></svg>
          {url}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
