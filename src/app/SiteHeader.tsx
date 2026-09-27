import { LanguageToggle } from '../ui/LanguageToggle'
import { useLocale } from '../i18n/locale'
import { homeHref } from './stories'
import { siteCopy } from './siteCopy'

export function SiteHeader() {
  const copy = siteCopy[useLocale()]
  return <header className="site-header">
    <a className="site-brand" href={homeHref} aria-label="Story Narrative">
      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 13 7-13 7L3 10Zm-13 13 13 7 13-7M3 22l13 7 13-7" /></svg>
      <span>STORY<br />NARRATIVE</span>
    </a>
    <nav aria-label={copy.library}><a href={`${homeHref}#stories`}>{copy.library}</a><a href={`${homeHref}#about`}>{copy.about}</a></nav>
    <LanguageToggle />
  </header>
}
