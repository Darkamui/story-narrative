import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { assemblyMotion, assemblyOffset, beatFromHash, shots, zoneOpacity } from './state'
import { beatIds, copy, sources } from './content'

describe('graphics card investigations', () => {
  it('resolves deep links and safely defaults unknown fragments', () => {
    beatIds.forEach((id, index) => expect(beatFromHash(`#${id}`)).toBe(index))
    expect(beatFromHash('#unrecognized')).toBe(0)
    expect(beatFromHash('')).toBe(0)
    expect(beatFromHash('#cooling')).toBe(6)
    expect(beatFromHash('#deadline')).toBe(0)
  })
  it('returns to exactly the same assembly poses after forward and reverse seeking', () => {
    for (const name of Object.keys(assemblyMotion)) {
      const forward = [0, 0.15, 0.5, 0.85, 1].map(value => assemblyOffset(name, value))
      const reverse = [1, 0.85, 0.5, 0.15, 0].map(value => assemblyOffset(name, value)).reverse()
      expect(reverse).toEqual(forward)
      expect(assemblyOffset(name, 1)).toEqual(assemblyMotion[name].offset)
      expect(assemblyOffset(name, -1).every(value => value === 0)).toBe(true)
      expect(assemblyOffset(name, 2)).toEqual(assemblyMotion[name].offset)
    }
    expect(shots).toHaveLength(beatIds.length)
  })
  it('exposes the processor, separates the contact stack and reveals the real heatpipes', () => {
    expect(zoneOpacity('processor', 2)).toBe(1)
    expect(zoneOpacity('fins', 2)).toBe(0)
    expect(shots[2].span).toBeLessThan(0.08)
    expect(shots[5].zones).toEqual(['processor', 'paste', 'contact'])
    expect(zoneOpacity('heatpipes', 6)).toBe(1)
    expect(zoneOpacity('fins', 6)).toBeLessThan(0.2)
    expect(zoneOpacity('board', 6)).toBe(0)
    expect(shots[8].direction[0]).toBeLessThan(-0.9)
  })
  it('provides camera targets and restrained annotations for every part', () => {
    for (const shot of shots) {
      expect(shot.direction.every(Number.isFinite)).toBe(true)
      expect(shot.markers.length).toBeLessThanOrEqual(3)
      for (const marker of shot.markers) {
        expect(copy.en.labels[marker.label]).toBeTruthy()
        expect(copy.fr.labels[marker.label]).toBeTruthy()
      }
    }
  })
  it('provides every investigation and source reference in both languages', () => {
    for (const locale of ['en', 'fr'] as const) {
      expect(copy[locale].beats).toHaveLength(beatIds.length)
      for (const beat of copy[locale].beats) {
        expect(sources[beat.source]?.url).toMatch(/^https:/)
        expect(beat.body.length).toBeGreaterThan(100)
        expect(beat.detail.length).toBeGreaterThan(100)
      }
    }
  })
  it('retains every delivered component in the batched browser asset', () => {
    const inventory = JSON.parse(fs.readFileSync('assets/graphics-card/runtime-inventory.json', 'utf8')) as { sourceMeshes: number; batches: number; inventory: { components: string[]; zone: string; material: string }[] }
    const original = fs.readFileSync('assets/graphics-card/delivered/modern_gpu_assembled.glb')
    const source = JSON.parse(original.subarray(20, 20 + original.readUInt32LE(12)).toString()) as { nodes: { name: string; mesh?: number }[] }
    // GLTFLoader sanitizes periods/brackets in the Blender names; count plus unique
    // membership checks protect batching, while originals remain authoritative.
    const names = inventory.inventory.flatMap(batch => batch.components)
    expect(names).toHaveLength(source.nodes.filter(node => node.mesh !== undefined).length)
    expect(new Set(names).size).toBe(inventory.sourceMeshes)
    expect(inventory.sourceMeshes).toBe(4217)
    expect(inventory.batches).toBeLessThan(65)
    expect(inventory.inventory.find(batch => batch.zone === 'memory' && batch.material === 'Chip')?.components).toHaveLength(8)
    const asset = fs.readFileSync('public/assets/graphics-card/axiom-320.glb')
    expect(asset.readUInt32LE(0)).toBe(0x46546c67)
    expect(asset.length).toBeLessThan(15_000_000)
    const runtime = JSON.parse(asset.subarray(20, 20 + asset.readUInt32LE(12)).toString()) as { nodes: { name: string }[]; scenes: { extras: { landmarks: Record<string, unknown> } }[] }
    expect(runtime.nodes.filter(node => /^Rotor_/.test(node.name))).toHaveLength(3)
    for (const shot of shots) for (const marker of shot.markers) expect(runtime.scenes[0].extras.landmarks[marker.part]).toBeDefined()
  })
})
