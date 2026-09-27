import { beforeAll, describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { applyModelState, createModelAdapter, type ModelAdapter } from './modelAdapter'
import { chapterStart, sampleStory, totalLength } from '../story/states'
import { assemblies, partLabel } from '../data/assemblies'
import { chapters } from '../data/content'
import { claims } from '../data/claims'
import { sources } from '../data/sources'
import { Raycaster, Vector3 } from 'three'
import { operatingAnchors } from './effects/operatingAnchors'

let model: ModelAdapter
beforeAll(async () => {
  const buffer = await readFile(new URL('../../../../public/assets/cell.glb', import.meta.url))
  const gltf = await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), '')
  const capBuffer = await readFile(new URL('../../../../public/assets/section-caps.glb', import.meta.url))
  const caps = await new GLTFLoader().parseAsync(capBuffer.buffer.slice(capBuffer.byteOffset, capBuffer.byteOffset + capBuffer.byteLength), '')
  model = createModelAdapter(gltf, caps)
})
describe('real GLB contract', () => {
  it('maps every exported mesh and verifies the measured asset', () => {
    expect(model.meshes).toHaveLength(723)
    expect(model.triangles).toBe(140556)
    expect(model.rigs).toHaveLength(15)
    expect(Object.values(model.inventory).flat()).toHaveLength(723)
    assemblies.forEach(entry => expect(model.anchors.get(entry.id)?.name).toBe(entry.anchor))
    expect(model.inventory.anodes.filter(name => name.startsWith('05_ANODES_block_'))).toHaveLength(36)
    expect(model.bounds.max.x - model.bounds.min.x).toBeCloseTo(17.18, 3)
  })
  it('reaches the baked rig endpoints and restores every world transform after reversal', () => {
    const assembled = sampleStory(chapterStart(2) + 0.001)
    applyModelState(model, assembled, null)
    const initial = model.meshes.map(mesh => mesh.matrixWorld.toArray())
    applyModelState(model, sampleStory(chapterStart(3) + chapters[3].length / totalLength * 0.9), null)
    model.rigs.forEach(rig => expect(rig.object.position.distanceTo(rig.end)).toBe(0))
    for (const p of [0.5, 0.75, 0.45, 0.99, 0.1]) applyModelState(model, sampleStory(p), null)
    applyModelState(model, assembled, null)
    expect(model.meshes.map(mesh => mesh.matrixWorld.toArray())).toEqual(initial)
  })
  it('names individual parts and resolves all claim references', () => {
    expect(partLabel('05_ANODES_block_008')).toBe('Block 9')
    expect(partLabel('07_SUPERSTRUCTURE_chisel_002')).toBe('Crust-breaker chisel 3')
    claims.forEach(claim => {
      expect(sources[claim.source]).toBeDefined()
      expect(claim.locator).toBeTruthy()
      claim.chapters.forEach(id => expect(chapters.some(chapter => chapter.id === id)).toBe(true))
    })
  })
  it('keeps the separated layers and assembly endpoints clear', () => {
    applyModelState(model, { ...sampleStory(0), cellVisibility: 1, explodedAmount: 1 }, null)
    const group = (mesh: typeof model.meshes[number]) => model.layers.some(layer => layer.object === mesh) ? mesh.name : mesh.parent!.name
    const bounds = model.meshes.map(mesh => ({ mesh, box: mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld), group: group(mesh) }))
    const overlaps: string[] = []
    for (let i = 0; i < bounds.length; i++) for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i], b = bounds[j]
      if (a.group === b.group) continue
      // A flex clamp's grip on its conductor is the intentional assembled joint.
      if ((a.group.includes('hardware_flexes') && b.group.includes('busbars')) || (b.group.includes('hardware_flexes') && a.group.includes('busbars'))) continue
      const overlap = a.box.clone().intersect(b.box).getSize(new Vector3())
      if (Math.min(overlap.x, overlap.y, overlap.z) > 0.001) overlaps.push(`${a.mesh.name} / ${b.mesh.name}`)
    }
    expect(overlaps).toEqual([])
  })
  it('caps the section on the correct plane, including bath and metal independently', () => {
    applyModelState(model, { ...sampleStory(0), cellVisibility: 1, sectionAmount: 1 }, null)
    const caps = model.surfaces.filter(surface => surface.kind === 'cap')
    expect(caps).toHaveLength(35)
    for (const { object, source } of caps) {
      const sourceBounds = source.geometry.boundingBox!.clone().applyMatrix4(source.matrixWorld).expandByScalar(0.00002)
      const vertices = object.geometry.attributes.position
      for (let i = 0; i < vertices.count; i++) {
        const vertex = new Vector3().fromBufferAttribute(vertices, i).applyMatrix4(object.matrixWorld)
        expect(Math.abs(vertex.z)).toBeLessThan(0.00001)
        expect(sourceBounds.containsPoint(vertex)).toBe(true)
      }
    }
    for (const [name, y] of [['04_PROCESS_metal_000', 0.83], ['04_PROCESS_bath_000', 1.03]] as const) {
      const cap = caps.find(surface => surface.source.name === name)!
      expect(cap.object.visible).toBe(true)
      const ray = new Raycaster(new Vector3(0, y, 1), new Vector3(0, 0, -1))
      expect(ray.intersectObject(cap.object)).not.toHaveLength(0)
    }
    expect(model.surfaces.filter(surface => surface.kind === 'front').every(surface => !surface.object.visible)).toBe(true)
    applyModelState(model, { ...sampleStory(0), cellVisibility: 1 }, null)
    expect(model.surfaces.every(surface => !surface.object.visible)).toBe(true)
  })
  it('finishes reassembly before exposing the section and reverses that sequence', () => {
    for (const local of [0.15, 0.4, 0.5, 0.6, 0.8]) {
      const state = sampleStory(chapterStart(4) + chapters[4].length / totalLength * local)
      if (state.sectionAmount > 0) expect(state.explodedAmount).toBe(0)
      if (state.explodedAmount > 0) expect(state.sectionAmount).toBe(0)
    }
  })
  it('toggles bath and metal independently, including their cut faces', () => {
    const state = { ...sampleStory(chapterStart(5) + 0.01), cellVisibility: 1, sectionAmount: 1 }
    const bath = model.anchors.get('bath')!
    const metal = model.anchors.get('metal')!
    const bathCap = model.surfaces.find(surface => surface.kind === 'cap' && surface.source === bath)!
    applyModelState(model, { ...state, bathVisibility: 0 }, null)
    expect(bath.visible).toBe(false)
    expect(bathCap.object.visible).toBe(false)
    expect(metal.visible).toBe(true)
    applyModelState(model, { ...state, aluminumVisibility: 0 }, null)
    expect(bath.visible).toBe(true)
    expect(bathCap.object.visible).toBe(true)
    expect(metal.visible).toBe(false)
    applyModelState(model, state, null)
    expect(metal.visible).toBe(true)
  })
  it('measures the operating interfaces and feeder travel from the assembled GLB', () => {
    applyModelState(model, { ...sampleStory(0), cellVisibility: 1 }, null)
    const anchors = operatingAnchors(model)
    expect(anchors.anode.min.y - anchors.metal.max.y).toBeCloseTo(0.04, 5)
    expect(anchors.bath.min.y).toBeCloseTo(anchors.metal.max.y, 5)
    expect(anchors.chiselTravel).toBeCloseTo(0.12, 5)
    expect(anchors.chute.min.y).toBeGreaterThan(anchors.bath.max.y)
    expect(anchors.bubble.edgeZ + 0.07).toBeLessThan(0)
  })
})
