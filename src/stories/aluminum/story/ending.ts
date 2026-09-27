import { smooth } from './states'

export function endingState(chapter: number, progress: number, reduced = false) {
  const count = chapter === 10 ? 3 : 4
  const value = Math.max(0, Math.min(.999999, progress)) * count
  const beat = Math.floor(value)
  const local = value - beat
  const stage = reduced ? 1 : smooth(local / .8)
  const fill = chapter === 10 ? (beat === 0 ? 0 : beat === 1 ? stage : 1) : (beat === 0 ? 0 : beat === 1 ? stage : 1)
  return { beat, local, fill, cooling: chapter === 11 && beat >= 2 ? (beat === 2 ? stage : 1) : 0, reveal: chapter === 11 && beat === 3 ? stage : 0, flowing: beat === 1 && local > 0 && local < .8 }
}

type EndingStatus = { state: 'idle' | 'loading' | 'ready' | 'failed'; selected: string | null; attempt: number }
let snapshot: EndingStatus = { state: 'idle', selected: null, attempt: 0 }
const listeners = new Set<() => void>()
export const endingStore = {
  get: () => snapshot,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
  set: (patch: Partial<EndingStatus>) => { snapshot = { ...snapshot, ...patch }; listeners.forEach(listener => listener()) },
}
