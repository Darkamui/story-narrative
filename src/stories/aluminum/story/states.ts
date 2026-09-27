import { chapters } from '../data/content'
import { anodeEffectMix } from './anodeEffect'

export const clamp = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0))
export const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t) }
export const totalLength = chapters.reduce((sum, chapter) => sum + chapter.length, 0)
export const chapterStart = (index: number) => chapters.slice(0, index).reduce((sum, chapter) => sum + chapter.length, 0) / totalLength
export type VisualState = {
  cellVisibility: number; grainVisibility: number; grainFall: number; explodedAmount: number;
  sectionAmount: number; currentIntensity: number; bubbleIntensity: number;
  aluminumVisibility: number; bathVisibility: number; abnormalStateMix: number; metalFocus: number; tapping: number; casting: number;
  feedIntensity: number; dissolutionIntensity: number; reactionIntensity: number; carbonConsumption: number; gasIntensity: number; heatIntensity: number;
}
const base: VisualState = { cellVisibility: 0, grainVisibility: 1, grainFall: 0, explodedAmount: 0, sectionAmount: 0, currentIntensity: 0, bubbleIntensity: 0, aluminumVisibility: 1, bathVisibility: 1, abnormalStateMix: 0, metalFocus: 0, tapping: 0, casting: 0, feedIntensity: 0, dissolutionIntensity: 0, reactionIntensity: 0, carbonConsumption: 0, gasIntensity: 0, heatIntensity: 0 }
const changes: Partial<VisualState>[] = [
  { grainFall: 1 }, { cellVisibility: 1, grainVisibility: 0 }, {}, { explodedAmount: 1 },
  { explodedAmount: 0, sectionAmount: 1 }, { currentIntensity: 1 }, { currentIntensity: 0, bubbleIntensity: 0.5, feedIntensity: 1, dissolutionIntensity: 1, reactionIntensity: 1, carbonConsumption: 1, gasIntensity: 1, heatIntensity: 1 }, {},
  { abnormalStateMix: 0 }, { abnormalStateMix: 0, currentIntensity: 0, bubbleIntensity: 0, metalFocus: 1 },
  { tapping: 1, cellVisibility: 0 }, { casting: 1 },
]
export const chapterTargets = changes.reduce<VisualState[]>((all, change) => [...all, { ...(all.at(-1) ?? base), ...change }], [])
export type StoryState = VisualState & { globalProgress: number; chapterIndex: number; chapterId: string; chapterProgress: number; transition: number; reducedMotion: boolean }

// Pure sampling: there are no accumulated deltas, time chains, or direction-dependent events.
export function sampleStory(progress: number, reducedMotion = false): StoryState {
  const p = clamp(progress)
  let remaining = p * totalLength
  let index = 0
  // Native fragment navigation can land exactly on a section boundary. Avoid
  // floating-point subtraction assigning that pixel to the preceding chapter.
  while (index < chapters.length - 1 && remaining + 1e-9 >= chapters[index].length) { remaining -= chapters[index].length; index++ }
  const local = clamp(remaining / chapters[index].length)
  const transition = reducedMotion ? 1 : smooth(local / 0.72)
  const from = index === 0 ? base : chapterTargets[index - 1]
  const to = chapterTargets[index]
  const visual = { ...base }
  for (const key of Object.keys(base) as (keyof VisualState)[]) visual[key] = from[key] + (to[key] - from[key]) * transition
  if (index === 4 && !reducedMotion) {
    visual.explodedAmount = 1 - smooth(local / 0.48)
    visual.sectionAmount = smooth((local - 0.48) / 0.24)
  }
  if (index === 6) {
    const entry = reducedMotion ? 1 : smooth(local / 0.04)
    visual.currentIntensity = 1 - entry
    for (const key of ['feedIntensity', 'dissolutionIntensity', 'reactionIntensity', 'carbonConsumption', 'gasIntensity', 'heatIntensity'] as const) visual[key] = entry
  }
  if (index === 8) visual.abnormalStateMix = anodeEffectMix(local, reducedMotion)
  // The ending is an explicitly separate sectional study, not the original pot.
  if (index === 9) visual.cellVisibility *= 1 - smooth((local - .8) / .2)
  if (index >= 10) visual.cellVisibility = 0
  return { ...visual, globalProgress: p, chapterIndex: index, chapterId: chapters[index].id, chapterProgress: local, transition, reducedMotion }
}
