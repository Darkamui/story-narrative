import { useTranslation } from '../i18n/locale'

export function LanguageToggle() {
  const { locale, t, setLocale } = useTranslation()
  return <div className="language-toggle" role="group" aria-label={t('Language')}>
    <button type="button" lang="en" aria-label="English" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
    <span aria-hidden="true">/</span>
    <button type="button" lang="fr" aria-label="Français" aria-pressed={locale === 'fr'} onClick={() => setLocale('fr')}>FR</button>
  </div>
}
