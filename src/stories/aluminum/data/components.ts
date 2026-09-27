export type Vec3 = [number, number, number]
export type Part = { id: string; family: string; position: Vec3; size: Vec3; color: string; metalness: number; section?: boolean }
// Schematic scene units. These are layout choices, NOT physical measurements.
export const parts: Part[] = [
  { id: 'SHELL_BASE', family: 'shell', position: [0, -0.7, 0], size: [10, 0.28, 3.8], color: '#68736f', metalness: 0.65 },
  { id: 'SHELL_FRONT', family: 'shellFront', position: [0, 0, 1.88], size: [10, 1.45, 0.18], color: '#7b827b', metalness: 0.6, section: true },
  { id: 'SHELL_BACK', family: 'shellBack', position: [0, 0, -1.88], size: [10, 1.45, 0.18], color: '#68736f', metalness: 0.6 },
  ...[-1, 1].map((side): Part => ({ id: `SHELL_END_${side}`, family: 'shell', position: [side * 4.9, 0, 0], size: [0.2, 1.45, 3.6], color: '#68736f', metalness: 0.6 })),
  { id: 'REFRACTORY', family: 'refractory', position: [0, -0.44, 0], size: [9.6, 0.22, 3.45], color: '#b9a88c', metalness: 0 },
  { id: 'CATHODE', family: 'cathode', position: [0, -0.17, 0], size: [9.25, 0.3, 3.12], color: '#3a4140', metalness: 0.1 },
  { id: 'ALUMINUM_POOL', family: 'metal', position: [0, 0.075, 0], size: [9.1, 0.18, 3], color: '#dce4df', metalness: 0.85 },
  { id: 'BATH', family: 'bath', position: [0, 0.31, 0], size: [9.1, 0.27, 3], color: '#aa7144', metalness: 0.22 },
  ...Array.from({ length: 12 }, (_, i): Part => ({ id: `ANODE_${i.toString().padStart(2, '0')}`, family: 'anodes', position: [(i % 6 - 2.5) * 1.48, 0.83, i < 6 ? -0.82 : 0.82], size: [1.3, 0.78, 1.25], color: '#414745', metalness: 0.12 })),
  ...Array.from({ length: 12 }, (_, i): Part => ({ id: `ROD_${i}`, family: 'anodes', position: [(i % 6 - 2.5) * 1.48, 1.91, i < 6 ? -0.82 : 0.82], size: [0.14, 1.4, 0.14], color: '#bec6bf', metalness: 0.8 })),
  { id: 'BUSBAR_LEFT', family: 'busLeft', position: [0, -0.32, 2.38], size: [10.7, 0.32, 0.35], color: '#b39876', metalness: 0.75 },
  { id: 'BUSBAR_RIGHT', family: 'busRight', position: [0, 2.57, -1.2], size: [10.7, 0.32, 0.35], color: '#b39876', metalness: 0.75 },
  { id: 'SUPERSTRUCTURE', family: 'structure', position: [0, 3.15, 0], size: [10.6, 0.35, 0.5], color: '#a2aaa3', metalness: 0.6 },
  ...[-1, 1].map((side): Part => ({ id: `SUPPORT_${side}`, family: 'structure', position: [side * 4.7, 1.62, -1.7], size: [0.28, 3.1, 0.28], color: '#919b94', metalness: 0.6 })),
  { id: 'HOODING', family: 'hood', position: [0, 2.9, 0], size: [10.1, 0.18, 3.65], color: '#bec5ba', metalness: 0.55 },
]
