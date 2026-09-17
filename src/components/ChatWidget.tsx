import LocalChat from './LocalChat'
import { useLocale, useT } from '../i18n/LocaleProvider'
import { waLink } from '../site'

export default function ChatWidget() {
  const t = useT()
  const { isRTL } = useLocale()
  const wa = waLink(t.hero.waText)

  return (
    <LocalChat
      rtl={isRTL}
      copy={{
        open: t.chat.open,
        close: t.chat.close,
        title: t.chat.title,
        subtitle: t.chat.subtitle,
        placeholder: t.chat.placeholder,
        send: t.chat.send,
        hello: t.chat.hello,
        fallback: t.chat.fallback,
        suggestions: t.chat.suggestions,
        faq: t.faq,
      }}
      footer={
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#25D366] py-2.5 text-center text-xs font-medium text-white"
        >
          {t.chat.waCta}
        </a>
      }
    />
  )
}
