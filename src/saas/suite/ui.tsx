import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

/** Champagne-gold CTA — matches al-hub.html's `.btn`. `disabled` renders a real
 * `<button disabled>` (not a styled-but-clickable div), so a "coming soon" CTA is
 * genuinely inert, not just visually muted. */
export function GoldButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-[11px] bg-suite-gold px-[22px] py-3 text-sm font-semibold text-[#1c150a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:opacity-60 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Bordered, radius-16px panel — the base surface for a non-interactive suite card
 * (see ToolCard's "soon" tiles below). */
export function Panel({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-suite-line bg-suite-panel ${className}`} {...rest}>
      {children}
    </div>
  )
}

/** 11px uppercase gold eyebrow — matches al-hub.html's `.tag`. */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-suite-gold">{children}</span>
}

/** Small green "live" indicator — matches al-hub.html's `.dot`. */
export function StatusDot() {
  return <span aria-hidden data-live-dot className="h-1.5 w-1.5 rounded-full bg-suite-ok" />
}

/**
 * A tool tile. `status="live"` renders as a real navigable Link (hover lift + border
 * lighten, per al-hub.html's `.tool:hover`); `status="soon"` renders as a plain,
 * non-interactive, aria-disabled div — no href, no live dot. This is the mechanism
 * behind the Hub's honest-status guard (see Hub.test.tsx).
 */
export function ToolCard({
  testId,
  icon: Icon,
  name,
  description,
  status,
  statusLabel,
  href,
}: {
  testId?: string
  icon: LucideIcon
  name: string
  description: string
  status: 'live' | 'soon'
  statusLabel: string
  href?: string
}) {
  const body = (
    <>
      <div className="mb-3.5 flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-suite-line bg-suite-panel2 text-suite-gold-l">
        <Icon size={20} strokeWidth={1.6} />
      </div>
      <p className="font-luxe text-xl font-semibold text-suite-text">{name}</p>
      <p className="mt-0.5 text-[13px] text-suite-muted">{description}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-suite-muted">
        {status === 'live' && <StatusDot />}
        {statusLabel}
      </div>
    </>
  )

  if (status === 'live' && href) {
    return (
      <Link
        to={href}
        data-testid={testId}
        data-status={status}
        className="block rounded-2xl border border-suite-line bg-suite-panel p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#3a3d49]"
      >
        {body}
      </Link>
    )
  }

  return (
    <Panel data-testid={testId} data-status={status} aria-disabled="true" className="p-5 opacity-70">
      {body}
    </Panel>
  )
}
