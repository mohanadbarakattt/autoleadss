import type { UILocale } from '../i18n'

const LABEL: Record<UILocale, string> = { en: 'EN', ar: 'AR', 'fr-eg': 'FRN' }
const LOCALES: UILocale[] = ['en', 'ar', 'fr-eg']

/** Compact 3-way EN / AR / Franco pill switcher for the SaaS app — mirrors the
 * marketing site's Navigation switcher. `variant="dark"` for dark headers/panels
 * (Pricing hero, AuthForm's dark side panel), `variant="light"` for the app shell. */
export default function LocaleSwitcher({
  locale,
  setLocale,
  variant = 'light',
  size = 'md',
}: {
  locale: UILocale
  setLocale: (l: UILocale) => void
  variant?: 'dark' | 'light'
  size?: 'md' | 'sm'
}) {
  const border = variant === 'dark' ? 'border-white/20' : 'border-border'
  const inactiveText = variant === 'dark' ? 'text-white/70 hover:text-white' : 'text-muted-fg hover:text-foreground'
  const activeBg = variant === 'dark' ? 'bg-white text-[#0A0A0B]' : 'bg-foreground text-background'

  return (
    <div className={`inline-flex items-center gap-0.5 rounded-full border ${border} ${size === 'sm' ? 'p-0.5' : 'p-1'}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-label={`Switch language to ${LABEL[l]}`}
          aria-current={locale === l}
          className={`rounded-full font-sans font-bold tracking-wider transition-colors ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${
            locale === l ? activeBg : inactiveText
          }`}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  )
}
