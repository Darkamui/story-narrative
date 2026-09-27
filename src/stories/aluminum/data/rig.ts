// Baked assembly vectors remain the baseline. Story-only reading gaps are in metres,
// not changes to physical dimensions. See docs/MILESTONE_3.md.
export const rigOverrides: Record<string, [number, number, number]> = {
  '10_EXPLOSION_shell_000': [0, -6.1, 0],
}

export const layerOffsets: Record<string, { offset: [number, number, number]; interval: [number, number] }> = {
  '04_PROCESS_metal_000': { offset: [0, -0.25, 0], interval: [0.55, 1] },
  '04_PROCESS_bath_000': { offset: [0, 0.2, 0], interval: [0.55, 1] },
  '04_PROCESS_crust_000': { offset: [0, 0.65, 0], interval: [0.55, 1] },
  '04_PROCESS_cover_000': { offset: [0, 1, 0], interval: [0.55, 1] },
  '02_REFRACTORY_bedding_000': { offset: [0, -0.4, 0], interval: [0.65, 1] },
  '02_REFRACTORY_firebrick_001': { offset: [0, -0.8, 0], interval: [0.65, 1] },
  '02_REFRACTORY_firebrick_000': { offset: [0, -1.2, 0], interval: [0.65, 1] },
  '02_REFRACTORY_insulation_000': { offset: [0, -1.6, 0], interval: [0.65, 1] },
  '10_EXPLOSION_cathode_002': { offset: [0, -0.3, 0], interval: [0.45, 0.95] },
}

export function rigInterval(name: string): [number, number] {
  if (name.includes('hooding')) return [0, 0.35]
  if (name.includes('superstructure') || name.includes('hardware_frame')) return [0.05, 0.5]
  if (name.includes('anodes')) return [0.2, 0.7]
  if (name.includes('busbars') || name.includes('hardware_flexes')) return [0.15, 0.55]
  if (name.includes('shell')) return [0.35, 0.9]
  if (name.includes('refractory')) return [0.45, 0.95]
  return [0.55, 1]
}
