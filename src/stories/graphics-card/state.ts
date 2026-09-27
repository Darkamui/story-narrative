import { beatIds } from './content'

export type Point = [number, number, number]
export type Marker = { part: string; label: string; offset: [number, number] }
export type Shot = { explosion: number; direction: Point; center?: Point; span?: number; zones?: readonly string[]; highlight?: readonly string[]; markers: Marker[] }
// Macro cameras crop the surrounding board, never enlarge or replace a component.
export const shots: readonly Shot[] = [
  { explosion: 0, direction: [0.55, 0.85, 1.15], markers: [] },
  { explosion: 0.8, direction: [0.45, 1.1, 1.2], markers: [{ part: 'Fan_hub_1', label: 'fans', offset: [80, -45] }, { part: 'Fin_bank_1_section_0', label: 'cooler', offset: [-110, -12] }, { part: 'PCB_laminate', label: 'board', offset: [75, 35] }] },
  { explosion: 0, direction: [0.08, 1, 0.5], center: [-0.04, 0.003, 0], span: 0.074, zones: ['board', 'processor', 'memory', 'power', 'pcie', 'connector', 'outputs'], highlight: ['processor'], markers: [{ part: 'GPU_die', label: 'gpu', offset: [70, -60] }] },
  { explosion: 0, direction: [0, 1, 0.18], center: [-0.04, 0.002, 0], span: 0.128, zones: ['board', 'processor', 'memory', 'power', 'pcie', 'connector', 'outputs'], highlight: ['memory'], markers: [{ part: 'Memory_04', label: 'memory', offset: [40, -65] }, { part: 'GPU_die', label: 'gpu', offset: [65, 35] }] },
  { explosion: 0, direction: [0.12, 1, 0.5], center: [-0.022, 0.003, 0], span: 0.25, zones: ['board', 'processor', 'memory', 'power', 'pcie', 'connector', 'outputs'], highlight: ['power', 'connector'], markers: [{ part: 'Power_16pin_housing', label: 'connector', offset: [-95, -45] }, { part: 'VRM_07_choke', label: 'regulator', offset: [-100, 45] }] },
  { explosion: 0.64, direction: [0.1, 0.3, 1], zones: ['processor', 'paste', 'contact'], markers: [{ part: 'GPU_die', label: 'gpu', offset: [70, 48] }, { part: 'GPU_contact_patch', label: 'paste', offset: [-75, -12] }, { part: 'Cold_plate', label: 'plate', offset: [70, -40] }] },
  { explosion: 0, direction: [0.15, -0.9, 0.8], zones: ['heatpipes', 'contact', 'fins'], highlight: ['heatpipes'], markers: [{ part: 'Heatpipe_02', label: 'pipes', offset: [70, -55] }, { part: 'Cold_plate', label: 'plate', offset: [-95, 55] }] },
  { explosion: 0.38, direction: [0.4, 0.75, 1.2], zones: ['fans', 'fins', 'heatpipes', 'contact', 'cooler'], markers: [{ part: 'Fan_hub_1', label: 'fans', offset: [65, -65] }, { part: 'Fin_bank_1_section_0', label: 'fins', offset: [-100, 50] }] },
  { explosion: 0, direction: [-1, 0.3, 0.12], center: [-0.148, 0.005, 0], span: 0.125, zones: ['board', 'processor', 'memory', 'power', 'pcie', 'connector', 'outputs'], highlight: ['outputs'], markers: [{ part: 'DP_1_housing', label: 'ports', offset: [60, -75] }] },
]
export function beatFromHash(hash: string) {
  const id = hash.replace(/^#/, '')
  if (id === 'deadline') return 0
  if (id === 'cooling') return 6
  return Math.max(0, beatIds.indexOf(id as typeof beatIds[number]))
}
export const assemblyMotion: Record<string, { offset: Point; window: [number, number] }> = {
  pcb: { offset: [0, 0, 0], window: [0, 1] }, pads: { offset: [0, 0.03, 0], window: [0.55, 1] },
  cooler: { offset: [0, 0.085, 0], window: [0.43, 0.9] }, fans: { offset: [0, 0.172, 0], window: [0.3, 0.72] },
  shroud: { offset: [0, 0.25, 0], window: [0.18, 0.6] }, backplate: { offset: [0, -0.1, 0], window: [0.22, 0.8] },
  bracket: { offset: [-0.045, 0, 0], window: [0.06, 0.25] }, screws: { offset: [0, 0.275, 0], window: [0, 0.16] },
  back_screws: { offset: [0, -0.125, 0], window: [0, 0.16] },
}
export function assemblyOffset(name: string, amount: number): Point {
  const motion = assemblyMotion[name]
  if (!motion) return [0, 0, 0]
  const t = Math.max(0, Math.min(1, (amount - motion.window[0]) / (motion.window[1] - motion.window[0])))
  const smooth = t * t * (3 - 2 * t)
  return motion.offset.map(value => value * smooth) as Point
}
export function zoneOpacity(zone: string, beat: number) {
  if (shots[beat].zones && !shots[beat].zones!.includes(zone)) return 0
  return beat === 6 && zone === 'fins' ? 0.12 : 1
}
