import { useTranslation } from '../i18n/locale'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { comparisonCopy as copy, comparisonPhases, comparisonSources } from '../data/anodeEffect'
import { sources } from '../data/sources'
import { storyStore } from '../story/store'
import { anodeEffectPhase, interfaceVisual } from '../story/anodeEffect'

function InterfaceDiagram({ reference = false }: { reference?: boolean }) {
  const { t } = useTranslation()
  const prefix = reference ? 'reference' : 'examined'
  return <svg viewBox="0 0 500 315" role="img" aria-label={`${t(reference ? copy.reference : copy.examined)}: ${t('carbon anode above electrolyte and liquid aluminium')}`}>
    <defs><pattern id={`${prefix}-film`} width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 7L7 0" stroke="#d6b88b" strokeWidth="2" /></pattern></defs>
    <rect x="55" y="108" width="390" height="135" className="comparison-bath" />
    <rect x="170" y="50" width="180" height="100" className="comparison-carbon" />
    <path d="M248 20V50" className="comparison-leader" /><text x="250" y="15" textAnchor="middle">{t(copy.anode)}</text>
    <rect x="55" y="244" width="390" height="37" className="comparison-metal" />
    <text x="250" y="268" textAnchor="middle" className="comparison-metal-label">{t(copy.metal)}</text>
    <text x="69" y="132">{t(copy.bath)}</text>
    <g data-dissolved="true" fill="none" stroke="#d6c59b">{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={88 + i % 6 * 62} cy={196 + Math.floor(i / 6) * 26} r="4" strokeDasharray="2 2" />)}</g>
    <g fill="#c5d1c6" stroke="#e4dfca">{[190, 225, 260, 295, 330].map(x => <ellipse key={x} data-gas-patch="true" cx={x} cy="157" rx="8" ry="6" />)}</g>
    <rect data-film="true" x="170" y="150" width="180" height="18" rx="5" fill={`url(#${prefix}-film)`} stroke="#d6b88b" opacity="0" />
    <path d="M352 159H400V84" className="comparison-leader" /><text x="400" y="72" textAnchor="middle" className="comparison-gas-label">{t(copy.bubbles)}</text>
    <path d="M110 216V295H185" className="comparison-leader" /><text x="192" y="300" className="comparison-small">{t(copy.alumina)}</text>
  </svg>
}

export function AnodeComparison({ seek }: { seek: (index: number, local: number) => void }) {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)
  const phase = useSyncExternalStore(storyStore.subscribe, () => anodeEffectPhase(storyStore.get().chapterProgress))
  const condition = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().abnormalStateMix < 0.05 ? 0 : storyStore.get().abnormalStateMix > 0.95 ? 2 : 1)
  useEffect(() => {
    const update = () => {
      const element = root.current
      if (!element) return
      const s = storyStore.get()
      const v = interfaceVisual(s.abnormalStateMix)
      const examined = element.querySelector('.examined-interface')!
      examined.querySelectorAll('[data-gas-patch]').forEach(node => node.setAttribute('rx', String(v.patchRadius)))
      examined.querySelector('[data-film]')?.setAttribute('opacity', String(v.filmOpacity))
      examined.querySelector('[data-dissolved]')?.setAttribute('opacity', String(v.dissolvedOpacity))
      const gasLabel = examined.querySelector('.comparison-gas-label')
      if (gasLabel) gasLabel.textContent = t(v.mix > 0.4 ? copy.film : copy.bubbles)
      const voltage = element.querySelector('[data-voltage-marker]')
      voltage?.setAttribute('transform', `translate(0 ${v.voltageY})`)
      element.dataset.mix = String(v.mix)
      if (import.meta.env.DEV) window.__CELL_COMPARE__ = v
    }
    update()
    const unsubscribe = storyStore.subscribe(update)
    return () => { unsubscribe(); if (import.meta.env.DEV) delete window.__CELL_COMPARE__ }
  }, [t])
  return <aside ref={root} className="anode-comparison" data-phase={comparisonPhases[phase].id} aria-label={t("Normal operation and anode effect comparison")}>
    <nav className="comparison-tabs" aria-label={t("Comparison stages")}>
      {[[0.08, copy.reference], [0.57, copy.effect], [0.96, comparisonPhases[3].label]].map(([position, label], i) => <button key={label} aria-current={(phase === 0 ? 0 : phase === 3 ? 2 : 1) === i ? 'step' : undefined} onClick={() => seek(8, Number(position))}>{t(String(label))}</button>)}
    </nav>
    <figure className="comparison-figure">
      <div className="interface-pair">
        <div className="reference-interface"><h2><span>01</span>{t(copy.reference)}</h2><InterfaceDiagram reference /></div>
        <div className="examined-interface"><h2><span>02</span>{t([copy.baseline, copy.changing, copy.effect][condition])}</h2><InterfaceDiagram /></div>
      </div>
      <figcaption>{t(copy.abstraction)}</figcaption>
    </figure>
    <div className="comparison-indicators">
      <section className="voltage-indicator" aria-label={`${t(copy.voltageTitle)}: ${t(condition === 0 ? copy.voltageBaseline : condition === 2 ? copy.voltageRaised : 'changing')}`}>
        <h3>{t(copy.voltageTitle)}</h3>
        <svg viewBox="0 0 280 104" aria-hidden="true"><path d="M28 10V87H258M28 76H250" fill="none" stroke="#71816e" strokeWidth="1" strokeDasharray="3 4" /><text x="36" y="22">{t(copy.voltageRaised)}</text><text x="36" y="96">{t(copy.voltageBaseline)}</text><g data-voltage-marker="true" transform="translate(0 76)"><path d="M145 0H246" stroke="#dbc097" strokeWidth="2" /><circle cx="246" r="5" fill="#dbc097" /></g></svg>
        <p>{t(copy.voltageNote)}</p>
      </section>
      <section className="availability-indicator"><h3>{t(copy.availabilityTitle)}</h3><p className="availability-state">{t(condition === 0 ? copy.sufficient : copy.depleted)}</p><p>{t(copy.gasNote)}</p></section>
      <section className="current-distinction"><h3>{t(copy.currentTitle)}</h3><p>{t(copy.currentNote)}</p></section>
    </div>
    <p className="comparison-context" aria-live="polite">{t(phase === 3 ? copy.returnNote : copy.scope)}</p>
  </aside>
}

export function ComparisonReading() {
  const { t } = useTranslation()
  return <div className="comparison-reading"><h2>{t(copy.readingTitle)}</h2><table><thead><tr><th scope="col">{t("Quantity")}</th><th scope="col">{t(copy.reference)}</th><th scope="col">{t(copy.effect)}</th></tr></thead><tbody>{copy.rows.map(row => <tr key={row.name}><th scope="row">{t(row.name)}</th><td>{t(row.normal)}</td><td>{t(row.effect)}</td></tr>)}</tbody></table>{comparisonPhases.map(phase => <article key={phase.id}><h3>{t(phase.title)}</h3><p>{t(phase.body)}</p><p>{t(phase.detail)}</p></article>)}<ul>{comparisonSources.map(id => <li key={id}><a href={sources[id].url}>{t(sources[id].title)}</a></li>)}</ul></div>
}

declare global { interface Window { __CELL_COMPARE__?: ReturnType<typeof interfaceVisual> } }
