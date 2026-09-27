import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { disposeScenes, loadAssets } from './assets'
import { ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Shape, Vector3 } from 'three'
import { storyStore } from '../story/store'
import { endingState, endingStore } from '../story/ending'
import { endingParts } from '../data/ending'
import { smooth } from '../story/states'

export function EndingScene() {
  const needed = useSyncExternalStore(storyStore.subscribe, () => storyStore.get().chapterIndex >= 9)
  const settings = useSyncExternalStore(endingStore.subscribe, endingStore.get)
  const [scene, setScene] = useState<Group | null>(null)
  const invalidate = useThree(s => s.invalidate)
  const vesselMetal = useRef<Mesh>(null), mouldMetal = useRef<Mesh>(null), flow = useRef<Group>(null), air = useRef<Group>(null)
  const point = useMemo(() => new Vector3(), [])
  const metalSection = useMemo(() => {
    const shape = new Shape(); shape.moveTo(-.68,0); shape.absarc(0,0,.68,Math.PI,0,true); shape.closePath()
    return new ExtrudeGeometry(shape,{ depth: 1, bevelEnabled: false, curveSegments: 16 }).rotateX(-Math.PI/2).translate(0,-.5,0)
  }, [])
  useEffect(() => () => metalSection.dispose(), [metalSection])
  useEffect(() => {
    if (!needed) return
    const abort = new AbortController()
    let loaded: Group | null = null
    let source: Group | null = null
    endingStore.set({ state: 'loading' })
    const timeout = setTimeout(() => abort.abort(), 12000)
    loadAssets(['ending.glb'], abort.signal)
      .then(([gltf]) => {
        if (abort.signal.aborted) { disposeScenes([gltf.scene]); return }
        source = gltf.scene
        loaded = source.clone(true)
        for (const name of ['TAP_STUDY', 'CAST_STUDY', 'CAST_solid_ingot']) if (!loaded.getObjectByName(name)) throw Error(`Missing ${name}`)
        loaded.traverse(o => { if (o instanceof Mesh) { o.material = (o.material as MeshStandardMaterial).clone(); o.userData.base = (o.material as MeshStandardMaterial).color.clone() } })
        setScene(loaded); endingStore.set({ state: 'ready' }); invalidate()
      }).catch(() => { if (!disposed) endingStore.set({ state: 'failed' }) })
      .finally(() => clearTimeout(timeout))
    let disposed = false
    return () => { disposed = true; abort.abort(); clearTimeout(timeout); disposeScenes([...(loaded ? [loaded] : []), ...(source ? [source] : [])]); setScene(null) }
  }, [needed, settings.attempt, invalidate])
  useEffect(() => endingStore.subscribe(invalidate), [invalidate])
  useFrame(({ camera, size }) => {
    const s = storyStore.get(), e = endingState(s.chapterIndex, s.chapterProgress, s.reducedMotion)
    if (!scene || s.chapterIndex < 10) {
      if (scene) scene.visible = false
      for (const ref of [vesselMetal, mouldMetal, flow, air]) if (ref.current) ref.current.visible = false
      return
    }
    scene.visible = s.chapterIndex >= 10
    const tap = scene.getObjectByName('TAP_STUDY')!, cast = scene.getObjectByName('CAST_STUDY')!, ingot = scene.getObjectByName('CAST_solid_ingot')!
    tap.visible = s.chapterIndex === 10; cast.visible = s.chapterIndex === 11
    ingot.visible = s.chapterIndex === 11 && e.cooling >= 1
    ingot.position.y = e.reveal * 1.6
    const parts = endingParts(s.chapterIndex)
    scene.traverse(o => {
      if (!(o instanceof Mesh)) return
      const mat = o.material as MeshStandardMaterial
      const part = parts.find(p => p.prefixes.some(prefix => o.name.startsWith(prefix)))
      mat.emissive.set(part?.id === settings.selected ? '#716344' : '#000000')
      mat.transparent = e.reveal > 0; mat.opacity = o === ingot ? 1 : 1 - smooth(e.reveal / .5)
      mat.depthWrite = mat.opacity > .95
      if (o !== ingot) o.visible = mat.opacity > .015
    })
    if (vesselMetal.current) {
      vesselMetal.current.visible = s.chapterIndex === 10 && e.fill > .001
      const h = e.fill * 1.05
      vesselMetal.current.scale.y = Math.max(.001, h); vesselMetal.current.position.y = .18 + h / 2
    }
    if (mouldMetal.current) {
      mouldMetal.current.visible = s.chapterIndex === 11 && e.fill > .001 && e.cooling < 1
      const h = e.fill * .23
      mouldMetal.current.scale.y = Math.max(.001, h); mouldMetal.current.position.y = .455 + h / 2
      ;(mouldMetal.current.material as MeshStandardMaterial).roughness = .13 + e.cooling * .35
    }
    if (flow.current) {
      flow.current.visible = s.chapterIndex >= 10 && e.flowing
      flow.current.children.forEach((o, i) => {
        const t = ((e.local * 2 + i / 12) % 1)
        if (s.chapterIndex === 10) {
          const distance = t * 6.54
          if (distance < 1.92) o.position.set(-1.45,.43 + distance,-.08)
          else if (distance < 5.42) o.position.set(-1.45 + distance - 1.92,2.35,-.08)
          else o.position.set(2.05,2.35 - (distance - 5.42),-.08)
        } else o.position.set(-1.75 + t * 2.48, t < .92 ? .9 : .9 - (t - .92) * 3, 0)
      })
    }
    if (air.current) {
      air.current.visible = s.chapterIndex === 11 && e.beat === 2
      air.current.children.forEach((o, i) => o.position.set(.65 + (i % 3) * .8,.53,-.6 + ((e.local * 2 + Math.floor(i / 3) / 3) % 1) * .55))
    }
    const occupied: [number,number][] = []
    parts.forEach((p, i) => {
      const label = document.getElementById(`ending-anchor-${p.id}`)
      if (!label) return
      point.set(...p.anchor)
      if (p.id === 'ingot') point.y += e.reveal * 1.6
      point.project(camera)
      const x = (point.x + 1) * size.width / 2, y = (1 - point.y) * size.height / 2
      let labelX = x, labelY = y
      for (let pass=0;pass<12 && occupied.some(([a,b]) => Math.hypot(a-labelX,b-labelY)<32);pass++) {
        labelY += 32
        if (labelY > size.height-18) { labelY = y; labelX += 32 }
      }
      occupied.push([labelX,labelY])
      label.style.left = `${labelX}px`; label.style.top = `${labelY}px`
      const visible = point.z < 1 && Math.abs(point.x) < .95 && Math.abs(point.y) < .95 && (e.reveal < .8 || p.id === 'ingot')
      label.style.visibility = visible ? 'visible' : 'hidden'
      const line = document.getElementById(`ending-line-${p.id}`)
      if (line) {
        for (const [key,value] of Object.entries({x1:x,y1:y,x2:labelX,y2:labelY})) line.setAttribute(key,String(value))
        line.style.visibility = visible ? 'visible' : 'hidden'
      }
      label.dataset.number = String(i + 1)
    })
    if (import.meta.env.DEV) window.__CELL_ENDING__ = { chapter: s.chapterIndex, beat: e.beat, fill: e.fill, cooling: e.cooling, reveal: e.reveal, ingotY: ingot.position.y }
  }, -.5)
  const pick = (event: ThreeEvent<MouseEvent>) => {
    const part = endingParts(storyStore.get().chapterIndex).find(p => p.prefixes.some(prefix => event.object.name.startsWith(prefix)))
    if (part) { event.stopPropagation(); endingStore.set({ selected: part.id }) }
  }
  return <>
    {scene && <primitive object={scene} onClick={pick} dispose={null} />}
    <mesh ref={vesselMetal} visible={false} position={[2.05, .18, 0]} geometry={metalSection}><meshStandardMaterial color="#cbd9d5" metalness={.8} roughness={.16} /></mesh>
    <mesh ref={mouldMetal} visible={false} position={[1.45,.455,0]}><boxGeometry args={[1.55,1,.92]} /><meshStandardMaterial color="#cbd9d5" metalness={.8} roughness={.16} /></mesh>
    <group ref={flow} visible={false}>{Array.from({ length: 12 }, (_, i) => <mesh key={i} renderOrder={20}><sphereGeometry args={[.055,6,4]} /><meshBasicMaterial color="#dbb66e" depthTest={false} /></mesh>)}</group>
    <group ref={air} visible={false}>{Array.from({ length: 9 }, (_, i) => <mesh key={i}><boxGeometry args={[.02,.02,.13]} /><meshBasicMaterial color="#a6c8cf" /></mesh>)}</group>
  </>
}
declare global { interface Window { __CELL_ENDING__?: { chapter: number; beat: number; fill: number; cooling: number; reveal: number; ingotY: number } } }
