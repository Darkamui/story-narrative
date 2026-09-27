import { Box3, Color, DoubleSide, Mesh, MeshStandardMaterial, Object3D, Plane, Vector3 } from 'three'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { assemblies, classifyNode, type AssemblyId } from '../data/assemblies'
import { layerOffsets, rigInterval, rigOverrides } from '../data/rig'
import { createSectionSurfaces, updateSectionSurfaces } from './sectionGeometry'
import { smooth, type StoryState } from '../story/states'
import type { Selection } from '../story/selection'
import { detailFamilies } from '../data/anatomy'
import { currentStep, operatingBeat } from '../story/operating'
import { currentSteps } from '../data/operating'
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh'
import { disposeScenes } from './assets'

export type RigBinding = { object: Object3D; base: Vector3; end: Vector3; interval: [number, number] }
export type MaterialBinding = { material: MeshStandardMaterial; family: AssemblyId; role: string; baseColor: Color; baseEmissive: Color; opacity: number }
export type ModelAdapter = ReturnType<typeof createModelAdapter>
export function createModelAdapter(gltf: GLTF, caps?: GLTF) {
  const scene = gltf.scene.clone(true)
  scene.name = 'CELL_ROOT'
  scene.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(scene)
  const inventory: Record<string, string[]> = {}
  const meshes: Mesh[] = []
  const materials: MaterialBinding[] = []
  const cache = new Map<string, MeshStandardMaterial>()
  const plane = new Plane(new Vector3(0, 0, -1), 20)
  const rigs: RigBinding[] = []
  let triangles = 0
  scene.traverse(object => {
    if (!(object instanceof Mesh)) return
    const family = classifyNode(object.name)
    if (!family) throw new Error(`Unmapped cell mesh: ${object.name}`)
    object.userData.family = family
    object.geometry.computeBoundingBox()
    inventory[family] ??= []
    inventory[family].push(object.name)
    meshes.push(object)
    triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3
    const originals = Array.isArray(object.material) ? object.material : [object.material]
    const mapped = originals.map(original => {
      const role = /^06_BUSBARS_(riser|arm)_/.test(object.name) ? 'supply' : family === 'busbars' ? 'return' : family
      const key = `${family}:${role}:${original.uuid}`
      let material = cache.get(key)
      if (!material) {
        material = (original as MeshStandardMaterial).clone()
        material.side = DoubleSide
        material.forceSinglePass = true
        material.transparent = false
        material.clippingPlanes = [plane]
        // Authored process colors are kept, but emission is restrained for legibility.
        material.emissiveIntensity = Math.min(material.emissiveIntensity, 0.3)
        cache.set(key, material)
        materials.push({ material, family, role, baseColor: material.color.clone(), baseEmissive: material.emissive.clone(), opacity: material.opacity })
      }
      return material
    })
    object.material = Array.isArray(object.material) ? mapped : mapped[0]
  })
  for (const entry of assemblies) {
    if (!inventory[entry.id]?.length) throw new Error(`Required assembly missing: ${entry.name}`)
    if (!scene.getObjectByName(entry.anchor)) throw new Error(`Required anchor missing: ${entry.anchor}`)
    inventory[entry.id].sort()
  }
  for (const track of gltf.animations[0]?.tracks ?? []) {
    if (!track.name.endsWith('.position') || track.getValueSize() !== 3) throw new Error(`Unsupported rig track: ${track.name}`)
    const name = track.name.slice(0, -9)
    const object = scene.getObjectByName(name)
    if (!object) throw new Error(`Missing rig node: ${name}`)
    const base = new Vector3().fromArray(track.values, 0)
    const end = new Vector3().fromArray(track.values, track.values.length - 3)
    if (rigOverrides[name]) end.fromArray(rigOverrides[name])
    rigs.push({ object, base, end, interval: rigInterval(name) })
  }
  if (rigs.length !== 15) throw new Error(`Expected 15 rig controls, received ${rigs.length}`)
  const anchors = new Map(assemblies.map(entry => [entry.id, scene.getObjectByName(entry.anchor)!]))
  const layers = Object.entries(layerOffsets).map(([name, data]) => {
    const object = scene.getObjectByName(name)
    if (!object) throw new Error(`Missing anatomy layer: ${name}`)
    return { object, base: object.position.clone(), offset: new Vector3(...data.offset), interval: data.interval }
  })
  const surfaces = caps ? createSectionSurfaces(meshes, caps) : []
  // Exact triangle queries with a per-geometry spatial index. Linked instances
  // share the index; semantic object names and section clipping are unchanged.
  for (const mesh of [...meshes, ...surfaces.map(surface => surface.object)]) {
    mesh.geometry.boundsTree ??= new MeshBVH(mesh.geometry)
    mesh.raycast = acceleratedRaycast
  }
  return { scene, sourceScenes: [gltf.scene, ...(caps ? [caps.scene] : [])], bounds, inventory, meshes, materials, rigs, plane, triangles, anchors, layers, surfaces }
}

