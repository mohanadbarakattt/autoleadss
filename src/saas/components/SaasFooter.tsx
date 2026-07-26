import MbaiBadge from '../../components/MbaiBadge'
import { useI18n } from '../i18n'

const LEGAL_LABEL = {
  en: { privacy: 'Privacy Policy', terms: 'Terms of Service' },
  ar: { privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة' },
} as const

export default function SaasFooter() {
  const { locale } = useI18n()
  // The SaaS locale is a separate, route-less i18n system — link to the matching
  // locale-prefixed marketing legal page. UILocale and the marketing site's
  // locale prefixes are the same two values, so this is just `locale` itself.
  const marketingLocale = locale
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-border bg-card px-5 py-4">
      <div className="flex items-center gap-4">
        <a href={`/${marketingLocale}/privacy`} className="text-xs text-muted-fg transition-colors hover:text-foreground">{LEGAL_LABEL[locale].privacy}</a>
        <a href={`/${marketingLocale}/terms`} className="text-xs text-muted-fg transition-colors hover:text-foreground">{LEGAL_LABEL[locale].terms}</a>
      </div>
      <MbaiBadge variant="light" />
    </footer>
  )
}
