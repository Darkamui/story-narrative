import { useLocale, setLocale, type Locale, type Values } from '../../../i18n/locale'
import { frStory } from './frStory'
import { frParts } from './frParts'
import { frUi } from './frUi'

export { localeKey, localeStore, setLocale, type Locale } from '../../../i18n/locale'
export const french = { ...frStory, ...frParts, ...frUi }
export function translate(message: string, language: Locale, values: Values = {}) {
  const text = language === 'fr' ? french[message] ?? message : message
  return text.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
}
const translators = {
  en: (message: string, values?: Values) => translate(message, 'en', values),
  fr: (message: string, values?: Values) => translate(message, 'fr', values),
}
export function useTranslation() {
  const language = useLocale()
  return { locale: language, t: translators[language], setLocale }
}
