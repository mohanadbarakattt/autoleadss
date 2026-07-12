import LegalPage from './LegalPage'
import { privacyContent } from '../content/legal'
import { useLocale } from '../i18n/LocaleProvider'

export default function Privacy() {
  const { locale } = useLocale()
  return <LegalPage doc={privacyContent[locale]} kind="privacy" />
}
