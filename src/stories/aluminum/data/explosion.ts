import type { Vec3 } from './components'
import { smooth } from '../story/states'
export type Explosion = { offset: Vec3; start: number; end: number }
export const explosion: Record<string, Explosion> = {
  hood: { offset: [0, 3.1, 0], start: 0, end: 0.3 },
  structure: { offset: [0, 3.1, -1.5], start: 0, end: 0.35 },
  shell: { offset: [0, -1.8, 0], start: 0.12, end: 0.55 },
  shellFront: { offset: [0, -1.8, 1.4], start: 0.12, end: 0.55 },
  shellBack: { offset: [0, -1.8, -1.4], start: 0.12, end: 0.55 },
  refractory: { offset: [0, -1.25, 0], start: 0.25, end: 0.6 },
  cathode: { offset: [0, -0.7, 0], start: 0.45, end: 0.85 },
  anodes: { offset: [0, 2.35, 0], start: 0.3, end: 0.75 },
  busLeft: { offset: [0, 0, 1.8], start: 0.4, end: 0.8 },
  busRight: { offset: [0, 0, -2.1], start: 0.4, end: 0.8 },
  bath: { offset: [0, 0.65, 0], start: 0.6, end: 0.95 },
  metal: { offset: [0, 0, 0], start: 0, end: 1 },
}
export function partPosition(base: Vec3, family: string, amount: number): Vec3 {
  const entry = explosion[family]
  if (!entry) return [...base]
  const t = smooth((amount - entry.start) / (entry.end - entry.start))
  return base.map((value, axis) => value + entry.offset[axis] * t) as Vec3
}
