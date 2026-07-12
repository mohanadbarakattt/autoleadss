import React from 'react';

export interface MbaiBadgeProps {
  /** 'light' = badge tuned for a light footer background; 'dark' = for a dark footer background */
  variant?: 'light' | 'dark';
  className?: string;
}

/**
 * MBAI Solutions badge — solid rounded-square "MB" chip + wordmark "An MBAI Solutions product"
 * Links to https://mbai-group.com
 * Self-contained SVG, no external dependencies
 */
export const MbaiBadge: React.FC<MbaiBadgeProps> = ({ variant = 'light', className }) => {
  const ink = variant === 'dark' ? '#ffffff' : '#111111';
  const inv = variant === 'dark' ? '#111111' : '#ffffff';

  return (
    <a
      href="https://mbai-group.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="An MBAI Solutions product"
      className={className}
      style={{ display: 'inline-flex', textDecoration: 'none' }}
    >
      <svg
        width="182"
        height="28"
        viewBox="0 0 182 28"
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
          An MBAI Solutions product
        </text>
      </svg>
    </a>
  );
};

export default MbaiBadge;
