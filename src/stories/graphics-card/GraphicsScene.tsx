import { useEffect, useRef } from 'react'
import { ACESFilmicToneMapping, AmbientLight, Box3, Box3Helper, CatmullRomCurve3, Color, ConeGeometry, DirectionalLight, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera, PMREMGenerator, Scene, SphereGeometry, TubeGeometry, Vector3, WebGLRenderer, type Object3D } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { assemblyOffset, shots, zoneOpacity, type Point } from './state'

type Settings = { beat: number; explosion: number; reduced: boolean; inspect: boolean; turn: number; zoom: number; replay: number }
type Props = Settings & { labels: Record<string, string>; onReady: () => void; onFailure: () => void }
type Landmark = { assembly: string; center: Point; min: Point; max: Point }
export default function GraphicsScene({ onReady, onFailure, labels, ...settings }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const settingsRef = useRef(settings)
  const update = useRef<((next: Settings, resize?: boolean) => void) | null>(null)
  useEffect(() => { settingsRef.current = settings; update.current?.(settings) }, [settings])
  useEffect(() => {
    const element = host.current!
    let renderer: WebGLRenderer
    try { renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }) } catch { onFailure(); return }
    let disposed = false
    let frame = 0
    let model: Object3D | undefined
    let landmarks: Record<string, Landmark> = {}
    let last: Settings | undefined
    let explosion = settingsRef.current.explosion
    let extent = 0.2
    const target = new Vector3()
    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 3)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.domElement.setAttribute('aria-hidden', 'true')
    element.prepend(renderer.domElement)
    const generator = new PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const environment = generator.fromScene(room, 0.04)
    room.dispose(); generator.dispose()
    scene.environment = environment.texture
    scene.environmentIntensity = 0.7
    scene.add(new AmbientLight(0xe5ecf3, 0.5))
    const key = new DirectionalLight(0xfff5e8, 2.5)
    key.position.set(-0.3, 0.7, 0.5)
    const fill = new DirectionalLight(0xccddf2, 1.8)
    fill.position.set(0.3, -0.3, -0.3)
    scene.add(key, fill)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = false; controls.enabled = false
    const groups: Object3D[] = []
    const meshes: Mesh[] = []
    const rotors: Object3D[] = []
    const overlays = new Group()
    const outlines = new Group()
    scene.add(overlays, outlines)
    const routes: { curve: CatmullRomCurve3; packet: Mesh; beat: number }[] = []
    const helperGroups = new Map<number, Group>()
    const material = () => new MeshBasicMaterial({ color: '#a64d2b', depthTest: false, transparent: true, opacity: 0.85 })
    const route = (beat: number, points: Point[], radius: number) => {
      let group = helperGroups.get(beat)
      if (!group) { group = new Group(); helperGroups.set(beat, group); overlays.add(group) }
      const curve = new CatmullRomCurve3(points.map(point => new Vector3(...point)))
      const line = new Mesh(new TubeGeometry(curve, 48, radius, 6, false), material())
      line.renderOrder = 4; group.add(line)
      const arrow = new Mesh(new ConeGeometry(radius * 3, radius * 8, 12), material())
      arrow.position.copy(curve.getPoint(0.94)); arrow.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), curve.getTangent(0.94).normalize()); arrow.renderOrder = 5; group.add(arrow)
      const packet = new Mesh(new SphereGeometry(radius * 2.8, 12, 8), material())
      packet.renderOrder = 6; group.add(packet)
      routes.push({ curve, packet, beat })
    }
    const applyExplosion = (value: number) => {
      for (const group of groups) group.position.fromArray(assemblyOffset(group.name.slice(9), value))
      scene.updateMatrixWorld(true)
    }
    const projection = () => {
      const aspect = element.clientWidth / Math.max(1, element.clientHeight)
      camera.top = extent; camera.bottom = -extent; camera.left = -extent * aspect; camera.right = extent * aspect
      camera.updateProjectionMatrix(); camera.lookAt(target); camera.updateMatrixWorld(true)
    }
    const pins = () => {
      const { beat, inspect } = settingsRef.current
      for (const marker of shots[beat].markers) {
        const node = element.querySelector<HTMLElement>(`[data-part="${marker.part}"]`)
        const part = landmarks[marker.part]
        if (!node || !part) continue
        const point = new Vector3(...part.center).add(new Vector3(...assemblyOffset(part.assembly, explosion))).project(camera)
        const x = (point.x + 1) * element.clientWidth / 2
        const y = (1 - point.y) * element.clientHeight / 2
        node.style.visibility = inspect || x < 8 || x > element.clientWidth - 8 || y < 8 || y > element.clientHeight - 8 ? 'hidden' : 'visible'
        const text = node.querySelector<HTMLElement>('.gpu-pin-text')!
        const width = text.offsetWidth
        const endX = Math.max(width / 2 + 10, Math.min(element.clientWidth - width / 2 - 10, x + marker.offset[0]))
        const endY = Math.max(23, Math.min(element.clientHeight - 30, y + marker.offset[1]))
        const dx = endX - x; const dy = endY - y
        node.style.transform = `translate(${x}px,${y}px)`
        text.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`
        const line = node.querySelector<HTMLElement>('.gpu-pin-line')!
        line.style.width = `${Math.hypot(dx, dy)}px`
        line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`
      }
    }
    const render = () => { if (!disposed) { renderer.render(scene, camera); pins() } }
    controls.addEventListener('change', render)
    const pose = (next: Settings) => {
      const shot = shots[next.beat]
      const box = new Box3()
      for (const mesh of meshes) if (zoneOpacity(mesh.userData.zone, next.beat) > 0.2) box.union(new Box3().setFromObject(mesh))
      const center = shot.center ? new Vector3(...shot.center) : box.getCenter(new Vector3())
      const direction = new Vector3(...shot.direction).normalize().applyAxisAngle(new Vector3(0, 1, 0), next.turn * Math.PI / 180)
      const position = center.clone().add(direction)
      const measureCamera = camera.clone(); measureCamera.position.copy(position); measureCamera.lookAt(center); measureCamera.updateMatrixWorld(true)
      const aspect = element.clientWidth / Math.max(1, element.clientHeight)
      let half = (shot.span ?? 0) / 2 * Math.max(1, 1 / aspect)
      if (!shot.span) {
        for (const mesh of meshes) {
          if (zoneOpacity(mesh.userData.zone, next.beat) < 0.2) continue
          const bounds = new Box3().setFromObject(mesh)
          for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
            const point = new Vector3(x, y, z).applyMatrix4(measureCamera.matrixWorldInverse)
            half = Math.max(half, Math.abs(point.y), Math.abs(point.x) / aspect)
          }
        }
        half *= 1.22
      }
      return { center, position, extent: half / next.zoom }
    }
    update.current = (next, resized = false) => {
      if (!model || disposed) return
      controls.enabled = next.inspect
      renderer.domElement.style.touchAction = next.inspect ? 'none' : 'pan-y'
      renderer.domElement.style.pointerEvents = next.inspect ? 'auto' : 'none'
      if (!resized && last && Object.entries(next).every(([key, value]) => last![key as keyof Settings] === value)) { pins(); return }
      const changedBeat = !last || last.beat !== next.beat
      const demo = changedBeat || last?.replay !== next.replay
      cancelAnimationFrame(frame)
      const startExplosion = explosion
      const startPosition = camera.position.clone(); const startTarget = target.clone(); const startExtent = extent
      const starts = meshes.map(mesh => (mesh.material as MeshStandardMaterial).opacity)
      applyExplosion(next.explosion)
      const end = pose(next)
      applyExplosion(startExplosion)
      for (const [beat, group] of helperGroups) group.visible = beat === next.beat
      outlines.children.forEach(child => { child.visible = child.userData.beat === next.beat })
      for (const mesh of meshes) {
        const mat = mesh.material as MeshStandardMaterial
        const highlighted = shots[next.beat].highlight?.includes(mesh.userData.zone) && mesh.userData.zone !== 'processor'
        mat.emissive.copy(highlighted ? new Color('#b76d3e') : mesh.userData.originalEmission)
        mat.emissiveIntensity = highlighted ? 0.08 : 1
      }
      const instant = next.reduced || next.inspect || !last || resized
      const duration = instant ? 0 : changedBeat ? 1050 : 280
      const demonstrationDuration = demo && !next.reduced && !next.inspect && [3, 4, 7].includes(next.beat) ? 2200 : 0
      const began = performance.now()
      element.dataset.transition = 'moving'
      const animate = () => {
        const elapsed = performance.now() - began
        const t = duration ? Math.min(1, elapsed / duration) : 1
        const smooth = t * t * (3 - 2 * t)
        explosion = t === 1 ? next.explosion : startExplosion + (next.explosion - startExplosion) * smooth
        applyExplosion(explosion)
        meshes.forEach((mesh, index) => {
          const mat = mesh.material as MeshStandardMaterial
          const opacity = zoneOpacity(mesh.userData.zone, next.beat)
          mat.opacity = t === 1 ? opacity : starts[index] + (opacity - starts[index]) * smooth
          mat.transparent = mat.opacity < 0.999; mat.depthWrite = mat.opacity > 0.8; mesh.visible = mat.opacity > 0.005
        })
        if (t === 1) { camera.position.copy(end.position); target.copy(end.center); extent = end.extent }
        else { camera.position.lerpVectors(startPosition, end.position, smooth); target.lerpVectors(startTarget, end.center, smooth); extent = startExtent + (end.extent - startExtent) * smooth }
        projection(); controls.target.copy(target)
        const demonstration = demonstrationDuration ? Math.max(0, Math.min(1, (elapsed - duration) / demonstrationDuration)) : 1
        rotors.forEach(rotor => { rotor.rotation.y = next.beat === 7 && demonstration < 1 ? demonstration * Math.PI * 6 : 0 })
        routes.forEach(item => { item.packet.visible = item.beat === next.beat && demonstration < 1 && demonstration > 0; item.packet.position.copy(item.curve.getPoint(demonstration)) })
        overlays.visible = t === 1
        outlines.visible = t === 1
        render()
        if (t < 1 || demonstration < 1) frame = requestAnimationFrame(animate)
        else { controls.target.copy(target); element.dataset.transition = 'settled'; element.dataset.extent = String(extent) }
      }
      last = { ...next }
      animate()
    }
    const resize = new ResizeObserver(() => {
      renderer.setSize(element.clientWidth, element.clientHeight)
      if (model) update.current?.(settingsRef.current, true)
    })
    resize.observe(element)
    const lost = (event: Event) => { event.preventDefault(); onFailure() }
    renderer.domElement.addEventListener('webglcontextlost', lost)
    const disposeObject = (object: Object3D) => object.traverse(child => {
      const drawable = child as Mesh
      if (drawable.geometry) drawable.geometry.dispose()
      if (drawable.material) for (const mat of Array.isArray(drawable.material) ? drawable.material : [drawable.material]) mat.dispose()
    })
    const abort = new AbortController()
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    fetch(`${import.meta.env.BASE_URL}assets/graphics-card/axiom-320.glb`, { signal: abort.signal })
      .then(response => { if (!response.ok) throw new Error('Model unavailable'); return response.arrayBuffer() })
      .then(bytes => loader.parseAsync(bytes, ''))
      .then(gltf => {
        if (disposed) { disposeObject(gltf.scene); return }
        model = gltf.scene; landmarks = model.userData.landmarks
        if (!landmarks?.GPU_die) throw new Error('Missing component landmarks')
        const originals = new Set<MeshStandardMaterial>()
        model.traverse(object => {
          if (object.name.startsWith('Assembly_')) groups.push(object)
          if (object.name.startsWith('Rotor_')) rotors.push(object)
          if (object instanceof Mesh) {
            const original = object.material as MeshStandardMaterial
            originals.add(original); object.material = original.clone(); object.userData.originalEmission = original.emissive.clone()
            object.userData.zone ??= object.parent?.userData.zone
            meshes.push(object)
          }
        })
        originals.forEach(mat => mat.dispose())
        for (const [name, part] of Object.entries(landmarks)) {
          if (name !== 'GPU_die' && !/^Memory_\d\d$/.test(name)) continue
          const box = new Box3(new Vector3(...part.min), new Vector3(...part.max)).expandByScalar(0.00035)
          const outline = new Box3Helper(box, 0xb4673c)
          outline.userData.beat = name === 'GPU_die' ? 2 : 3
          outlines.add(outline)
        }
        route(3, [[-0.014, 0.005, 0.028], [-0.014, 0.009, 0.014], [-0.026, 0.009, 0], [-0.04, 0.004, 0]], 0.0003)
        route(4, [[0.069, 0.019, -0.047], [0.053, 0.018, -0.031], [0.04, 0.014, 0], [-0.04, 0.005, 0]], 0.00055)
        for (const x of [-0.103, 0, 0.103]) route(7, [[x, 0.105, 0.022], [x, 0.072, 0.025], [x, 0.014, 0.038], [x, 0.004, 0.068]], 0.0008)
        scene.add(model)
        update.current?.(settingsRef.current)
        onReady()
      }).catch(() => { if (!disposed) onFailure() })
    return () => {
      disposed = true; abort.abort(); update.current = null; cancelAnimationFrame(frame)
      resize.disconnect(); controls.dispose(); renderer.domElement.removeEventListener('webglcontextlost', lost)
      disposeObject(scene); environment.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    }
  }, [onReady, onFailure])
  return <div className="gpu-canvas" ref={host}>
    <div className="gpu-pins" aria-hidden="true">{shots[settings.beat].markers.map(marker => <div className="gpu-pin" data-part={marker.part} key={marker.part}><i /><span className="gpu-pin-line" /><span className="gpu-pin-text">{labels[marker.label]}</span></div>)}</div>
  </div>
}
