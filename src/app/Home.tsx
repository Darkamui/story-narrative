import { useLocale } from '../i18n/locale'
import { SiteHeader } from './SiteHeader'
import { stories, storyHref, homeHref } from './stories'
import { siteCopy } from './siteCopy'
import { usePageMetadata } from './metadata'

export default function Home() {
  const locale = useLocale()
  const copy = siteCopy[locale]
  usePageMetadata(copy.metaTitle, copy.metaDescription)
  return <div className="site-page">
    <a className="skip-link" href="#content">{copy.skip}</a><SiteHeader />
    <main id="content" tabIndex={-1}>
      <section className="home-intro" aria-labelledby="home-title">
        <p className="site-eyebrow"><span />{copy.eyebrow}</p>
        <h1 id="home-title">{copy.title}<br /><em>{copy.titleEnd}</em></h1>
        <div className="intro-bottom"><p>{copy.intro}</p><a className="browse-link" href="#stories">{copy.browse}<span aria-hidden="true">↘</span></a></div>
        <span className="intro-index" aria-hidden="true">FIG. 001 — ∞</span>
      </section>
      <section className="story-collection" id="stories" aria-labelledby="collection-title">
        <div className="collection-heading"><div><p className="site-eyebrow">{copy.collection}</p><h2 id="collection-title">{copy.collectionTitle}</h2></div><p>{copy.collectionNote}</p></div>
        <div className="story-grid">{stories.map(story => {
          const entry = story.copy[locale]
          return <article className="story-card" key={story.slug}>
            <a className="story-cover" href={storyHref(story)} aria-label={`${copy.enter} — ${entry.title}`}>
              <img src={`${homeHref}${story.image}`} alt={entry.imageAlt} width="1440" height="814" fetchPriority="high" />
              <div className="cover-top" aria-hidden="true"><span>{story.number} / {entry.subject}</span><span>3D</span></div>
              <span className="cover-caption" aria-hidden="true">{entry.subject}</span><span className="cover-arrow" aria-hidden="true">↗</span>
            </a>
            <div className="story-card-copy"><p className="site-eyebrow">{entry.format}</p><h3><a href={storyHref(story)}>{entry.title}</a></h3><p className="story-description">{entry.description}</p><a className="story-enter" href={storyHref(story)}>{copy.enter}<span aria-hidden="true">↗</span></a></div>
          </article>
        })}</div>
      </section>
      <section className="home-about" id="about" aria-labelledby="about-title"><p className="site-eyebrow">{copy.aboutEyebrow}</p><h2 id="about-title">{copy.aboutTitle}</h2><p>{copy.aboutText}</p></section>
    </main>
    <footer className="site-footer"><span>STORY NARRATIVE</span><p>{copy.footer}</p><a href="#stories">{copy.library} ↑</a></footer>
  </div>
}