export function applyModelState(model: ModelAdapter, state: StoryState, selection: Selection, detail = false) {
  const beat = state.chapterIndex === 6 ? operatingBeat(state).index : -1
  const step = currentStep(state.chapterProgress)
  for (const rig of model.rigs) {
    const t = smooth((state.explodedAmount - rig.interval[0]) / (rig.interval[1] - rig.interval[0]))
    rig.object.position.lerpVectors(rig.base, rig.end, t)
  }
  for (const layer of model.layers) {
    const t = smooth((state.explodedAmount - layer.interval[0]) / (layer.interval[1] - layer.interval[0]))
    layer.object.position.copy(layer.base).addScaledVector(layer.offset, t)
  }
  model.scene.visible = state.cellVisibility > 0.002
  model.plane.constant = state.sectionAmount > 0 ? 0 : 20
  for (const binding of model.materials) {
    const { material, family } = binding
    let opacity = state.cellVisibility
    if (detail && state.chapterIndex === 3 && !detailFamilies.includes(family)) opacity = 0
    if (['hood', 'frame', 'gas', 'feeders', 'hardware', 'crust'].includes(family)) opacity *= 1 - state.sectionAmount
    if (state.chapterIndex === 5 && family === 'frame') opacity = state.cellVisibility
    if (beat === 0 && family === 'feeders') opacity = state.cellVisibility
    if (beat === 1 && family === 'bath') opacity *= 0.38
    if (beat === 2 || beat === 3) opacity = 0
    if (state.chapterIndex === 8) opacity = 0
    if (beat === 4) {
      if (family === 'hood') opacity = 0.14
      if (family === 'gas') opacity = 1
      if (family === 'bath') opacity *= 0.6
    }
    if (state.chapterIndex === 7) {
      if (family === 'feeders' || family === 'gas') opacity = 1
      if (family === 'hood') opacity = 0.1
    }
    if (family !== 'metal') opacity *= 1 - state.metalFocus * 0.96
    if (family === 'metal') opacity *= state.aluminumVisibility
    if (family === 'bath') opacity *= state.bathVisibility
    material.opacity = opacity
    const transparent = opacity < 0.995
    if (material.transparent !== transparent) { material.transparent = transparent; material.needsUpdate = true }
    material.depthWrite = opacity > 0.94
    material.color.copy(binding.baseColor)
    material.emissive.copy(binding.baseEmissive)
    if (state.chapterIndex === 5) {
      const lit = (currentSteps[step].families as readonly string[]).includes(family) || (step === 4 && binding.role === 'return')
      const wrongBus = family === 'busbars' && ((step === 0 && binding.role !== 'supply') || (step !== 0 && binding.role !== 'return'))
      if (lit && !wrongBus) material.emissive.set('#b16a22').multiplyScalar(state.currentIntensity)
      else material.color.multiplyScalar(0.5)
    }
    if (beat === 5 && (family === 'lining' || family === 'crust')) material.emissive.set('#574022').multiplyScalar(state.heatIntensity)
    if (selection) {
      if (family === selection.family) material.emissive.set('#3a2811')
      else material.color.multiplyScalar(0.38)
    }
  }
  updateSectionSurfaces(model.surfaces, state.sectionAmount)
  for (const mesh of model.meshes) {
    const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial
    mesh.visible = mat.opacity > 0.015
    if (state.chapterIndex === 5 && mesh.userData.family === 'frame' && !mesh.name.startsWith('07_SUPERSTRUCTURE_beam_')) mesh.visible = false
    if (beat === 0 && mesh.userData.family === 'feeders' && !mesh.name.endsWith('_002')) mesh.visible = false
  }
  model.scene.updateMatrixWorld(true)
}

export function disposeModel(model: ModelAdapter) {
  disposeScenes([model.scene, ...model.sourceScenes])
}
