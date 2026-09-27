import { frPartNames } from '../i18n/frParts'
import type { Locale } from '../i18n/locale'

export const assemblies = [
  { id: 'shell', name: 'Steel shell', number: '01', color: '#abbab7', purpose: 'The steel vessel and its external supporting cradles.', anchor: '01_SHELL_wall_side_000', evidence: 'model' },
  { id: 'lining', name: 'Protective lining', number: '02', color: '#c7ac83', purpose: 'Insulation, refractory backing and side lining around the working cavity.', anchor: '02_REFRACTORY_side_sic_000', evidence: 'model' },
  { id: 'cathode', name: 'Cathode & collector bars', number: '03', color: '#8ca7a7', purpose: 'Carbon bottom blocks and the bars that collect current from the cathode system.', anchor: '03_CATHODE_block_010', evidence: 'model' },
  { id: 'metal', name: 'Liquid aluminium', number: '04', color: '#e2e7e6', purpose: 'The metal pad beneath the electrolyte. This is the product of reduction.', anchor: '04_PROCESS_metal_000', evidence: 'iai' },
  { id: 'bath', name: 'Electrolyte bath', number: '05', color: '#dfad71', purpose: 'The molten electrolyte containing dissolved alumina; distinct from the aluminium beneath it.', anchor: '04_PROCESS_bath_000', evidence: 'iai' },
  { id: 'crust', name: 'Crust & cover', number: '06', color: '#ae9e85', purpose: 'The modeled frozen crust and cover over the working bath.', anchor: '04_PROCESS_crust_000', evidence: 'model' },
  { id: 'anodes', name: 'Carbon anodes', number: '07', color: '#96a49e', purpose: '36 carbon blocks with stems, yokes, stubs and clamps. Carbon is consumed during electrolysis.', anchor: '05_ANODES_block_008', evidence: 'iai' },
  { id: 'busbars', name: 'Electrical conductors', number: '08', color: '#c1a38d', purpose: 'Busbars, risers and flexible connections for the cell circuit.', anchor: '06_BUSBARS_riser_002', evidence: 'model' },
  { id: 'frame', name: 'Superstructure', number: '09', color: '#a0adb1', purpose: 'The overhead frame and anode beams. Its geometry is a project assumption, not a plant survey.', anchor: '07_SUPERSTRUCTURE_beam_000', evidence: 'assumed' },
  { id: 'feeders', name: 'Alumina feed system', number: '10', color: '#d7c5a4', purpose: 'Five modeled hoppers, chutes and crust-breaker assemblies. Exact equipment geometry remains assumed.', anchor: '07_SUPERSTRUCTURE_hopper_002', evidence: 'assumed' },
  { id: 'gas', name: 'Gas offtake', number: '11', color: '#b5c9c3', purpose: 'The modeled throat and duct connection above the hood. Detailed flow awaits process validation.', anchor: '07_SUPERSTRUCTURE_duct_000', evidence: 'assumed' },
  { id: 'hood', name: 'Hooding & end enclosures', number: '12', color: '#bac2b4', purpose: 'Removable panels and end enclosures around the cell. The source geometry is plausible-class.', anchor: '08_HOODING_panel_021', evidence: 'assumed' },
  { id: 'hardware', name: 'Mountings & adjustment', number: '13', color: '#c6bfaf', purpose: 'Jacks, mounting plates, gussets and flexible-connection clamps.', anchor: '09_HARDWARE_jack_006', evidence: 'model' },
] as const
export type AssemblyId = typeof assemblies[number]['id']

export function classifyNode(name: string): AssemblyId | undefined {
  if (name.startsWith('01_SHELL_')) return 'shell'
  if (name.startsWith('02_REFRACTORY_')) return 'lining'
  if (name.startsWith('03_CATHODE_')) return 'cathode'
  if (name.startsWith('04_PROCESS_metal_')) return 'metal'
  if (name.startsWith('04_PROCESS_bath_')) return 'bath'
  if (name.startsWith('04_PROCESS_')) return 'crust'
  if (name.startsWith('05_ANODES_')) return 'anodes'
  if (name.startsWith('06_BUSBARS_')) return 'busbars'
  if (/^07_SUPERSTRUCTURE_(hopper|chute|breaker|chisel)_/.test(name)) return 'feeders'
  if (/^07_SUPERSTRUCTURE_(duct|throat)_/.test(name)) return 'gas'
  if (name.startsWith('07_SUPERSTRUCTURE_')) return 'frame'
  if (name.startsWith('08_HOODING_')) return 'hood'
  if (name.startsWith('09_HARDWARE_')) return 'hardware'
  return undefined
}

const terms: Record<string, string> = { sic: 'silicon carbide', ramming: 'ramming paste', flex: 'flexible conductor', stem: 'anode stem', chisel: 'crust-breaker chisel', cover: 'cover', wall: 'wall', end: 'end', side: 'side' }
export function partLabel(name: string, locale: Locale = 'en') {
  const match = name.match(/^\d+_[A-Z_]+_([a-z_]+)_(\d+)$/)
  if (!match) return name
  if (locale === 'fr' && frPartNames[match[1]]) return `${frPartNames[match[1]]} ${Number(match[2]) + 1}`
  const term = match[1].split('_').map(word => terms[word] ?? word).join(' ')
  return `${term.charAt(0).toUpperCase()}${term.slice(1)} ${Number(match[2]) + 1}`
}
