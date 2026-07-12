import LegalPage from './LegalPage'
import { termsContent } from '../content/legal'
import { useLocale } from '../i18n/LocaleProvider'

export default function Terms() {
  const { locale } = useLocale()
  return <LegalPage doc={termsContent[locale]} kind="terms" />
}
