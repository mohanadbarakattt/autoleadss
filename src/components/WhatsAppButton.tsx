import { useLocale } from '../i18n/LocaleProvider'

export default function WhatsAppButton() {
  const { isRTL, t } = useLocale()
  return (
    <a
      href="https://wa.me/201100054278"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsappTip}
      className={`group fixed bottom-6 z-50 flex items-center justify-center rounded-full shadow-lg hover:scale-105 transition-transform ${isRTL ? 'right-6' : 'left-6'}`}
      style={{ width: 52, height: 52, background: '#25D366' }}
    >
      <svg viewBox="0 0 32 32" width="26" height="26" fill="white" aria-hidden="true">
        <path d="M16.003 3C9.374 3 4 8.373 4 15c0 2.385.69 4.61 1.882 6.49L4 29l7.7-1.84A12 12 0 0 0 16.003 27C22.633 27 28 21.626 28 15S22.633 3 16.003 3Zm0 21.6c-1.94 0-3.83-.52-5.48-1.5l-.39-.23-4.57 1.09 1.12-4.45-.25-.41A9.6 9.6 0 1 1 25.6 15c0 5.293-4.31 9.6-9.597 9.6Zm5.51-7.18c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.41-1.49-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.64-.93-2.24-.24-.58-.49-.5-.68-.51l-.58-.01a1.13 1.13 0 0 0-.82.38c-.28.3-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.26 3.2.15.2 2.18 3.34 5.28 4.68.74.32 1.32.51 1.77.65.74.24 1.42.2 1.95.12.6-.09 1.79-.73 2.04-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35Z"/>
      </svg>
      <span className={`pointer-events-none absolute whitespace-nowrap rounded-full bg-foreground text-white text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'right-full mr-3' : 'left-full ml-3'}`}>
        {t.whatsappTip}
      </span>
    </a>
  )
}