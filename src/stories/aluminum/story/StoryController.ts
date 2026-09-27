import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { storyStore } from './store'
import { chapters } from '../data/content'
import { chapterStart, totalLength } from './states'

gsap.registerPlugin(ScrollTrigger)

let travel: gsap.core.Tween | undefined
let travelling = false
const travelListeners = new Set<() => void>()
function setTravelling(value: boolean) { travelling = value; travelListeners.forEach(listener => listener()) }
export const travelStore = {
  get: () => travelling,
  subscribe: (listener: () => void) => { travelListeners.add(listener); return () => { travelListeners.delete(listener) } },
}
export function stopTravel() { travel?.kill(); travel = undefined; if (travelling) setTravelling(false) }

function saveProgress() {
  const progress = storyStore.get().globalProgress
  if (window.history.state?.insideCellProgress !== progress) {
    window.history.replaceState({ ...window.history.state, insideCellProgress: progress }, '')
  }
}

// Every input moves the same native playhead. No second animation state to drift.
export function seekStory(index: number, local = .02, animate = false) {
  stopTravel()
  const section = document.getElementById(chapters[index]?.id)
  if (!section) return
  const target = section.getBoundingClientRect().top + window.scrollY + section.offsetHeight * Math.max(0, Math.min(.999, local))
  const write = (top: number) => { window.scrollTo({ top, behavior: 'instant' }); ScrollTrigger.update() }
  if (!animate || storyStore.get().reducedMotion) { write(target); saveProgress(); return }
  const position = { y: window.scrollY }
  setTravelling(true)
  travel = gsap.to(position, {
    y: target, duration: 1.35, ease: 'power2.inOut',
    onUpdate: () => write(position.y),
    onComplete: () => { write(target); saveProgress(); travel = undefined; setTravelling(false) },
  })
}

export function useStoryController(reducedMotion: boolean, reading = false) {
  const retained = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (reading) return
    const hashIndex = chapters.findIndex(chapter => `#${chapter.id}` === window.location.hash)
    const hashProgress = hashIndex < 0 ? undefined : chapterStart(hashIndex) + chapters[hashIndex].length * .02 / totalLength
    const saved = window.history.state?.insideCellProgress
    const initial = retained.current ?? (typeof saved === 'number' && Number.isFinite(saved) ? Math.max(0, Math.min(1, saved)) : undefined) ?? hashProgress
    const priorRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    let initialized = false
    let saveTimer: number | undefined
    let lastSave = 0
    const persist = () => {
      if (!initialized) return
      retained.current = storyStore.get().globalProgress
      saveProgress()
      lastSave = performance.now()
    }
    const trigger = ScrollTrigger.create({
      trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: true,
      invalidateOnRefresh: true,
      // Read full-precision trigger progress. A tweened number is rounded by
      // GSAP and can put an exact native fragment boundary in the prior chapter.
      onUpdate: self => {
        storyStore.set(self.progress, reducedMotion)
        if (!initialized) return
        // Persist during use: a lazy route can initially be too short for
        // native browser scroll restoration after a refresh.
        if (performance.now() - lastSave > 1000) persist()
        clearTimeout(saveTimer)
        saveTimer = window.setTimeout(persist, 150)
      },
      onRefresh: self => storyStore.set(self.progress, reducedMotion),
    })
    const restore = () => {
      ScrollTrigger.refresh()
      const progress = retained.current ?? initial
      if (!initialized && progress !== undefined) window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * progress, behavior: 'instant' })
      ScrollTrigger.update()
      storyStore.set(trigger.progress, reducedMotion)
      initialized = true
    }
    const frame = requestAnimationFrame(restore)
    const pageShown = () => { initialized = false; restore() }
    window.addEventListener('pageshow', pageShown)
    window.addEventListener('pagehide', persist)
    const onKey = (event: KeyboardEvent) => {
      // Firefox can consume paging keys on fixed footer buttons. Keep paging
      // available there while preserving native keys in inputs and text panels.
      if (['PageUp', 'PageDown'].includes(event.key) && event.target instanceof Element && event.target.closest('.story-footer') && !event.target.closest('input, select, textarea')) {
        event.preventDefault()
        stopTravel()
        window.scrollBy({ top: window.innerHeight * .85 * (event.key === 'PageDown' ? 1 : -1), behavior: 'instant' })
        ScrollTrigger.update()
        return
      }
      if (event.key !== 'Escape' && event.target instanceof Element && event.target.closest('input, select, textarea, button, a, summary')) return
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape', ' '].includes(event.key)) stopTravel()
    }
    const onPointer = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.journey-controls')) stopTravel()
    }
    window.addEventListener('wheel', stopTravel, { passive: true })
    window.addEventListener('touchmove', stopTravel, { passive: true })
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', stopTravel)
    return () => {
      stopTravel()
      persist()
      clearTimeout(saveTimer)
      cancelAnimationFrame(frame)
      window.removeEventListener('pageshow', pageShown)
      window.removeEventListener('pagehide', persist)
      window.removeEventListener('wheel', stopTravel)
      window.removeEventListener('touchmove', stopTravel)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', stopTravel)
      window.history.scrollRestoration = priorRestoration
      trigger.kill()
    }
  }, [reducedMotion, reading])
}
