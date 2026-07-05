/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF7',
        foreground: '#0A0A0B',
        accent: '#FF5C2A',
        'accent-2': '#FF8A5C',
        ink: '#0A0A0B',
        muted: '#F1EFE9',
        border: '#E2DED4',
        card: '#FFFFFF',
        'muted-fg': '#57544E',
        'text-dim': '#6B6660',
      },
      fontFamily: {
        sans: ['Switzer', 'sans-serif'],
        display: ['"General Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '16px',
        xl: '24px',
        '2xl': '28px',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
}
