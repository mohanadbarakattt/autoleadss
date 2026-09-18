import ChatWidget from './ChatWidget'
import WhatsAppButton from './WhatsAppButton'
import { useLocale } from '../i18n/LocaleProvider'

export default function ActionDock() {
  const { isRTL } = useLocale()
  return (
    <div className={`fixed bottom-6 z-[60] flex items-end gap-2 ${isRTL ? 'left-6' : 'right-6'}`}>
      <ChatWidget docked />
      <WhatsAppButton docked />
    </div>
  )
}
