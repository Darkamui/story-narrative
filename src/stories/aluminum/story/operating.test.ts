import { describe, expect, it } from 'vitest'
import { bubblePosition, feederCycle, operatingBeat } from './operating'
import { processBeats } from '../data/operating'
import { sources } from '../data/sources'
import { chapters } from '../data/content'
import { chapterStart, sampleStory, totalLength } from './states'

describe('operating mechanisms', () => {
  it('keeps all six mechanisms reachable in both motion modes and on reversal', () => {
    for (const reduced of [false, true]) {
      for (const index of [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0]) {
        const state = sampleStory(chapterStart(6) + chapters[6].length / totalLength * (index + 0.55) / 6, reduced)
        const beat = operatingBeat(state)
        expect(beat.index).toBe(index)
        expect(beat.progress).toBeCloseTo(0.55, 5)
        if (reduced) expect(beat.reveal).toBe(1)
        processBeats[index].sources.forEach(id => expect(sources[id]).toBeDefined())
      }
    }
  })
  it('withdraws the breaker before the illustrative dose enters', () => {
    expect(feederCycle(0).stroke).toBe(0)
    expect(feederCycle(0.22).stroke).toBe(1)
    for (let p = 0; p <= 1; p += 0.01) {
      const cycle = feederCycle(p)
      if (cycle.dose > 0) expect(cycle.stroke).toBe(0)
    }
  })
  it('routes bubbles below the anode and outside its edge before rising', () => {
    const anode = { minX: -0.825, maxX: -0.025, bottom: 0.97, edgeZ: -0.2 }
    const radius = 0.013
    for (let i = 0; i <= 200; i++) {
      const [x, y, z] = bubblePosition(i / 200, anode, 1.13, i % 3)
      expect(x).toBeGreaterThan(anode.minX)
      expect(x).toBeLessThan(anode.maxX)
      expect(y - radius).toBeGreaterThan(0.93) // measured metal-pad surface
      if (z - radius <= anode.edgeZ) expect(y + radius).toBeLessThan(anode.bottom)
      if (y >= anode.bottom) expect(z - radius).toBeGreaterThan(anode.edgeZ)
    }
  })
})
