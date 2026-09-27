// All fractions below are editorial scroll positions, never plant setpoints.
export function anodeEffectPhase(progress: number) {
  return progress < 0.18 ? 0 : progress < 0.45 ? 1 : progress < 0.72 ? 2 : 3
}

export function anodeEffectMix(progress: number, reduced = false) {
  const phase = anodeEffectPhase(progress)
  if (reduced) return phase === 1 || phase === 2 ? 1 : 0
  const ease = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t) }
  return ease((progress - 0.18) / 0.27) * (1 - ease((progress - 0.72) / 0.2))
}

// SVG display coordinates and opacity, deliberately without a physical scale.
export function interfaceVisual(mix: number) {
  const m = Math.max(0, Math.min(1, Number.isFinite(mix) ? mix : 0))
  return { mix: m, patchRadius: 8 + 12 * m, filmOpacity: Math.max(0, (m - 0.35) / 0.65), dissolvedOpacity: 1 - m * 0.9, voltageY: 76 - 48 * m }
}
