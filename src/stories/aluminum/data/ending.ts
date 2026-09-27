import type { SourceId } from './sources'
import type { Shot } from './shots'

export type EndingBeat = { label: string; title: string; body: string; detail: string; eyebrow: string; sources: SourceId[]; shot: Shot }
const tapShot: Shot = { name: 'VACUUM_TAPPING_SECTION', position: [3.2, 4.6, 10.8], target: [-0.3, 1.1, 0], fov: 38, focus: [.5, .51] }
const castShot: Shot = { name: 'OPEN_MOULD_CASTING', position: [3, 4.4, 10.6], target: [-.8, .8, 0], fov: 38, focus: [.5, .51] }
export const tappingBeats: EndingBeat[] = [
  { label: 'Locate the metal', eyebrow: 'Tapping · a sectional study', title: 'Reach beneath the bath.', body: 'The tapping tube enters the aluminium pad below the electrolyte. The aim is to withdraw metal while limiting bath entrainment.', detail: 'The tube tip is shown in the metal layer. Sectioned walls reveal the mechanism; an operating crucible is closed. Equipment proportions are illustrative, not a replica of the Marc-400 installation.', sources: ['tapping'], shot: tapShot },
  { label: 'Draw into a crucible', eyebrow: 'Tapping · pressure difference', title: 'A pressure difference lifts the metal.', body: 'Reduced pressure in the crucible headspace draws liquid aluminium through the tapping tube. Choose Fill the crucible to draw the metal in.', detail: 'An air ejector regulates the crucible vacuum in the cited Fives system. The silver markers identify the liquid route, not particles, velocity or a measured flow rate. Fill levels are explanatory; no tapping settings are prescribed.', sources: ['tapping'], shot: tapShot },
  { label: 'Transfer', eyebrow: 'Beyond the cell', title: 'Next stop: the cast house.', body: 'The tapped metal travels in a crucible to the cast house. The story now leaves the reduction cell.', detail: 'This is a change of location, not a continuous pipe from cell to furnace. Transport machinery and the plant layout are omitted. The next view opens a separate casting study.', sources: ['hydro', 'tapping'], shot: { ...tapShot, name: 'CRUCIBLE_DEPARTURE', position: [4, 3.8, 8], target: [1, 1.1, 0] } },
]
export const castingBeats: EndingBeat[] = [
  { label: 'Prepare', eyebrow: 'Cast house · a separate location', title: 'Prepare the liquid metal.', body: 'The cast house controls composition and metal quality before casting. A holding furnace keeps metal available for the next operation.', detail: 'Alloy additions, degassing and filtration depend on the product and plant route. These treatments are described here, not represented by invented machinery. This study follows one open-mould foundry-ingot route; billets, slabs and other products use different casting routes.', sources: ['hydro', 'treatment', 'ingots'], shot: castShot },
  { label: 'Fill', eyebrow: 'Casting · give the liquid a boundary', title: 'The mould defines the form.', body: 'Liquid metal runs along a refractory-lined launder into an open mould. Choose Fill the mould to watch the level rise.', detail: 'The near mould wall is removed in this section. One enlarged mould stands in for a repeating ingot caster; the pouring control and full conveyor are omitted. Fill timing and dimensions are illustrative.', sources: ['ingots', 'airCasting'], shot: castShot },
  { label: 'Cool', eyebrow: 'Casting · remove heat', title: 'The same metal becomes solid.', body: 'Heat leaves the filled mould and aluminium solidifies. This example selects an air-cooled ingot casting route.', detail: 'Hertwich describes primary air cooling of filled moulds and secondary cooling of released ingots. The arrows indicate cooling air, not a thermal simulation. The muted silver surface changes roughness to distinguish liquid from solid; it is not a thermometer.', sources: ['airCasting'], shot: { ...castShot, name: 'MOULD_COOLING', position: [4, 3.4, 7.5], target: [1, .7, 0] } },
  { label: 'Reveal', eyebrow: 'From alumina to aluminium', title: 'A grain becomes possibility.', body: 'Refining supplied the alumina. Electrolysis produced the metal. Casting gives that metal a solid form—and a new beginning.', detail: 'The solid ingot is isolated above its mould as an editorial reveal, not a depiction of a demoulding mechanism. The grain was our guide: this is not a one-grain mass balance or a specified alloy. A real casting line continues through cooling, handling and inspection.', sources: ['refining', 'hydro', 'airCasting'], shot: { name: 'INGOT_RESOLUTION', position: [3.4, 3.4, 5.8], target: [1.45, 1.8, 0], fov: 36, focus: [.5, .48] } },
]
export const endingBeats = (chapter: number) => chapter === 10 ? tappingBeats : castingBeats
export type EndingPart = { id: string; name: string; prefixes: string[]; anchor: [number, number, number]; note: string }
export const tappingParts: EndingPart[] = [
  { id: 'bath', name: 'Electrolyte bath', prefixes: ['TAP_electrolyte'], anchor: [-2.6,.84,0], note: 'Electrolyte remains above the metal pad.' },
  { id: 'pad', name: 'Liquid aluminium pad', prefixes: ['TAP_metal_pad'], anchor: [-2.7,.46,.65], note: 'Metal is withdrawn from this lower layer.' },
  { id: 'cell', name: 'Cathode & cell lining', prefixes: ['TAP_cell','TAP_cathode'], anchor: [-3.5,.2,.65], note: 'A simplified section of the cell floor and lining.' },
  { id: 'tube', name: 'Tapping tube', prefixes: ['TAP_tube'], anchor: [-.5,2.35,-.18], note: 'Connects the metal pad to the crucible; the tube tip is submerged in metal.' },
  { id: 'crucible', name: 'Lined tapping crucible', prefixes: ['TAP_crucible','TAP_lifting'], anchor: [2.8,.8,0], note: 'Shell, refractory lining, floor, lid and lifting attachment. Cut open here to show the rising metal.' },
  { id: 'vacuum', name: 'Vacuum connection', prefixes: ['TAP_vacuum'], anchor: [3.1,2.65,-.45], note: 'Connects the crucible headspace to the vacuum system; the air ejector is outside this study.' },
]
export const castingParts: EndingPart[] = [
  { id: 'furnace', name: 'Holding furnace & metal', prefixes: ['CAST_holding','CAST_furnace'], anchor: [-2.8,1.5,0], note: 'Section through the refractory lining, cladding and held metal. Melt preparation precedes filling.' },
  { id: 'launder', name: 'Refractory-lined launder', prefixes: ['CAST_launder'], anchor: [-.5,.95,0], note: 'A channel conveying liquid metal towards the mould.' },
  { id: 'mould', name: 'Open ingot mould', prefixes: ['CAST_mould'], anchor: [2.25,.7,.5], note: 'The near wall is removed to reveal filling and solidification.' },
  { id: 'air', name: 'Cooling-air duct & outlets', prefixes: ['CAST_cooling','CAST_air'], anchor: [1.45,.8,-1], note: 'Schematic air supply for the selected air-cooled casting route.' },
  { id: 'support', name: 'Caster support', prefixes: ['CAST_support'], anchor: [.3,.1,.8], note: 'Illustrative support structure. A full industrial conveyor is not represented.' },
  { id: 'ingot', name: 'Aluminium in the mould', prefixes: ['CAST_solid'], anchor: [1.45,.8,0], note: 'Liquid during filling; solid after heat removal. The final lift is an editorial isolation of the ingot.' },
]
export const endingParts = (chapter: number) => chapter === 10 ? tappingParts : castingParts
