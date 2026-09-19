import LocalChat from './LocalChat'
import { useLocale, useT } from '../i18n/LocaleProvider'
import { PAGE_FAQ } from '../seo/pageFaq'
import { waLink } from '../site'

export default function ChatWidget({ docked = false, inline = false }: { docked?: boolean; inline?: boolean }) {
  const t = useT()
  const { locale, isRTL } = useLocale()
  const wa = waLink(t.hero.waText)
  const faq = PAGE_FAQ[locale]

  return (
    <LocalChat
      rtl={isRTL}
      inline={inline}
      copy={{
        open: t.chat.open,
        close: t.chat.close,
        title: t.chat.title,
        subtitle: t.faqPage.botLabel,
        placeholder: t.chat.placeholder,
        send: t.chat.send,
        hello: t.chat.hello,
        fallback: t.chat.fallback,
        suggestions: t.chat.suggestions,
        faq,
      }}
      footer={
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-wa py-2.5 text-center text-xs font-medium text-white"
        >
          {t.chat.waCta}
        </a>
      }
      docked={docked}
    />
  )
}
