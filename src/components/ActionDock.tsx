import WhatsAppButton from './WhatsAppButton'
import { useCookieDecided } from './CookieConsent'
import { useLocale } from '../i18n/LocaleProvider'

export default function ActionDock() {
  const { isRTL } = useLocale()
  const decided = useCookieDecided()
  if (!decided) return null
  return (
    <div className={`fixed bottom-6 z-[60] flex items-end gap-2 ${isRTL ? 'left-6' : 'right-6'}`}>
      <WhatsAppButton docked />
    </div>
  )
}
