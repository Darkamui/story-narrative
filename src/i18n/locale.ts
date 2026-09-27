import { useSyncExternalStore } from 'react'

export type Locale = 'en' | 'fr'
export type Values = Record<string, string | number>
// Preserve the existing preference for returning readers.
export const localeKey = 'inside-cell-language'
const listeners = new Set<() => void>()
function savedLocale(): Locale {
  try { return localStorage.getItem(localeKey) === 'fr' ? 'fr' : 'en' } catch { return 'en' }
}
let locale = savedLocale()
export function setLocale(next: Locale) {
  if (next === locale) return
  locale = next
  try { localStorage.setItem(localeKey, next) } catch { /* Switching works without storage. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = next
  listeners.forEach(listener => listener())
}
export const localeStore = {
  get: () => locale,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
}
export function useLocale() { return useSyncExternalStore(localeStore.subscribe, localeStore.get) }
export function useTranslation() {
  const locale = useLocale()
  return { locale, setLocale, t: (message: string) => locale === 'fr' && message === 'Language' ? 'Langue' : message }
}
if (typeof document !== 'undefined') document.documentElement.lang = locale
