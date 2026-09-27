import { afterEach, expect, it, vi } from 'vitest'
import { loadStory } from './loadStory'

afterEach(() => vi.useRealTimers())
it('rejects stalled imports so the route can show retry and library navigation', async () => {
  vi.useFakeTimers()
  const result = expect(loadStory(() => new Promise(() => {}), 100)).rejects.toThrow('Story load timed out')
  await vi.advanceTimersByTimeAsync(100)
  await result
})
it('clears the timeout for both successful and failed imports', async () => {
  vi.useFakeTimers()
  await expect(loadStory(async () => 'loaded')).resolves.toBe('loaded')
  await expect(loadStory(async () => { throw new Error('offline') })).rejects.toThrow('offline')
  expect(vi.getTimerCount()).toBe(0)
})
