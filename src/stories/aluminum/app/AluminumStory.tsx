import { useTranslation } from '../i18n/locale'
import { LanguageToggle } from '../../../ui/LanguageToggle'
import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { chapters } from '../data/content'
import { layouts } from '../data/shots'
import { sources } from '../data/sources'
import { useMedia } from '../../../hooks/useMedia'
import { useStoryController, seekStory as goToChapter } from '../story/StoryController'
import { JourneyControls } from '../ui/JourneyControls'
import { storyStore } from '../story/store'
import { chapterStart, type StoryState } from '../story/states'
import { SectionDiagram } from '../ui/SectionDiagram'
import { DevControls } from '../ui/DevControls'
import { ComponentLegend, LeaderOverlay } from '../ui/ComponentLegend'
import { selectionStore } from '../story/selection'
import { anatomyStore } from '../story/anatomy'
import { AnatomyGuide } from '../ui/AnatomyGuide'
import { ProcessExperience, ProcessReading } from '../ui/ProcessExperience'
import { processBeats } from '../data/operating'
import { operatingBeat } from '../story/operating'
import type { AssetStatus } from '../three/ModelLoader'
import { AnodeComparison, ComparisonReading } from '../ui/AnodeComparison'
import { comparisonPhases, comparisonSources } from '../data/anodeEffect'
import { anodeEffectPhase } from '../story/anodeEffect'
import { endingBeats } from '../data/ending'
import { endingState } from '../story/ending'
import { EndingExperience, EndingReading } from '../ui/EndingExperience'
import { homeHref } from '../../../app/stories'
import { usePageMetadata } from '../../../app/metadata'
import '../styles/global.css'
import '../styles/stage.css'
import '../styles/comparison.css'
import '../styles/ending.css'
import '../styles/interaction.css'

