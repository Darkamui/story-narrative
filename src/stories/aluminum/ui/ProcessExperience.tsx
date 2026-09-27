import { useTranslation } from '../i18n/locale'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { currentSteps, netReaction, operatingCaptions, processBeats } from '../data/operating'
import { storyStore } from '../story/store'
import { currentStep, feederCycle, operatingBeat } from '../story/operating'
import { sources } from '../data/sources'

export function ProcessExperience({ seek }: { seek: (index: number, local: number) => void }) {
  const { t } = useTranslation()
  const root = useRef<HTMLDivElement>(null)
  const chapter = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().chapterIndex)
  const beat = useSyncExternalStore(storyStore.subscribe, () => chapter === 6 ? operatingBeat(storyStore.get()).index : currentStep(storyStore.get().chapterProgress))
  useEffect(() => {
    const update = () => {
      const element = root.current
      if (!element) return
      const s = storyStore.get()
      const { progress, reveal } = operatingBeat(s)
      const set = (id: string, attribute: string, value: number | string) => element.querySelector(`[data-motion="${id}"]`)?.setAttribute(attribute, String(value))
      const p = s.reducedMotion ? 0.85 : progress
      const cycle = feederCycle(p)
      set('chisel', 'transform', `translate(0 ${cycle.stroke * 44 * s.feedIntensity})`)
      set('dose', 'opacity', cycle.dose * s.feedIntensity)
      set('dissolve-grain', 'transform', `translate(235 135) scale(${(1 - reveal * 0.96) * s.dissolutionIntensity})`)
      set('dissolved', 'opacity', reveal * s.dissolutionIntensity)
      set('metal-interface', 'opacity', (0.3 + reveal * 0.7) * s.reactionIntensity)
      set('remaining-carbon', 'height', 130 - 75 * reveal * s.carbonConsumption)
      set('consumed-carbon', 'y', 95 + 130 - 75 * reveal * s.carbonConsumption)
      set('consumed-carbon', 'height', 75 * reveal * s.carbonConsumption)
      set('gas-route', 'stroke-dashoffset', (1 - reveal * s.gasIntensity) * 650)
      set('heat-arrows', 'opacity', s.heatIntensity)
      element.querySelectorAll('.svg-bath').forEach(node => node.setAttribute('opacity', String(s.bathVisibility)))
      element.querySelectorAll('[data-bubble]').forEach((node, i) => {
        const u = (p * 1.5 + i / 5) % 1
        const x = u < 0.6 ? 300 + u / 0.6 * 215 : 515
        const y = u < 0.6 ? 174 : 174 - (u - 0.6) / 0.4 * 58
        node.setAttribute('cx', String(x)); node.setAttribute('cy', String(y))
        node.setAttribute('opacity', String(s.bubbleIntensity * 1.7))
      })
    }
    update()
    return storyStore.subscribe(update)
  }, [beat, chapter])
  return <div ref={root} className={`process-experience process-${chapter === 6 ? processBeats[beat].id : chapter}`}>
    {chapter === 6 && <nav className="process-tabs" aria-label={t("Electrolysis mechanisms")}>{processBeats.map((item, i) => <button key={item.id} aria-current={i === beat ? 'step' : undefined} onClick={() => seek(6, (i + 0.55) / processBeats.length)}><span>{String(i + 1).padStart(2, '0')}</span>{t(item.label)}</button>)}</nav>}
    {chapter === 5 && <aside className="electrical-diagram" aria-label={t("Conventional current circuit")}>
      <p className="diagram-eyebrow">{t("Conventional current direction →")} <span>{t("Connection diagram · external potline omitted")}</span></p>
      <ol>{currentSteps.map((step, i) => <li key={step.label} data-current={i === beat}><button aria-current={i === beat ? 'step' : undefined} onClick={() => seek(5, (i + .6) / currentSteps.length)}><span>{String(i + 1).padStart(2, '0')}</span><strong>{t(step.label)}</strong><small>{t(step.carrier)}</small></button></li>)}</ol>
      <p>{t(operatingCaptions.current)}</p>
    </aside>}
    {chapter === 6 && <figure className={`mechanism-figure mechanism-${processBeats[beat].id}`} aria-label={t('{mechanism} mechanism diagram', { mechanism: t(processBeats[beat].label) })}>
      <svg viewBox="0 0 800 360" role="img" aria-label={`${t(processBeats[beat].title)} ${t('Schematic diagram; dimensions and timing are not to scale.')}`}>
        <defs>
          <marker id="process-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="currentColor" /></marker>
          <pattern id="carbon-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#d5b58b" strokeWidth="1" /></pattern>
        </defs>
        {beat === 0 && <>
          <text x="35" y="48" className="svg-kicker">{t("A REPRESENTATIVE FEED OPENING")}</text>
          <path d="M160 75H285L253 125H190Z" className="svg-hopper" /><text x="320" y="96">{t("Alumina metering")}</text>
          <path d="M210 125V215H238V125" className="svg-outline" />
          <g data-motion="chisel"><path d="M165 100V205" stroke="#c8d2cf" strokeWidth="12" /><path d="M156 205H174L165 220Z" fill="#c8d2cf" /></g>
          <text x="35" y="150">{t("Crust breaker")}</text><path d="M130 153H153" className="svg-leader" />
          <path d="M85 240H145M255 240H620" stroke="#b7a58a" strokeWidth="16" /><text x="530" y="220">{t("Frozen crust")}</text>
          <rect x="85" y="253" width="535" height="55" className="svg-bath" /><text x="410" y="285">{t("Electrolyte bath")}</text>
          <g data-motion="dose" fill="#f0e8d9">{[0, 1, 2, 3, 4].map(i => <circle key={i} cx={222 + (i % 2 ? 8 : -6)} cy={220 + i * 14} r="4" />)}</g>
          <text x="85" y="340" className="svg-note">{t("Break the crust → retract the chisel → add alumina")}</text>
        </>}
        {beat === 1 && <>
          <text x="35" y="48" className="svg-kicker">{t("FROM SOLID FEED TO DISSOLVED MATERIAL")}</text>
          <rect x="70" y="80" width="640" height="205" rx="3" className="svg-bath" />
          <g data-motion="dissolve-grain"><path d="M-20 -17L9 -24L25 0L6 24L-22 12Z" fill="#f4eee1" /></g>
          <g data-motion="dissolved" opacity="0">{Array.from({ length: 16 }, (_, i) => <circle key={i} cx={140 + (i % 8) * 65} cy={143 + Math.floor(i / 8) * 63} r="13" fill="none" stroke="#eed9b4" strokeDasharray="2 5" />)}</g>
          <text x="92" y="111">{t("Molten fluoride electrolyte")}</text><text x="92" y="267">{t("Alumina dissolves here")}</text>
          <text x="70" y="325" className="svg-note">{t("Marks represent dissolved material, not identified ions or molecules.")}</text>
        </>}
        {beat === 2 && <>
          <rect x="160" y="120" width="435" height="144" className="svg-bath" />
          <rect x="240" y="50" width="240" height="118" rx="2" className="svg-carbon" /><text x="275" y="89">{t("Carbon anode (+)")}</text><text x="272" y="112" className="svg-note">{t("Oxidation / mainly CO₂")}</text>
          <path d="M360 7V46" className="svg-arrow" /><text x="390" y="27" className="svg-note">{t("Conventional current")}</text>
          <rect x="160" y="266" width="435" height="47" className="svg-metal" /><text x="278" y="295" className="svg-metal-label">{t("Liquid aluminium (−)")}</text>
          <rect x="160" y="259" width="435" height="7" fill="#f9eed6" data-motion="metal-interface" />
          <text x="18" y="208">{t("Ionic current")}</text><path d="M125 215H150" className="svg-leader" />
          <path d="M360 188V249" className="svg-arrow" /><text x="385" y="222" className="svg-note">{t("Electrolyte")}</text>
          <text x="616" y="251">{t("Reduction")}</text><text x="616" y="274" className="svg-note svg-interface-note">{t("Aluminium forms here")}</text><path d="M598 263H610" className="svg-leader" />
          <text x="551" y="88">{t("CO₂")}</text><path d="M527 118L547 91" className="svg-leader" />
          {[0, 1, 2, 3, 4].map(i => <circle key={i} data-bubble={i} cx="300" cy="174" r="5" fill="#d8e3db" />)}
          <text x="160" y="345" className="svg-note">{t("Bath gap enlarged • bubbles pass around the anode edge")}</text>
        </>}
        {beat === 3 && <>
          <text x="60" y="47" className="svg-kicker">{t("CARBON ENTERS THE REACTION PRODUCTS")}</text>
          <rect x="90" y="95" width="180" height="130" className="svg-carbon" /><text x="108" y="260">{t("Earlier carbon block")}</text>
          <path d="M303 156H405" className="svg-arrow" />
          <rect x="445" y="95" width="180" height="130" fill="none" stroke="#6f8176" strokeDasharray="4 5" />
          <rect x="445" y="95" width="180" height="100" className="svg-carbon" data-motion="remaining-carbon" />
          <rect x="445" y="195" width="180" height="30" fill="url(#carbon-hatch)" data-motion="consumed-carbon" />
          <text x="459" y="260">{t("Remaining carbon")}</text><path d="M640 198L700 148" className="svg-arrow" /><text x="663" y="125">{t("Mainly CO₂")}</text>
          <text x="90" y="316" className="svg-note">{t("Hatched area: carbon consumed • material comparison, not operating position")}</text>
        </>}
        {beat === 4 && <>
          <text x="35" y="55" className="svg-kicker">{t("OFF-GAS COLLECTION / PROCESS CONNECTIONS")}</text>
          <path d="M85 214V136H300V190H507V136H710" fill="none" stroke="#4e6259" strokeWidth="2" />
          <path d="M85 214V136H300V190H507V136H710" fill="none" stroke="#c8d8ca" strokeWidth="3" strokeDasharray="650" data-motion="gas-route" markerEnd="url(#process-arrow)" />
          <text x="35" y="254">{t("Anode bubbles")}</text><text x="215" y="107">{t("Hood / plenum")}</text><text x="452" y="228">{t("Duct outlet")}</text><text x="780" y="107" textAnchor="end">{t("Gas treatment")}</text>
          <text x="595" y="161" className="svg-note">{t("Beyond the model")}</text><text x="35" y="317" className="svg-note">{t("Fluorides and dust recovered • CO₂ passes through ordinary dry scrubbing")}</text>
        </>}
        {beat === 5 && <>
          <text x="35" y="48" className="svg-kicker">{t("ENERGY INPUT AND HEAT LOSS")}</text>
          <rect x="185" y="87" width="400" height="185" fill="#b3987140" stroke="#b69f7b" /><rect x="220" y="111" width="330" height="135" className="svg-carbon" /><rect x="245" y="135" width="280" height="85" className="svg-bath" />
          <text x="285" y="175">{t("Electrical resistance")}</text><text x="310" y="197" className="svg-note">{t("supplies heat")}</text>
          <g data-motion="heat-arrows"><path d="M595 168H710M175 168H65M385 280V330" className="svg-arrow" /></g>
          <text x="780" y="143" textAnchor="end">{t("Heat loss")}</text><text x="37" y="301">{t("Lining and cover limit losses")}</text>
          <text x="780" y="337" textAnchor="end" className="svg-note">{t("Direction only • no temperature scale")}</text>
        </>}
      </svg>
      <figcaption>{beat === 2 ? <><strong>{netReaction}</strong> {t("Idealised net reaction · carbon-anode Hall–Héroult process")}</> : t('Explanatory diagram · dimensions, quantities and timing are illustrative')}</figcaption>
    </figure>}
    {chapter === 7 && <aside className="operation-summary" aria-label={t("Continuous operation")}><p className="diagram-eyebrow">{t(operatingCaptions.concurrentTitle)}</p><div>{operatingCaptions.concurrentRoles.map(role => <span key={role}>{t(role)}</span>)}</div><p>{t(operatingCaptions.concurrent)}</p></aside>}
    {chapter === 9 && <aside className="metal-caption"><strong>{t(operatingCaptions.metalTitle)}</strong><p>{t(operatingCaptions.metal)}</p><span>{t(operatingCaptions.metalNote)}</span></aside>}
  </div>
}

export function ProcessReading() {
  const { t } = useTranslation()
  return <div className="process-reading">{processBeats.map(beat => <article key={beat.id}><h2>{t(beat.title)}</h2><p>{t(beat.body)}</p><p>{t(beat.detail)}</p><ul>{beat.sources.map(id => <li key={id}>{id === 'model' ? t(sources[id].title) : <a href={sources[id].url}>{t(sources[id].title)}</a>}</li>)}</ul></article>)}<p>{t("Idealised net reaction:")} {netReaction}</p></div>
}
