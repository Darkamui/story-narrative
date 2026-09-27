import { describe, expect, it } from 'vitest'
import { journeyStops } from '../data/journey'
import { chapters } from '../data/content'
import { chapterStart, sampleStory, totalLength } from './states'
import { nextJourneyIndex, previousJourneyIndex } from './journey'
import { endingState } from './ending'
import { operatingBeat } from './operating'
import { anodeEffectPhase } from './anodeEffect'

describe('guided exploration', () => {
  it('advances through every stop and can reverse without getting stuck on pixel rounding', () => {
    expect(nextJourneyIndex(sampleStory(0))).toBe(0)
    journeyStops.forEach((stop, index) => {
      for (const rounding of [-.0005, 0, .0005]) {
        const p = chapterStart(stop.chapter) + chapters[stop.chapter].length / totalLength * (stop.local + rounding)
        const state = sampleStory(p)
        expect(nextJourneyIndex(state)).toBe(index + 1)
        expect(previousJourneyIndex(state)).toBe(index - 1)
      }
    })
    expect(totalLength).toBeLessThan(30)
  })
  it('visits every process, comparison and ending beat and resolves the material journey', () => {
    const states = journeyStops.map(stop => sampleStory(chapterStart(stop.chapter) + chapters[stop.chapter].length / totalLength * stop.local))
    expect(states.filter(s => s.chapterIndex === 6).map(s => operatingBeat(s).index)).toEqual([0,1,2,3,4,5])
    expect(states.filter(s => s.chapterIndex === 8).map(s => anodeEffectPhase(s.chapterProgress))).toEqual([0,1,2,3])
    expect(states.filter(s => s.chapterIndex === 10).map(s => endingState(10,s.chapterProgress).beat)).toEqual([0,1,2])
    expect(states.filter(s => s.chapterIndex === 11).map(s => endingState(11,s.chapterProgress).beat)).toEqual([0,1,2,3])
    expect(endingState(11, states.at(-1)!.chapterProgress).reveal).toBe(1)
    expect(states.find(s => s.chapterIndex === 9)!.abnormalStateMix).toBe(0)
  })
})
