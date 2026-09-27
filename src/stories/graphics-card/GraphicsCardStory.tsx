import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocale } from '../../i18n/locale'
import { LanguageToggle } from '../../ui/LanguageToggle'
import { useMedia } from '../../hooks/useMedia'
import { usePageMetadata } from '../../app/metadata'
import { homeHref } from '../../app/stories'
import { beatIds, copy, sources } from './content'
import { beatFromHash, shots } from './state'
import './graphics-card.css'

const GraphicsScene = lazy(() => import('./GraphicsScene'))
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}
export default function GraphicsCardStory() {
  const locale = useLocale()
  const c = copy[locale]
  usePageMetadata(c.title, c.description)
  const [beat, setBeat] = useState(() => beatFromHash(window.location.hash))
  const [explosion, setExplosion] = useState(shots[beat].explosion)
  const [turn, setTurn] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [inspect, setInspect] = useState(false)
  const [reading, setReading] = useState(false)
  const [menu, setMenu] = useState(false)
  const [manualReduced, setManualReduced] = useState(false)
  const prefersReduced = useMedia('(prefers-reduced-motion: reduce)')
  const reduced = manualReduced || prefersReduced
  const [replay, setReplay] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [moduleFailed, setModuleFailed] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const inspectButton = useRef<HTMLButtonElement>(null)
  const options = useRef<HTMLDetailsElement>(null)
  const onReady = useCallback(() => setStatus('ready'), [])
  const onFailure = useCallback(() => setStatus('failed'), [])
  const onModuleFailure = useCallback(() => { setModuleFailed(true); setStatus('failed') }, [])
  const resetView = () => { setExplosion(shots[beat].explosion); setTurn(0); setZoom(1); setReplay(value => value + 1) }
  const applyBeat = useCallback((index: number) => {
    setBeat(index); setExplosion(shots[index].explosion); setTurn(0); setZoom(1); setInspect(false); setMenu(false)
  }, [])
  const go = (index: number) => {
    if (index < 0 || index >= beatIds.length) return
    window.history.pushState(null, '', `#${beatIds[index]}`)
    applyBeat(index)
    document.getElementById('gpu-lesson-title')?.focus({ preventScroll: true })
    if (window.matchMedia('(max-width: 760px)').matches) window.scrollTo({ top: 0, behavior: 'instant' })
  }
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1)
      if (!hash || [...beatIds, 'deadline', 'cooling'].some(id => id === hash)) applyBeat(beatFromHash(hash))
    }
    window.addEventListener('hashchange', sync); window.addEventListener('popstate', sync)
    return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('popstate', sync) }
  }, [applyBeat])
  useEffect(() => {
    if (status !== 'loading' || reading) return
    const timeout = window.setTimeout(onFailure, 30000)
    return () => clearTimeout(timeout)
  }, [status, reading, attempt, onFailure])
  const current = c.beats[beat]
  const look = reduced && beat === 7 ? (locale === 'en' ? 'These three fans sit above the fins. The arrows show a simplified direction of airflow through the gaps.' : 'Les trois ventilateurs surmontent les ailettes. Les flèches montrent un sens simplifié de circulation d’air dans les espaces.') : current.look
  const fallback = <div className="gpu-fallback"><img src={`${homeHref}images/graphics-card/${current.image}.webp`} alt={`${locale === 'en' ? 'Original rendered view' : 'Rendu original'} — ${current.label}`} /><p role="status">{c.failed}</p><button onClick={() => { if (moduleFailed) { window.location.reload(); return }; setStatus('loading'); setAttempt(value => value + 1) }}>{c.retry}</button></div>
  const toggleReading = () => {
    setReading(value => !value); setStatus('loading'); setMenu(false)
    if (options.current) options.current.open = false
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  return <div className="gpu-story" data-beat={beatIds[beat]} data-motion={reduced ? 'reduced' : 'full'}>
    <a className="skip-link" href="#gpu-lesson-title">{c.subtitle}</a>
    <header className="gpu-header">
      <a className="gpu-back" href={homeHref}><span aria-hidden="true">←</span> {c.back}</a>
      <div className="gpu-identity"><span>{c.name}</span><span>{c.subtitle}</span></div>
      <details className="gpu-options" ref={options} onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus() } }}>
        <summary>Options <span aria-hidden="true">+</span></summary>
        <div><LanguageToggle /><button onClick={toggleReading}>{reading ? c.return : c.reading}</button><button disabled={prefersReduced} aria-pressed={reduced} onClick={() => setManualReduced(!manualReduced)}>{reduced ? c.reduced : c.motion}</button></div>
      </details>
    </header>
    {reading ? <main className="gpu-reading"><h1 id="gpu-lesson-title" tabIndex={-1}>{c.subtitle}</h1><p>{c.modelNote}</p><button className="gpu-reading-return" onClick={toggleReading}>{c.return} →</button>{c.beats.map((item, index) => <section key={beatIds[index]}><div><p className="gpu-eyebrow">{String(index + 1).padStart(2, '0')} · {item.label}</p><h2>{item.title}</h2><p>{item.body}</p><p>{item.look}</p><p>{item.detail}</p><a href={sources[item.source].url} target="_blank" rel="noreferrer">{sources[item.source].title} ↗</a></div><img src={`${homeHref}images/graphics-card/${item.image}.webp`} alt={`${locale === 'en' ? 'Original render' : 'Rendu original'} — ${item.label}`} loading="lazy" /></section>)}</main> : <>
      <main className="gpu-lesson">
        <article className="gpu-copy" aria-labelledby="gpu-lesson-title">
          <div className="gpu-heading"><p className="gpu-eyebrow">{current.label}</p><h1 id="gpu-lesson-title" tabIndex={-1}>{current.title}</h1></div>
          <p className="gpu-body">{current.body}</p>
          <div className="gpu-observe"><p>{c.look}</p><span>{look}</span></div>
          <details className="gpu-notes" key={beat}><summary>{c.notes} <span aria-hidden="true">+</span></summary><div><p>{current.detail}</p><a href={sources[current.source].url} target="_blank" rel="noreferrer">{sources[current.source].title} ↗</a><p className="gpu-model-limit">{c.modelNote}</p></div></details>
        </article>
        <div className="gpu-stage" role="region" aria-label={current.scene} data-status={status}>
          {status === 'failed' ? fallback : <SceneBoundary key={attempt} fallback={fallback} onFailure={onModuleFailure}><Suspense fallback={null}><GraphicsScene beat={beat} explosion={explosion} turn={turn} zoom={zoom} inspect={inspect} reduced={reduced} replay={replay} labels={c.labels} onReady={onReady} onFailure={onFailure} /></Suspense></SceneBoundary>}
          {status === 'loading' && <p className="gpu-loading" role="status">{c.loading}</p>}
          <div className="gpu-stage-footer"><span>{[3, 4, 7].includes(beat) ? c.schematic : c.model}</span><div>{[3, 4, 7].includes(beat) && status === 'ready' && !inspect && !reduced && <button className="gpu-replay" aria-label={c.replay} title={c.replay} onClick={() => setReplay(value => value + 1)}>↻</button>}<button ref={inspectButton} disabled={status !== 'ready'} aria-expanded={inspect} aria-controls="gpu-inspection" onClick={() => setInspect(!inspect)}>{inspect ? c.close : c.controls}</button></div></div>
          {inspect && <div className="gpu-inspection" id="gpu-inspection" onKeyDown={event => { if (event.key === 'Escape') { setInspect(false); inspectButton.current?.focus() } }}>
            <label>{c.turn}<input aria-label={c.turn} type="range" min="-180" max="180" value={turn} onChange={event => setTurn(Number(event.target.value))} /></label>
            <label>{c.zoom}<input aria-label={c.zoom} type="range" min="0.7" max="2.5" step="0.1" value={zoom} onChange={event => setZoom(Number(event.target.value))} /></label>
            {[0, 1, 5, 7].includes(beat) && <label>{c.separate}<input aria-label={c.separate} type="range" min="0" max="100" value={Math.round(explosion * 100)} onChange={event => setExplosion(Number(event.target.value) / 100)} /></label>}
            <button onClick={() => { resetView(); setInspect(false); inspectButton.current?.focus() }}>{c.reset}</button>
          </div>}
        </div>
      </main>
      <footer className="gpu-navigation">
        <div className="gpu-progress" aria-hidden="true"><span style={{ width: `${(beat + 1) / beatIds.length * 100}%` }} /></div>
        <button className="gpu-previous" aria-label={c.previous} disabled={beat === 0} onClick={() => go(beat - 1)}>←</button>
        <div className="gpu-index"><button ref={menuButton} aria-label={c.chapters} aria-expanded={menu} aria-controls="gpu-part-menu" onClick={() => setMenu(!menu)}><span>{String(beat + 1).padStart(2, '0')} <span>/ {String(beatIds.length).padStart(2, '0')}</span></span><span>{current.label}</span><span aria-hidden="true">⌃</span></button>
          {menu && <nav id="gpu-part-menu" aria-label={c.chapters} onKeyDown={event => { if (event.key === 'Escape') { setMenu(false); menuButton.current?.focus() } }}>{c.beats.map((item, index) => <button key={beatIds[index]} aria-current={index === beat ? 'step' : undefined} onClick={() => go(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</button>)}</nav>}
        </div>
        <button className="gpu-next" onClick={() => go(beat === beatIds.length - 1 ? 0 : beat + 1)}>{current.action}<span aria-hidden="true">→</span></button>
      </footer>
    </>}
    <span className="sr-only" role="status">{`${beat + 1} / ${beatIds.length}. ${current.title.replace('\n', ' ')}`}</span>
  </div>
}
