import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { storyStore } from '../story/store'

export function GrainAndMetal() {
  const grain = useRef<Mesh>(null)
  useFrame(() => {
    const s = storyStore.get()
    if (grain.current) {
      grain.current.visible = s.grainVisibility > 0.02
      grain.current.scale.setScalar(s.grainVisibility * 0.8)
      grain.current.position.set(0, 1.8 - s.grainFall * 1.6, 0)
      grain.current.rotation.set(0.3 + s.grainFall, 0.5 + s.grainFall * 0.5, 0.2)
    }
  })
  return <>
    <mesh ref={grain}><icosahedronGeometry args={[0.6, 1]} /><meshStandardMaterial color="#f0e9d8" roughness={0.82} flatShading /></mesh>
  </>
}
