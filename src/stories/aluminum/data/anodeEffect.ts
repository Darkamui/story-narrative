import type { SourceId } from './sources'

export const comparisonSources: SourceId[] = ['anodeStudy', 'iai', 'lowVoltagePfc']
export const comparisonPhases = [
  { id: 'baseline', label: 'Normal reference', title: 'Begin with the working interface.', body: 'Gas bubbles already form during normal electrolysis. Compare the same carbon surface as the local supply of dissolved alumina becomes insufficient.', detail: 'Both panels use the same enlarged geometry. The left panel holds the normal reference; the right panel changes as you explore. Neither panel is a molecular simulation or a measured operating trace.' },
  { id: 'onset', label: 'Alumina becomes insufficient', title: 'Less alumina. A changing interface.', body: 'Local alumina depletion can lead to an anode effect. Gas coverage at the carbon surface increases, impeding contact with the electrolyte.', detail: 'The fading rings represent reduced availability of dissolved alumina, not identified ions or a concentration scale. The sequence explains an association, not a predictive model of onset.' },
  { id: 'effect', label: 'Anode effect', title: 'The interface changes. Voltage rises.', body: 'A resistive gas film covers the anode surface. In a conventional full-cell anode effect, voltage rises and PFC gases can form.', detail: 'PFCs include CF₄ and C₂F₆. They are not the CO₂ produced by the normal carbon-anode reaction. Low-voltage PFC emissions can also occur without a conventional full-cell voltage spike; a normal voltage indication does not certify zero PFC emissions.' },
  { id: 'return', label: 'Return to normal', title: 'An upset, not a production stage.', body: 'Plant intervention is needed to end an anode effect. This story now returns to the normal reference before following the collected metal.', detail: 'The reverse transition is an editorial return to the baseline. It does not show spontaneous recovery, a corrective operating procedure, a recovery time or a measured voltage trajectory.' },
] as const

export const comparisonCopy = {
  reference: 'Normal reference', examined: 'Interface under examination',
  baseline: 'Normal interface', changing: 'Changing interface', effect: 'Anode effect',
  anode: 'Carbon anode (+)', bath: 'Electrolyte', metal: 'Liquid aluminium (−)',
  bubbles: 'Gas bubbles', film: 'Resistive gas film', alumina: 'Dissolved alumina',
  gasNote: 'Normal gas: mainly CO₂. Anode effect: PFCs can also form.',
  abstraction: 'Enlarged schematic · rings, gas coverage and timing have no measurement scale',
  voltageTitle: 'Cell voltage', voltageBaseline: 'Normal', voltageRaised: 'Elevated',
  voltageNote: 'Qualitative indication · no volts or time scale',
  currentTitle: 'Current ≠ voltage', currentNote: 'A voltage rise is not a current increase. No current increase is encoded here.',
  availabilityTitle: 'Alumina availability', sufficient: 'Available', depleted: 'Insufficient locally',
  returnNote: 'Returning to the reference after intervention; the operating procedure is not depicted.',
  scope: 'Conventional full-cell anode effect. Local PFC emissions need not produce this voltage spike.',
  readingTitle: 'Compare the same interface',
  rows: [
    { name: 'Dissolved alumina', normal: 'Available to the reaction', effect: 'Insufficient near the affected anode' },
    { name: 'Anode surface', normal: 'Gas bubbles form and release', effect: 'Resistive gas coverage impedes contact with the bath' },
    { name: 'Cell voltage', normal: 'Normal operating reference', effect: 'Rises in a conventional full-cell anode effect' },
    { name: 'Gas chemistry', normal: 'Mainly CO₂ from the carbon-anode reaction', effect: 'PFC gases, including CF₄ and C₂F₆, can form' },
  ],
}