const Experience = lazy(() => import('./Experience'))
declare global { interface Window { __CELL_STORY__?: { state: () => StoryState; seek: (index: number, local?: number) => void } } }
class ImportBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export default function AluminumStory() {
  const { t } = useTranslation()
  usePageMetadata(t('Inside the Cell — From grain to metal'), t('Inside the Cell — a scroll-driven journey from a grain of alumina to aluminum.'))
  const preferredReduced = useMedia('(prefers-reduced-motion: reduce)')
  const mobile = useMedia('(max-width: 760px)')
  const [motion, setMotion] = useState<'system' | 'reduced'>('system')
  const reduced = preferredReduced || motion === 'reduced'
  const [reading, setReading] = useState(false)
  const [quality, setQuality] = useState<'auto' | 'high' | 'low'>('auto')
  const [menu, setMenu] = useState(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [asset, setAsset] = useState<AssetStatus>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const progress = useRef<HTMLDivElement>(null)
  const chapterIndex = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().chapterIndex)
  const processIndex = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().chapterIndex === 6 ? operatingBeat(storyStore.get()).index : -1)
  const comparisonPhase = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().chapterIndex === 8 ? anodeEffectPhase(storyStore.get().chapterProgress) : -1)
  const chapter = chapters[chapterIndex]
  const endingBeat = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().chapterIndex >= 10 ? endingState(storyStore.get().chapterIndex, storyStore.get().chapterProgress).beat : -1)
  const onReady = useCallback(() => setStatus('ready'), [])
  const onFailure = useCallback(() => setStatus('failed'), [])
  const onAssetStatus = useCallback((next: AssetStatus) => setAsset(next), [])
  useEffect(() => { selectionStore.select(null); anatomyStore.set(false) }, [chapterIndex])
  useStoryController(reduced, reading)
  useEffect(() => storyStore.subscribe(() => {
    if (progress.current) progress.current.style.transform = `scaleX(${storyStore.get().globalProgress})`
  }), [])
  useEffect(() => {
    if (status !== 'loading') return
    const timeout = window.setTimeout(onFailure, 12000)
    return () => clearTimeout(timeout)
  }, [status, onFailure])
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__CELL_STORY__ = { state: storyStore.get, seek: goToChapter }
    return () => { delete window.__CELL_STORY__ }
  }, [])
  const fallback = <div className="visual-fallback"><SectionDiagram /><p>{t("3D is unavailable. The full story and this section diagram remain available.")}</p><button onClick={() => window.location.reload()}>{t("Retry 3D")}</button></div>

  return <div data-layout={layouts[chapterIndex]} data-chapter={chapterIndex} data-process={processIndex >= 0 ? processBeats[processIndex].id : undefined} className={`${reading ? 'reading' : ''} ${reduced ? 'reduced-motion' : ''}`}>
    <a className="skip-link" href="#story">{t("Skip to the story")}</a>
    <header className="masthead">
      <div className="story-brand-group"><a className="library-return" href={homeHref} aria-label={t('All stories')}>←<span>{t('All stories')}</span></a><a className="brand" href="#grain" onClick={event => { event.preventDefault(); goToChapter(0, 0) }}><span className="brand-mark">{t("Al")}</span> {t("INSIDE THE CELL")}</a></div>
      <span className="edition">{t("A material journey")} <span> / </span> {t("12 chapters")}</span>
      <div className="masthead-controls"><LanguageToggle /><button className="index-button" aria-expanded={menu} aria-controls="chapter-menu" onClick={() => setMenu(!menu)}>{t("Chapters")} <span>{menu ? '−' : '+'}</span></button></div>
    </header>
    {menu && <nav id="chapter-menu" className="chapter-menu" aria-label={t("Chapter index")} onKeyDown={event => { if (event.key === 'Escape') { setMenu(false); document.querySelector<HTMLButtonElement>('.index-button')?.focus() } }}>
      {chapters.map((item, i) => <a href={`#${item.id}`} key={item.id} aria-current={i === chapterIndex ? 'step' : undefined} onClick={event => { event.preventDefault(); setMenu(false); goToChapter(i); document.getElementById(`title-${item.id}`)?.focus({ preventScroll: true }) }}><span>{String(i).padStart(2, '0')}</span>{t(item.label)}</a>)}
    </nav>}
    <div className="scene-stage" role="region" aria-label={t('Interactive aluminium cell illustration')}>
      <div className="scene-grid" />
      {status === 'failed' ? fallback : <ImportBoundary fallback={fallback}><Suspense fallback={<div className="loading-note">{t("Preparing the illustration…")}</div>}><Experience lowQuality={quality === 'low' || (quality === 'auto' && (mobile || reduced))} onReady={onReady} onFailure={onFailure} attempt={attempt} onAssetStatus={onAssetStatus} /></Suspense></ImportBoundary>}
      <LeaderOverlay />
      <div className="scene-caption"><span className="caption-dot" />{t(chapterIndex === 0 ? 'Alumina · Al₂O₃ · enlarged grain' : chapterIndex === 7 ? 'Normal operation · schematic process overlay' : chapterIndex === 8 ? 'Anode effect · schematic comparison' : chapterIndex === 10 ? 'Liquid aluminium · sectional equipment study' : chapterIndex === 11 ? 'Cast aluminium · open-mould ingot study' : chapterIndex >= 4 ? 'Sectional study · 400 kA model' : 'Single prebake cell · 400 kA design basis')}</div>
    </div>
    {asset.state === 'loading' && chapterIndex > 0 && status !== 'failed' && <p className="asset-notice" role="status">{t("Loading the cell model…")}</p>}
    {asset.state === 'failed' && status !== 'failed' && <div className="asset-notice" role="alert"><p>{t("The cell model could not be loaded. You can still read the full story.")}</p><button onClick={() => { setAsset({ state: 'loading' }); setAttempt(value => value + 1) }}>{t("Retry model")}</button></div>}
    {!reading && chapterIndex > 0 && chapterIndex < 10 && status !== 'failed' && asset.state === 'ready' && <ComponentLegend />}
    {!reading && chapterIndex === 3 && asset.state === 'ready' && <AnatomyGuide />}
    {!reading && [5, 6, 7, 9].includes(chapterIndex) && <ProcessExperience seek={goToChapter} />}
    {!reading && chapterIndex === 8 && <AnodeComparison seek={goToChapter} />}
    {!reading && chapterIndex >= 10 && <EndingExperience seek={goToChapter} failed={status === 'failed'} />}
    <main id="story" tabIndex={-1}>
      {chapters.map((original, i) => { const item = i === 6 && processIndex >= 0 && !reading ? { ...original, ...processBeats[processIndex], id: original.id } : i === 8 && comparisonPhase >= 0 && !reading ? { ...original, ...comparisonPhases[Math.max(0, comparisonPhase)], id: original.id, sources: comparisonSources } : i >= 10 && endingBeat >= 0 && !reading ? { ...original, ...endingBeats(i)[endingBeat], id: original.id } : original; return <section key={item.id} id={item.id} inert={!reading && i !== chapterIndex} className={`chapter ${i === chapterIndex ? 'active' : ''}`} style={{ height: `${item.length * 100}svh` }} aria-labelledby={`title-${item.id}`}>
        <div className="chapter-copy">
          <p className="eyebrow"><span>{String(i).padStart(2, '0')}</span> {t(item.eyebrow)}</p>
          <h1 id={`title-${item.id}`} tabIndex={-1}>{t(item.title)}</h1>
          <p className="body-copy">{t(item.body)}</p>
          <details className="field-note"><summary>{t("Field notes")} <span>↗</span></summary><p>{t(item.detail)}</p>
            <ul>{item.sources.map(id => <li key={id}>{id === 'model' ? <span>{t(sources[id].title)} {t("— repository")} <code>{t("spec.py")}</code></span> : <a href={sources[id].url} target="_blank" rel="noreferrer">{t(sources[id].title)} ↗</a>}{import.meta.env.DEV && <small> [{id}]</small>}</li>)}</ul>
          </details>
          {reading && i === 6 && <ProcessReading />}
          {reading && i === 8 && <ComparisonReading />}
          {reading && i >= 10 && <EndingReading chapter={i} />}
          {i === 11 ? <button className="end-link" onClick={() => goToChapter(0, 0)}>{t("Return to the grain")} <span>↑</span></button> : i === 0 && <p className="scroll-cue">{t('Choose an action below. Pause and inspect at your own pace.')}</p>}
        </div>
      </section>})}
      <div className="story-tail" aria-hidden="true" />
    </main>
    <footer className="story-footer">
      <div className="progress-track"><div ref={progress} /></div>
      <div className="chapter-navigation"><button aria-label={t("Previous chapter")} disabled={chapterIndex === 0} onClick={() => goToChapter(chapterIndex - 1)}>←</button><span aria-live="polite" aria-atomic="true"><b>{String(chapterIndex).padStart(2, '0')}</b> / 11 <span className="current-label">{t(chapter.label)}</span></span><button aria-label={t("Next chapter")} disabled={chapterIndex === 11} onClick={() => goToChapter(chapterIndex + 1)}>→</button></div>
      {!reading && <JourneyControls />}
      <div className="preferences"><button aria-pressed={reading} onClick={() => setReading(!reading)}>{t(reading ? 'Return to scene' : 'Read the story')}</button><button aria-pressed={reduced} onClick={() => setMotion(motion === 'system' ? 'reduced' : 'system')}>{t(reduced ? 'Motion reduced' : 'Reduce motion')}</button><label className="quality-label">{t("Quality")}<select aria-label={t("Rendering quality")} value={quality} onChange={event => setQuality(event.target.value as typeof quality)}><option value="auto">{t("Auto")}</option><option value="high">{t("High")}</option><option value="low">{t("Low")}</option></select></label></div>
    </footer>
    {import.meta.env.DEV && new URLSearchParams(window.location.search).has('debug') && <DevControls />}
    <span className="sr-only">{t('Real cell model with schematic process overlays. Use the component key to identify assemblies and individual parts. Use the chapter menu, arrow buttons, Page Up and Page Down, or ordinary scrolling. Chapter {chapter} starts at {percent} percent.', { chapter: chapterIndex + 1, percent: Math.round(chapterStart(chapterIndex) * 100) })}</span>
  </div>
}
