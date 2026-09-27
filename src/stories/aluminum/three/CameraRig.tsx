import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Vector3 } from 'three'
import { useMemo } from 'react'
import { shots } from '../data/shots'
import { storyStore } from '../story/store'
import { anatomyStore } from '../story/anatomy'
import type { Shot } from '../data/shots'
import { processBeats } from '../data/operating'
import { operatingBeat } from '../story/operating'
import { smooth } from '../story/states'
import { endingBeats } from '../data/ending'
import { endingState } from '../story/ending'

const innerLayers: Shot = { name: 'INNER_LAYERS', position: [11, 7, 27], target: [0, -0.6, 0], fov: 39, focus: [0.5, 0.54] }

export function CameraRig() {
  const target = useMemo(() => new Vector3(), [])
  const destination = useMemo(() => new Vector3(), [])
  useFrame(({ camera, size }) => {
    const state = storyStore.get()
    const detail = anatomyStore.get() && state.chapterIndex === 3
    const beat = operatingBeat(state)
    const ending = endingState(state.chapterIndex, state.chapterProgress)
    const endingShots = endingBeats(state.chapterIndex)
    const from = state.chapterIndex >= 10 ? endingShots[Math.max(0, ending.beat - 1)].shot : detail ? innerLayers : state.chapterIndex === 6 ? (beat.index === 0 ? shots[5] : processBeats[beat.index - 1].shot) : state.chapterIndex === 7 ? processBeats.at(-1)!.shot : shots[Math.max(0, state.chapterIndex - 1)]
    const to = state.chapterIndex >= 10 ? endingShots[ending.beat].shot : detail ? innerLayers : state.chapterIndex === 6 ? processBeats[beat.index].shot : shots[state.chapterIndex]
    const t = state.reducedMotion ? 1 : state.chapterIndex >= 10 ? smooth(ending.local / .65) : state.chapterIndex === 6 ? smooth(beat.progress / 0.28) : state.chapterIndex === 4 ? Math.min(1, state.chapterProgress / 0.48) : state.transition
    camera.position.set(...from.position).lerp(destination.set(...to.position), t)
    target.set(...from.target).lerp(destination.set(...to.target), t)
    // Fit the same authored shot into a narrower viewport without cropping the cell.
    const aspect = size.width / size.height
    if (aspect < 1.5) camera.position.sub(target).multiplyScalar(Math.max(1, 1.5 / aspect)).add(target)
    camera.lookAt(target)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = from.fov + (to.fov - from.fov) * t
      const x = size.width <= 760 ? 0.5 : from.focus[0] + (to.focus[0] - from.focus[0]) * t
      const y = size.width <= 760 ? 0.5 : from.focus[1] + (to.focus[1] - from.focus[1]) * t
      camera.setViewOffset(size.width, size.height, (0.5 - x) * size.width, (0.5 - y) * size.height, size.width, size.height)
      camera.updateProjectionMatrix()
    }
    camera.updateMatrixWorld()
  }, -2)
  return null
}
