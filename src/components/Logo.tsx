type LogoProps = {
  /** 'dark' renders the wordmark for dark backgrounds, 'light' for light backgrounds */
  variant?: 'dark' | 'light'
  size?: number
  withWordmark?: boolean
  className?: string
}

/**
 * AutoLeadss mark: a funnel converging into a lead-dot — the brand story in one shape.
 */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="al-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7A4D" />
          <stop offset="1" stopColor="#FF5C2A" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#al-grad)" />
      {/* funnel bars converging into a lead dot */}
      <path d="M12 14h24l-4.4 6H16.4L12 14Z" fill="#FFFFFF" />
      <path d="M17.6 24.5h12.8L27 30.5h-6l-3.4-6Z" fill="#FFFFFF" fillOpacity="0.82" />
      <circle cx="24" cy="36.5" r="3.2" fill="#FFFFFF" />
    </svg>
  )
}

export default function Logo({ variant = 'light', size = 30, withWordmark = true, className = '' }: LogoProps) {
  const textColor = variant === 'dark' ? '#FAFAF7' : '#0A0A0B'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span
          className="font-display font-bold leading-none"
          style={{ color: textColor, fontSize: size * 0.62, letterSpacing: '-0.02em' }}
        >
          AutoLeadss<span style={{ color: '#FF5C2A' }}>.</span>
        </span>
      )}
    </span>
  )
}
