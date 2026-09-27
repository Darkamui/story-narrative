import { useTranslation } from '../i18n/locale'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { anatomyStages } from '../data/anatomy'
import { anatomyStore } from '../story/anatomy'
import { storyStore } from '../story/store'
import { selectionStore } from '../story/selection'
import { seekStory } from '../story/StoryController'

export function AnatomyGuide() {
  const { t } = useTranslation()
  const detail = useSyncExternalStore(anatomyStore.subscribe, anatomyStore.get)
  const reduced = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().reducedMotion)
  const heading = useRef<HTMLParagraphElement>(null)
  const body = useRef<HTMLParagraphElement>(null)
  const scrubber = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const update = () => {
      const stage = anatomyStages.find(stage => storyStore.get().explodedAmount < stage.until)!
      if (heading.current) heading.current.textContent = t(stage.title)
      if (body.current) body.current.textContent = t(stage.body)
      if (scrubber.current) scrubber.current.value = String(Math.round(Math.min(1, storyStore.get().chapterProgress / .72) * 100))
    }
    update()
    return storyStore.subscribe(update)
  }, [t, reduced])
  return <aside className="anatomy-guide" aria-label={t("Anatomy exploration")}>
    <div className="anatomy-views" aria-label={t("Anatomy view")}>
      {[false, true].map(value => <button key={String(value)} aria-pressed={detail === value} onClick={() => { selectionStore.select(null); anatomyStore.set(value) }}>{t(value ? 'Inner layers' : 'Whole cell')}</button>)}
    </div>
    <p ref={heading} className="anatomy-phase" /><p ref={body} className="anatomy-description" />
    {!reduced && <label className="anatomy-scrubber"><span>{t('Separate the layers')}</span><input aria-label={t('Separate the layers')} ref={scrubber} type="range" min="0" max="100" defaultValue="0" onChange={event => seekStory(3, Number(event.target.value) / 100 * .72)} /><span>{t('Drag to explore')}</span></label>}
    <span>{t("Exploded diagram · spacing expanded for clarity")}</span>
  </aside>
}
