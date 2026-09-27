import { useTranslation } from '../i18n/locale'
import { useEffect, useSyncExternalStore } from 'react'
import { endingBeats, endingParts } from '../data/ending'
import { storyStore } from '../story/store'
import { endingState, endingStore } from '../story/ending'

export function EndingExperience({ seek, failed }: { seek: (chapter: number, local: number) => void; failed: boolean }) {
  const { t } = useTranslation()
  const chapter = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().chapterIndex)
  const beat = useSyncExternalStore(storyStore.subscribe, () => endingState(storyStore.get().chapterIndex, storyStore.get().chapterProgress).beat)
  const asset = useSyncExternalStore(endingStore.subscribe, endingStore.get)
  const beats = endingBeats(chapter), parts = endingParts(chapter)
  const selected = parts.find(p => p.id === asset.selected)
  useEffect(() => { endingStore.set({ selected: null }) }, [chapter])
  return <aside className="ending-experience" aria-label={t(chapter === 10 ? 'Tapping study' : 'Casting study')} data-beat={beat}>
    <nav className="ending-tabs" aria-label={t("Material journey stages")}>{beats.map((b, i) => <button key={b.label} aria-current={beat === i ? 'step' : undefined} onClick={() => seek(chapter, (i + .6) / beats.length)}><span>{String(i + 1).padStart(2,'0')}</span>{t(b.label)}</button>)}</nav>
    {chapter === 10 && beat === 2 && <p className="transfer-route"><span>{t("Reduction cell")}</span><b>→</b><span>{t("Transport crucible")}</span><b>→</b><span>{t("Cast house")}</span><small>{t("A change of location · transport route omitted")}</small></p>}
    <div className="ending-key"><p>{t("Identify the equipment")} <span>{t("Sectional study · illustrative proportions")}</span></p><ol>{parts.map((p, i) => <li key={p.id}><button aria-pressed={asset.selected === p.id} onClick={() => endingStore.set({ selected: asset.selected === p.id ? null : p.id })}><b>{i + 1}</b>{t(p.id === 'ingot' && beat === 3 ? 'Solid aluminium ingot' : p.name)}</button></li>)}</ol>{selected && <p className="ending-part-note">{t(selected.note)}</p>}</div>
    {asset.state === 'ready' && !failed && <div className="ending-anchors"><svg className="ending-anchor-lines" aria-hidden="true">{parts.map(p => <line key={p.id} id={`ending-line-${p.id}`} />)}</svg>{parts.map((p, i) => <button key={p.id} id={`ending-anchor-${p.id}`} className="ending-anchor" aria-label={t('Identify {part}', { part: t(p.name) })} aria-pressed={asset.selected === p.id} onClick={() => endingStore.set({ selected: p.id })}>{i + 1}</button>)}</div>}
    {(failed || asset.state === 'failed') && <div className="ending-fallback" role="status"><p>{t(chapter === 10 ? 'Metal pad → tapping tube → vacuum crucible → cast house' : 'Prepared melt → launder → mould → cooling → solid ingot')}</p><small>{t("The equipment illustration is unavailable. Stage descriptions and the component key remain available.")}</small>{!failed && <button onClick={() => endingStore.set({ attempt: asset.attempt + 1 })}>{t("Retry equipment")}</button>}</div>}
    {!failed && (asset.state === 'idle' || asset.state === 'loading') && <p className="ending-fallback" role="status">{t("Preparing the equipment study…")}</p>}
  </aside>
}
export function EndingReading({ chapter }: { chapter: number }) {
  const { t } = useTranslation()
  return <div className="ending-reading">{endingBeats(chapter).map(b => <article key={b.label}><h2>{t(b.title)}</h2><p>{t(b.body)}</p><p>{t(b.detail)}</p></article>)}<h2>{t("Equipment key")}</h2><dl>{endingParts(chapter).map(p => <div key={p.id}><dt>{t(p.name)}</dt><dd>{t(p.note)}</dd></div>)}</dl></div>
}
