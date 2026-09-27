import type { Vec3 } from './components'
export type Shot = { name: string; position: Vec3; target: Vec3; fov: number; focus: [number, number] }
export const shots: Shot[] = [
  { name: 'MACRO_GRAIN', position: [0, 2.8, 7], target: [0, 1.2, 0], fov: 36, focus: [0.5, 0.34] },
  { name: 'CELL_REVEAL', position: [14, 10, 22], target: [0, 2, 0], fov: 40, focus: [0.46, 0.6] },
  { name: 'OVERHEAD_ASSEMBLIES', position: [7, 17, 15], target: [0, 2, 0], fov: 40, focus: [0.44, 0.61] },
  { name: 'EXPLODED_ATLAS', position: [22, 16, 32], target: [0, 2.5, 0], fov: 43, focus: [0.5, 0.57] },
  { name: 'LONGITUDINAL_SECTION', position: [1.5, 5.5, 22], target: [0, 1.15, 0], fov: 39, focus: [0.43, 0.62] },
  { name: 'CONDUCTOR_TO_CATHODE', position: [12, 8, 18], target: [1, 1.15, 0], fov: 38, focus: [0.43, 0.48] },
  { name: 'ELECTRODE_INTERFACES', position: [4, 5.3, 9], target: [0, 1, -0.6], fov: 38, focus: [0.43, 0.58] },
  { name: 'OPERATING_SECTION', position: [-10, 11, 19], target: [0, 1, 0], fov: 40, focus: [0.44, 0.51] },
  { name: 'INTERFACE_COMPARISON_CONTEXT', position: [-10, 11, 19], target: [0, 1, 0], fov: 40, focus: [0.44, 0.51] },
  { name: 'METAL_PAD', position: [10, 7, 14], target: [0, 0.85, -0.5], fov: 37, focus: [0.43, 0.59] },
  { name: 'TAPPING_TRANSITION', position: [7, 5, 12], target: [1, 0.5, 0], fov: 36, focus: [0.52, 0.43] },
  { name: 'CASTING_FORM', position: [7, 5.5, 11], target: [1, 0.4, 0], fov: 36, focus: [0.5, 0.44] },
]
export const layouts = ['opening', 'reveal', 'overhead', 'anatomy', 'section', 'current', 'detail', 'overview', 'comparison', 'metal', 'departure', 'ending'] as const
