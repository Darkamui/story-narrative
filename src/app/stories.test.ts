import { describe, expect, it } from 'vitest'
import { resolveRoute, stories } from './stories'
import { chapters } from '../stories/aluminum/data/content'

describe('story routes', () => {
  it('resolves only exact catalog paths, including a deployment base', () => {
    expect(resolveRoute('/').kind).toBe('home')
    expect(resolveRoute('/stories/aluminum/').kind).toBe('story')
    expect(resolveRoute('/stories/aluminum/extra').kind).toBe('missing')
    expect(resolveRoute('/stories/missing').kind).toBe('missing')
    expect(resolveRoute('/exhibits/', '/exhibits/').kind).toBe('home')
    expect(resolveRoute('/exhibits/stories/aluminum', '/exhibits/').kind).toBe('story')
    expect(resolveRoute('/stories/aluminum', '/exhibits/').kind).toBe('missing')
  })
  it('keeps legacy fragment support in sync with the published aluminum chapters', () => {
    expect(stories[0].legacyFragments).toEqual(chapters.map(chapter => chapter.id))
  })
})
