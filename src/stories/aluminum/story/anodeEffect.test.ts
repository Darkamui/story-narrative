import { describe, expect, it } from 'vitest'
import { anodeEffectMix, anodeEffectPhase, interfaceVisual } from './anodeEffect'
import { chapterStart, sampleStory, totalLength } from './states'
import { chapters } from '../data/content'

describe('anode-effect comparison', () => {
  const sample = (p: number, reduced = false) => sampleStory(chapterStart(8) + chapters[8].length / totalLength * p, reduced)
  it('holds a baseline and an abnormal state, then returns before the metal chapter', () => {
    expect(sample(0.08).abnormalStateMix).toBe(0)
    expect(sample(0.57).abnormalStateMix).toBe(1)
    expect(sample(0.96).abnormalStateMix).toBe(0)
    expect(sampleStory(chapterStart(9) + 0.001).abnormalStateMix).toBe(0)
    expect(anodeEffectPhase(0.96)).toBe(3)
  })
  it('is continuous, reversible and independent of current and metal quantity', () => {
    const points = Array.from({ length: 1001 }, (_, i) => i / 1000)
    const values = points.map(p => sample(p).abnormalStateMix)
    points.reverse().forEach(p => {
      expect(sample(p).abnormalStateMix).toBeCloseTo(anodeEffectMix(p), 10)
      expect(sample(p).currentIntensity).toBe(0)
      expect(sample(p).aluminumVisibility).toBe(1)
    })
    values.slice(1).forEach((value, i) => expect(Math.abs(value - values[i])).toBeLessThan(0.008))
  })
  it('retains baseline, abnormal and return states without motion', () => {
    expect([0.08, 0.3, 0.57, 0.96].map(p => sample(p, true).abnormalStateMix)).toEqual([0, 1, 1, 0])
  })
  it('changes gas geometry and voltage indication independently of color', () => {
    const normal = interfaceVisual(0), effect = interfaceVisual(1)
    expect(effect.patchRadius).toBeGreaterThan(normal.patchRadius)
    expect(effect.filmOpacity).toBe(1)
    expect(normal.filmOpacity).toBe(0)
    expect(effect.voltageY).toBeLessThan(normal.voltageY)
    expect(effect.dissolvedOpacity).toBeLessThan(normal.dissolvedOpacity)
    expect(interfaceVisual(Number.NaN)).toEqual(normal)
  })
})
