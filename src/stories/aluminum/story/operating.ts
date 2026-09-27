import { processBeats } from '../data/operating'
import { clamp, smooth, type StoryState } from './states'

export function operatingBeat(state: Pick<StoryState, 'chapterProgress' | 'reducedMotion'>) {
  const position = clamp(state.chapterProgress) * processBeats.length
  const index = Math.min(processBeats.length - 1, Math.floor(position))
  const progress = clamp(position - index)
  return { index, progress, reveal: state.reducedMotion ? 1 : smooth(progress / 0.65) }
}

export function currentStep(progress: number) { return Math.min(4, Math.floor(clamp(progress) * 5)) }

// A representative cycle, not a control sequence or a dosing recommendation.
export function feederCycle(progress: number) {
  return { stroke: progress < 0.22 ? smooth(progress / 0.22) : 1 - smooth((progress - 0.22) / 0.2), dose: smooth((progress - 0.44) / 0.4) }
}

// Bubble travels under the working face, clears its edge, then rises outside it.
export function bubblePosition(t: number, anode: { minX: number; maxX: number; bottom: number; edgeZ: number }, bathTop: number, lane: number): [number, number, number] {
  const u = clamp(t)
  const x = anode.minX + (anode.maxX - anode.minX) * (0.2 + lane * 0.2)
  const edge = anode.edgeZ + 0.07
  return u < 0.6 ? [x, anode.bottom - 0.015, anode.edgeZ - 0.45 + u / 0.6 * 0.52] : [x, anode.bottom - 0.015 + (bathTop - anode.bottom + 0.055) * (u - 0.6) / 0.4, edge]
}
