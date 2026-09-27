import { sampleStory, type StoryState, type VisualState } from './states'

let state = sampleStory(0)
let overrides: Partial<VisualState> = {}
const listeners = new Set<() => void>()
export const storyStore = {
  get: () => state,
  subscribe: (callback: () => void) => { listeners.add(callback); return () => { listeners.delete(callback) } },
  set(progress: number, reducedMotion: boolean) {
    state = { ...sampleStory(progress, reducedMotion), ...overrides }
    listeners.forEach(callback => callback())
  },
  override(values: Partial<VisualState>) { overrides = values; this.set(state.globalProgress, state.reducedMotion) },
}
export type { StoryState }
