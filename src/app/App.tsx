import { Component, lazy, Suspense, type ReactNode } from 'react'
import { useLocale } from '../i18n/locale'
import Home from './Home'
import { SiteHeader } from './SiteHeader'
import { homeHref, resolveRoute, stories, storyHref } from './stories'
import { siteCopy } from './siteCopy'
import { usePageMetadata } from './metadata'
import { loadStory } from './loadStory'
import '../styles/site.css'

const route = resolveRoute(window.location.pathname)
const legacy = route.kind === 'home' ? stories.find(story => story.legacyFragments.includes(window.location.hash.slice(1))) : undefined
if (legacy) window.location.replace(`${storyHref(legacy)}${window.location.search}${window.location.hash}`)
const Story = route.kind === 'story' ? lazy(() => loadStory(route.story.load)) : null

function RouteMessage({ failed = false, loading = false }: { failed?: boolean; loading?: boolean }) {
  const copy = siteCopy[useLocale()]
  const title = loading ? copy.loading : failed ? copy.failedTitle : copy.missing
  usePageMetadata(`${title} — Story Narrative`, copy.metaDescription)
  return <div className="site-page"><SiteHeader /><main className="route-message">
    <p className="site-eyebrow">Story Narrative</p><h1>{title}</h1>
    {loading ? <p role="status">{copy.loading}</p> : <><p>{failed ? copy.failedText : copy.missingText}</p>{failed && <button onClick={() => window.location.reload()}>{copy.retry} ↗</button>}</>}
    <a href={homeHref}>← {copy.home}</a>
  </main></div>
}
class StoryBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <RouteMessage failed /> : this.props.children }
}
export default function App() {
  if (legacy) return <RouteMessage loading />
  if (Story) return <StoryBoundary><Suspense fallback={<RouteMessage loading />}><Story /></Suspense></StoryBoundary>
  return route.kind === 'home' ? <Home /> : <RouteMessage />
}
