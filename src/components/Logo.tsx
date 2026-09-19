type LogoProps = {
  variant?: 'dark' | 'light'
  size?: number
  withWordmark?: boolean
  className?: string
}

/** A-arrow mark paths in a 394×322 viewBox (traced from the provided brand PNG). */
export const MARK_VIEWBOX = { w: 394, h: 322 } as const
export const MARK_ORANGE = '#FF5C2A'
export const MARK_PATH =
  'M385 9 280 50 310 71 224 188 148 188 194 87 228 154 267 101 220 9 169 9 8 312 77 312 117 243 248 242 354 100 383 118Z M310 182 271 237 313 312 380 312Z'

/** AutoLeadss mark: geometric A with an upward arrow in the right stroke. Orange on transparent — no tile. */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  const height = size
  const width = Math.round((size * MARK_VIEWBOX.w) / MARK_VIEWBOX.h)
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${MARK_VIEWBOX.w} ${MARK_VIEWBOX.h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d={MARK_PATH} fill={MARK_ORANGE} />
    </svg>
  )
}

export default function Logo({ variant = 'light', size = 30, withWordmark = true, className = '' }: LogoProps) {
  const textColor = variant === 'dark' ? '#FAFAF7' : '#0A0A0B'
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span
          className="font-display font-bold leading-none"
          style={{ color: textColor, fontSize: size * 0.62, letterSpacing: '-0.02em' }}
          dir="ltr"
        >
          AutoLeadss<span style={{ color: MARK_ORANGE }}>.</span>
        </span>
      )}
    </span>
  )
}
