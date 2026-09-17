import React from 'react'

export interface MbaiBadgeProps {
  variant?: 'light' | 'dark'
  className?: string
}

/**
 * MBAI Group badge — "MB" chip + wordmark. Links to the studio site.
 */
export const MbaiBadge: React.FC<MbaiBadgeProps> = ({ variant = 'light', className }) => {
  const ink = variant === 'dark' ? '#ffffff' : '#111111'
  const inv = variant === 'dark' ? '#111111' : '#ffffff'

  return (
    <a
      href="https://mbai-group.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="MB AI Group"
      className={className}
      style={{ display: 'inline-flex', textDecoration: 'none' }}
    >
      <svg
        width="148"
        height="28"
        viewBox="0 0 148 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
      >
        <rect x="0" y="3" width="22" height="22" rx="6" fill={ink} />
        <text
          x="11"
          y="18"
          textAnchor="middle"
          fontFamily="'Space Grotesk', Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="10"
          letterSpacing="-0.5"
          fill={inv}
        >
          MB
        </text>
        <text
          x="30"
          y="17"
          direction="ltr"
          textAnchor="start"
          fontFamily="Helvetica, Arial, sans-serif"
          fontWeight="600"
          fontSize="9.5"
          fill={ink}
        >
          MB AI Group
        </text>
      </svg>
    </a>
  )
}

export default MbaiBadge
