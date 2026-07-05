import type { ReactNode } from 'react'

/** macOS-style browser window chrome. Children render inside the viewport. */
export function BrowserFrame({ url, children, className = '' }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_30px_70px_-30px_rgba(10,10,11,0.45)] ${className}`} dir="ltr">
      <div className="flex items-center gap-3 border-b border-black/10 bg-[#f6f5f2] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex w-full max-w-[280px] items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[11px] text-black/50">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M12 2a7 7 0 0 0-7 7v2H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1V9a7 7 0 0 0-7-7Zm-5 9V9a5 5 0 0 1 10 0v2H7Z" fill="#28c840" />
          </svg>
          {url}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}

/** iPhone-style device frame. Children render inside the screen. */
export function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[2.4rem] border border-black/10 bg-[#0A0A0B] p-2.5 shadow-[0_40px_90px_-30px_rgba(10,10,11,0.6)] ${className}`} dir="ltr">
      <div className="relative overflow-hidden rounded-[1.9rem] bg-white">
        {/* notch */}
        <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[#0A0A0B]" />
        {children}
      </div>
    </div>
  )
}
