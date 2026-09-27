import { describe, expect, it } from 'vitest'
import { chapters } from '../data/content'
import { parts } from '../data/components'
import { explosion, partPosition } from '../data/explosion'
import { sources } from '../data/sources'
import { chapterStart, sampleStory, totalLength } from './states'

describe('deterministic narrative', () => {
  it('visits all chapters and clamps both ends', () => {
    chapters.forEach((chapter, i) => expect(sampleStory(chapterStart(i) + 0.001).chapterId).toBe(chapter.id))
    chapters.forEach((chapter, i) => expect(sampleStory(chapterStart(i)).chapterId).toBe(chapter.id))
    expect(sampleStory(-1).chapterIndex).toBe(0)
    expect(sampleStory(2).chapterIndex).toBe(11)
    expect(sampleStory(Number.NaN).globalProgress).toBe(0)
  })
  it('produces identical state after fast scrubbing, reversal and arbitrary seeks', () => {
    const positions = Array.from({ length: 151 }, (_, i) => i / 150)
    const forward = positions.map(p => sampleStory(p))
    const reverse = [...positions].reverse()
    reverse.forEach(p => sampleStory(p))
    positions.forEach((p, i) => expect(sampleStory(p)).toEqual(forward[i]))
  })
  it('has no discontinuities at chapter boundaries', () => {
    for (let i = 1; i < chapters.length; i++) {
      const before = sampleStory(chapterStart(i) - 1e-8)
      const after = sampleStory(chapterStart(i) + 1e-8)
      for (const key of ['explodedAmount', 'sectionAmount', 'cellVisibility', 'abnormalStateMix', 'tapping', 'casting'] as const) expect(Math.abs(before[key] - after[key])).toBeLessThan(0.00001)
    }
  })
  it('holds the exploded endpoint and restores exact assembly transforms', () => {
    expect(sampleStory(chapterStart(3) + chapters[3].length / totalLength * 0.85).explodedAmount).toBe(1)
    parts.forEach(part => {
      expect(explosion[part.family]).toBeDefined()
      partPosition(part.position, part.family, 1)
      expect(partPosition(part.position, part.family, 0)).toEqual(part.position)
    })
  })
  it('uses discrete reduced-motion states with the same complete narrative', () => {
    chapters.forEach((_, i) => {
      const start = chapterStart(i) + 0.0001
      const end = chapterStart(i) + chapters[i].length / totalLength * 0.9
      const a = sampleStory(start, true)
      const b = sampleStory(end, true)
      expect(a.explodedAmount).toBe(b.explodedAmount)
      expect(a.transition).toBe(1)
    })
  })
  it('links every chapter claim to existing source metadata', () => {
    chapters.forEach(chapter => {
      expect(chapter.sources.length).toBeGreaterThan(0)
      chapter.sources.forEach(id => expect(sources[id].title).toBeTruthy())
    })
  })
})
