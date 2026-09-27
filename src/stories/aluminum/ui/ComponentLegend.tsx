import { useTranslation } from '../i18n/locale'
import { useSyncExternalStore } from 'react'
import { assemblies, partLabel } from '../data/assemblies'
import { selectionStore } from '../story/selection'
import { allLabels, labelsFor, legendPosition } from '../data/anatomy'
import { anatomyStore } from '../story/anatomy'

export function ComponentLegend() {
  const { t, locale } = useTranslation()
  const detail = useSyncExternalStore(anatomyStore.subscribe, anatomyStore.get)
  const selected = useSyncExternalStore(selectionStore.subscribe, selectionStore.get)
  const inventory = useSyncExternalStore(selectionStore.subscribe, selectionStore.inventory)
  const current = assemblies.find(entry => entry.id === selected?.family)
  return <>
    <aside className="component-legend" aria-label={t("Cell components")}>
      <p className="legend-heading">{t("Inside the cell")} <span>{t("Component key")}</span></p>
      <ol>{labelsFor(detail).map(entry => <li key={entry.key} style={legendPosition(entry.key, detail)}>
        <button id={`legend-${entry.key}`} aria-pressed={selected?.family === entry.id && (!detail || selected.node === entry.anchor)} onClick={() => selectionStore.select(selected?.family === entry.id && (!detail || selected.node === entry.anchor) ? null : { family: entry.id, node: detail ? entry.anchor : null })}>
          <span className="component-number" style={{ color: entry.color }}>{entry.number}</span>
          <span>{t(entry.name)}<small id={`visibility-${entry.key}`}>{t("Locating…")}</small></span>
        </button>
      </li>)}</ol>
      <p className="legend-hint">{t("Select a name or a part to inspect.")}</p>
    </aside>
    {current && <aside className="part-inspector" aria-label={t("Selected component")}>
      <button className="inspector-close" aria-label={t("Close component details")} onClick={() => selectionStore.select(null)}>×</button>
      <p className="eyebrow">{current.number} {t("/ Component detail")}</p>
      <h2>{t(current.name)}</h2><p>{t(current.purpose)}</p>
      <label>{t("Individual part")}<select aria-label={t("Individual part")} value={selected?.node ?? ''} onChange={event => selectionStore.select({ family: current.id, node: event.target.value || null })}>
        <option value="">{t('Whole assembly · {count} parts', { count: inventory[current.id]?.length ?? 0 })}</option>
        {(inventory[current.id] ?? []).map(name => <option value={name} key={name}>{partLabel(name, locale)}</option>)}
      </select></label>
      {selected?.node && <p className="selected-part-name">{partLabel(selected.node, locale)} <span>{t("Highlighted in the scene when exposed.")}</span></p>}
      <p className="evidence-note">{t(current.evidence === 'assumed' ? 'Geometry: project assumption' : current.evidence === 'model' ? 'Reference: project design specification' : 'Process reference: International Aluminium Institute')}</p>
    </aside>}
  </>
}
export function LeaderOverlay() {
  return <svg className="leader-overlay" aria-hidden="true">{allLabels.map(entry => <g id={`leader-${entry.key}`} key={entry.key} opacity="0">
    <path id={`line-${entry.key}`} fill="none" stroke={entry.color} strokeWidth="0.8" opacity="0.5" />
    <circle id={`dot-${entry.key}`} r="3" fill={entry.color} />
    <text id={`marker-${entry.key}`} fill={entry.color} fontSize="10">{entry.number}</text>
  </g>)}</svg>
}
