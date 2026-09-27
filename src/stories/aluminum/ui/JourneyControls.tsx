import { useSyncExternalStore } from 'react'
import { useTranslation } from '../i18n/locale'
import { journeyStops } from '../data/journey'
import { nextJourneyIndex, previousJourneyIndex } from '../story/journey'
import { storyStore } from '../story/store'
import { seekStory, stopTravel, travelStore } from '../story/StoryController'

export function JourneyControls() {
  const { t } = useTranslation()
  const next = useSyncExternalStore(storyStore.subscribe, () => nextJourneyIndex(storyStore.get()))
  const busy = useSyncExternalStore(travelStore.subscribe, travelStore.get)
  const atStart = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().globalProgress < .001)
  const stop = journeyStops[next]
  const back = () => {
    const previous = journeyStops[previousJourneyIndex(storyStore.get())]
    seekStory(previous?.chapter ?? 0, previous?.local ?? 0, true)
  }
  return <nav className="journey-controls" aria-label={t('Guided exploration')}>
    <button className="journey-back" aria-label={t('Previous action')} disabled={atStart} onClick={back}>↶</button>
    <button className="journey-next" onClick={() => busy ? stopTravel() : stop ? seekStory(stop.chapter, stop.local, true) : seekStory(0, 0)}>
      <span aria-hidden="true">{busy ? 'Ⅱ' : stop ? '→' : '↺'}</span>
      <span>{t(busy ? 'Pause here' : stop?.action ?? 'Start again')}</span>
    </button>
    <span className="journey-hint">{t('Click to explore · or scroll')}</span>
  </nav>
}
