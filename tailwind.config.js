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
        // Suite v2 registers (namespaced — the marketing site's palette above is untouched).
        // Dark luxe admin register, from .superpowers/al-hub.html.
        suite: {
          bg: '#0c0d11',
          panel: '#15161c',
          panel2: '#1b1d25',
          line: '#282a33',
          text: '#f4f2ec',
          muted: '#95938b',
          gold: '#c9a86a',
          'gold-l': '#e2c690',
          ok: '#4bbf8a',
        },
        // Light editorial-luxury storefront register, from the design spec §5 — tokens only, Phase 4 builds the components.
        store: {
          pearl: '#faf9f5',
          ink: '#1a1815',
          gold: '#a9853f',
        },
      },
      fontFamily: {
        sans: ['Switzer', 'sans-serif'],
        display: ['"General Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        // Suite v2 display/UI faces (namespaced). Arabic RTL fallback (Amiri → IBM Plex
        // Sans Arabic) is handled in src/saas/suite/theme.css, not here.
        luxe: ['"Cormorant Garamond"', 'serif'],
        'luxe-sans': ['Inter', 'sans-serif'],
        'luxe-ar': ['Amiri', 'serif'],
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
