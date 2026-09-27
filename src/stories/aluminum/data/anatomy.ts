import { assemblies, type AssemblyId } from './assemblies'

export const anatomyStages = [
  { until: 0.2, title: '01 / Open the enclosure', body: 'The hood panels withdraw to reveal the assemblies they enclose.' },
  { until: 0.5, title: '02 / Clear the conductors', body: 'The frame rises. Conductors separate sideways, with their clamps attached.' },
  { until: 0.7, title: '03 / Lift the electrodes', body: 'The carbon anodes lift, exposing the crust and the layers below.' },
  { until: 0.98, title: '04 / Read the vertical stack', body: 'Bath, metal and cathode separate. The lining opens into individual courses.' },
  { until: 1.01, title: '05 / Hold and inspect', body: 'Explore the whole cell or move closer to the inner layers.' },
]
export const detailFamilies: AssemblyId[] = ['shell', 'lining', 'cathode', 'metal', 'bath', 'crust']
const layerSpecs: [AssemblyId, string, string, string][] = [
  ['crust', '06b', 'Alumina cover', '04_PROCESS_cover_000'],
  ['crust', '06a', 'Frozen crust', '04_PROCESS_crust_000'],
  ['bath', '05', 'Electrolyte bath', '04_PROCESS_bath_000'],
  ['metal', '04', 'Liquid aluminium', '04_PROCESS_metal_000'],
  ['cathode', '03', 'Cathode & collector bars', '03_CATHODE_block_010'],
  ['lining', '02a', 'Side lining & ledge', '02_REFRACTORY_side_backing_001'],
  ['lining', '02b', 'Alumina bedding', '02_REFRACTORY_bedding_000'],
  ['lining', '02c', 'Upper firebrick course', '02_REFRACTORY_firebrick_001'],
  ['lining', '02d', 'Lower firebrick course', '02_REFRACTORY_firebrick_000'],
  ['lining', '02e', 'Insulating board', '02_REFRACTORY_insulation_000'],
  ['shell', '01', 'Steel shell', '01_SHELL_wall_side_001'],
]
export const layerLabels = layerSpecs.map(([id, number, name, anchor]) => ({
  ...assemblies.find(entry => entry.id === id)!, id, key: number, number, name, anchor,
}))
export const assemblyLabels = assemblies.map(entry => ({ ...entry, key: entry.id }))
export const allLabels = [...assemblyLabels, ...layerLabels]
export function labelsFor(detail: boolean) { return detail ? layerLabels : assemblyLabels }

export function legendPosition(key: string, detail: boolean) {
  const columns = detail
    ? [['06b', '06a', '05', '04', '03'], ['02a', '02b', '02c', '02d', '02e', '01']]
    : [['anodes', 'crust', 'bath', 'metal', 'cathode', 'lining', 'shell'], ['feeders', 'gas', 'frame', 'hood', 'hardware', 'busbars']]
  const side = columns[0].includes(key) ? 0 : 1
  return { gridColumn: side === 0 ? 1 : 3, gridRow: columns[side].indexOf(key) + 1 }
}
