import type { Shot } from './shots'
import type { SourceId } from './sources'

export type ProcessBeat = { id: string; label: string; title: string; body: string; detail: string; sources: SourceId[]; shot: Shot }
export const processBeats: ProcessBeat[] = [
  { id: 'feed', label: 'Feed', title: 'Open a path through the crust.', body: 'A crust breaker keeps the feed opening clear. A point feeder meters alumina into the bath.', detail: 'The highlighted centre feeder is one of five in this model. The motion illustrates a feeding cycle; it gives no dose, stroke setting or frequency.', sources: ['feeder', 'model'], shot: { name: 'POINT_FEEDER', position: [5.5, 6.3, 11], target: [0, 2.45, 0], fov: 36, focus: [0.48, 0.51] } },
  { id: 'dissolve', label: 'Dissolve', title: 'Dissolving is not yet making metal.', body: 'Alumina enters the molten fluoride electrolyte and dissolves. The electrolyte carries ionic current.', detail: 'Fading white grains indicate dissolution, not melting into aluminium. The diffuse marks stand for dissolved material; no particular ionic species or concentration is encoded.', sources: ['aac', 'hydro'], shot: { name: 'DISSOLUTION_CHANNEL', position: [3, 9, 13], target: [0, 1.1, -0.1], fov: 36, focus: [0.46, 0.5] } },
  { id: 'react', label: 'React', title: 'Two interfaces. One coupled reaction.', body: 'Reduction forms aluminium at the liquid-metal interface. At the carbon anode, oxidation produces mainly carbon dioxide.', detail: 'The interface diagram enlarges the bath gap. Its marks explain locations and directions, not molecular speciation or reaction rates. Some CO also forms; the equation is the idealised net reaction.', sources: ['offgas', 'hydro'], shot: { name: 'REACTION_CONTEXT', position: [3, 4.5, 9], target: [-0.425, 1, -1.05], fov: 38, focus: [0.47, 0.55] } },
  { id: 'carbon', label: 'Consume carbon', title: 'The anode is a reactant, too.', body: 'Carbon leaves the anode in the reaction products. Anodes are consumed and eventually replaced.', detail: 'The side-by-side block study exaggerates material loss. It is not an operating time scale, an anode-changing procedure or a depiction of the operating gap changing.', sources: ['aac', 'iai'], shot: { name: 'CARBON_CONTEXT', position: [3, 3, 8], target: [-0.425, 1.4, -1.05], fov: 37, focus: [0.47, 0.55] } },
  { id: 'gas', label: 'Collect gas', title: 'From the anode to the gas offtake.', body: 'Bubbles escape at anode edges and rise through the bath. The hood collects off-gas for extraction to treatment.', detail: 'The diagram gives the collection sequence, not a calculated streamline. Downstream dry scrubbing recovers fluorides and dust; it does not remove the CO₂. Treatment equipment is outside this single-cell model.', sources: ['bubbles', 'offgas', 'fives'], shot: { name: 'GAS_ENCLOSURE', position: [17, 12, 19], target: [2.5, 2.7, 0], fov: 38, focus: [0.45, 0.45] } },
  { id: 'heat', label: 'Retain heat', title: 'Keep the electrolyte molten.', body: 'Electrical resistance supplies heat. Cover and lining limit heat loss from the hot interior.', detail: 'Outward arrows show the direction of heat loss. They are not a temperature map or measured heat flux. Thermal balance and the frozen side ledge are operating concerns, not values estimated from the picture.', sources: ['aac', 'offgas', 'model'], shot: { name: 'THERMAL_SECTION', position: [1, 4, 21], target: [0, 0.8, 0], fov: 38, focus: [0.46, 0.53] } },
]

export const currentSteps = [
  { label: 'Anode supply', carrier: 'Electronic conduction', families: ['busbars', 'frame'] },
  { label: 'Carbon anodes (+)', carrier: 'Electronic conduction', families: ['anodes'] },
  { label: 'Electrolyte', carrier: 'Ionic conduction', families: ['bath'] },
  { label: 'Liquid aluminium (−)', carrier: 'Cathodic interface', families: ['metal'] },
  { label: 'Carbon / collector bars', carrier: 'Electronic conduction', families: ['cathode'] },
] as const

export const netReaction = '2 Al₂O₃ + 3 C → 4 Al + 3 CO₂'

export const operatingCaptions = {
  current: 'Electrons move oppositely to conventional current in the solid conductors. Charge is carried by ions in the bath.',
  concurrentTitle: 'These mechanisms run together',
  concurrentRoles: ['Alumina added', 'Electrolysis continues', 'Gas extracted', 'Metal collected'],
  concurrent: 'The story separated the explanations. The operating cell does not perform them one chapter at a time.',
  metalTitle: 'Reduction at the bath–metal interface',
  metal: 'New aluminium joins the denser metal pad beneath the electrolyte. Metal is tapped periodically.',
  metalNote: 'The highlighted interface marks where metal forms; it is not a measured production rate.',
}
