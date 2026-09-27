import { journeyStops } from '../data/journey'
import type { StoryState } from './states'

// Pixel rounding must not leave an action pointing at the stop it just reached.
const tolerance = .003
export function nextJourneyIndex(state: Pick<StoryState, 'chapterIndex' | 'chapterProgress'>) {
  const index = journeyStops.findIndex(stop => stop.chapter > state.chapterIndex || (stop.chapter === state.chapterIndex && stop.local > state.chapterProgress + tolerance))
  return index < 0 ? journeyStops.length : index
}
export function previousJourneyIndex(state: Pick<StoryState, 'chapterIndex' | 'chapterProgress'>) {
  for (let index = journeyStops.length - 1; index >= 0; index--) {
    const stop = journeyStops[index]
    if (stop.chapter < state.chapterIndex || (stop.chapter === state.chapterIndex && stop.local < state.chapterProgress - tolerance)) return index
  }
  return -1
}
