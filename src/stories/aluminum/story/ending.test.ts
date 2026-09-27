import { describe, expect, it } from 'vitest'
import { endingState } from './ending'

describe('material journey', () => {
  it('fills before cooling and only reveals a solid ingot', () => {
    for (let p=0;p<=1;p+=.001) {
      const s=endingState(11,p)
      expect(s.fill).toBeGreaterThanOrEqual(0); expect(s.fill).toBeLessThanOrEqual(1)
      if(s.cooling>0) expect(s.fill).toBe(1)
      if(s.reveal>0) expect(s.cooling).toBe(1)
      if(s.beat!==1) expect(s.flowing).toBe(false)
    }
  })
  it('has identical forward and reverse samples with no accumulated history', () => {
    for(const chapter of [10,11]) {
      const progress=[0,.12,.32,.43,.55,.7,.82,.96,1]
      const states=progress.map(p=>endingState(chapter,p))
      progress.forEach((p,i)=>expect(endingState(chapter,p)).toEqual(states[i]))
      ;[...progress].reverse().forEach((p,i)=>expect(endingState(chapter,p)).toEqual(states[states.length-1-i]))
    }
  })
  it('reduced motion retains discrete liquid and solid stages', () => {
    expect(endingState(11,.3,true).fill).toBe(1)
    expect(endingState(11,.6,true).cooling).toBe(1)
    expect(endingState(11,.9,true).reveal).toBe(1)
  })
})
