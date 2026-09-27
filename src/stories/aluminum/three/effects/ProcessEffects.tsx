import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshStandardMaterial } from 'three'
import { storyStore } from '../../story/store'
import { bubblePosition, feederCycle, operatingBeat } from '../../story/operating'
import type { ModelAdapter } from '../modelAdapter'
import { operatingAnchors } from './operatingAnchors'

export function ProcessEffects({ model }: { model: ModelAdapter }) {
  const anchors = useMemo(() => operatingAnchors(model), [model])
  const powder = useRef<Group>(null)
  const dissolved = useRef<Group>(null)
  const bubbles = useRef<Group>(null)
  const interfaceMark = useRef<Mesh>(null)
  useFrame(() => {
    const s = storyStore.get()
    const beat = operatingBeat(s)
    const mode = s.chapterIndex === 6 ? beat.index : -1
    const p = s.reducedMotion ? 0.85 : beat.progress
    const cycle = feederCycle(p)
    anchors.chisel.position.copy(anchors.chiselBase)
    if (mode === 0) anchors.chisel.position.y -= anchors.chiselTravel * cycle.stroke * s.feedIntensity
    anchors.chisel.updateMatrixWorld()
    if (powder.current) {
      powder.current.visible = mode === 0 && s.feedIntensity > 0 && cycle.dose > 0
      powder.current.children.forEach((child, i) => {
        const u = (cycle.dose * 1.2 + i / 12) % 1
        child.position.set((i % 3 - 1) * 0.025, anchors.chute.min.y - u * (anchors.chute.min.y - (anchors.bath.min.y + anchors.bath.max.y) / 2), -0.045 - (i % 2) * 0.025)
        child.scale.setScalar((1 - u * 0.85) * s.feedIntensity)
      })
    }
    if (dissolved.current) {
      dissolved.current.visible = mode === 1 && s.dissolutionIntensity > 0
      dissolved.current.children.forEach((child, i) => {
        child.position.set((i % 5 - 2) * (0.07 + beat.reveal * 0.2), anchors.bath.max.y - 0.06, -0.06 - Math.floor(i / 5) * 0.05)
        child.scale.setScalar((0.5 + beat.reveal * 0.5) * s.dissolutionIntensity)
      })
    }
    if (bubbles.current) {
      bubbles.current.visible = (mode === 4 || s.chapterIndex === 7) && s.bubbleIntensity > 0
      bubbles.current.children.forEach((child, i) => {
        child.position.set(...bubblePosition((p * 1.5 + i / 9) % 1, anchors.bubble, anchors.bath.max.y, i % 3))
        child.scale.setScalar(s.bubbleIntensity * 2)
      })
    }
    if (interfaceMark.current) {
      interfaceMark.current.visible = s.chapterIndex === 9 && s.aluminumVisibility > 0
      interfaceMark.current.position.set(0, anchors.metal.max.y + 0.002, 0)
      interfaceMark.current.scale.set(anchors.metal.max.x - anchors.metal.min.x, 0.003, anchors.metal.max.z - anchors.metal.min.z)
      const material = interfaceMark.current.material as MeshStandardMaterial
      material.opacity = (0.18 + s.chapterProgress * 0.22) * s.aluminumVisibility
    }
    if (import.meta.env.DEV) window.__CELL_PROCESS__ = { mode, progress: beat.progress, chisel: anchors.chisel.position.toArray(), powder: powder.current?.visible ?? false, dissolved: dissolved.current?.visible ?? false, bubbles: bubbles.current?.visible ?? false }
  }, -0.5)
  return <group>
    <group ref={powder}>{Array.from({ length: 12 }, (_, i) => <mesh key={i}><icosahedronGeometry args={[0.027, 0]} /><meshStandardMaterial color="#f4eee0" roughness={0.9} /></mesh>)}</group>
    <group ref={dissolved}>{Array.from({ length: 15 }, (_, i) => <mesh key={i}><sphereGeometry args={[0.035, 8, 6]} /><meshStandardMaterial color="#f5dbb1" transparent opacity={0.65} /></mesh>)}</group>
    <group ref={bubbles}>{Array.from({ length: 9 }, (_, i) => <mesh key={i}><sphereGeometry args={[0.013, 8, 6]} /><meshStandardMaterial color="#d4e1d9" transparent opacity={0.8} clippingPlanes={[model.plane]} /></mesh>)}</group>
    <mesh ref={interfaceMark}><boxGeometry /><meshStandardMaterial color="#e9f1e9" transparent opacity={0.3} depthWrite={false} clippingPlanes={[model.plane]} /></mesh>
  </group>
}
declare global { interface Window { __CELL_PROCESS__?: { mode: number; progress: number; chisel: number[]; powder: boolean; dissolved: boolean; bubbles: boolean } } }
