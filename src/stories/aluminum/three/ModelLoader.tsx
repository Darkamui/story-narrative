import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { disposeScenes, loadAssets } from './assets'
import { BoxHelper, Color, Mesh } from 'three'
import { applyModelState, createModelAdapter, disposeModel, type ModelAdapter } from './modelAdapter'
import { storyStore } from '../story/store'
import { selectionStore } from '../story/selection'
import { classifyNode } from '../data/assemblies'
import { ModelLabels } from './ModelLabels'
import { ProcessEffects } from './effects/ProcessEffects'
import { anatomyStore } from '../story/anatomy'

export type AssetStatus = { state: 'loading' | 'ready' | 'failed'; message?: string }
export function ModelLoader({ attempt, onStatus }: { attempt: number; onStatus: (status: AssetStatus) => void }) {
  const [model, setModel] = useState<ModelAdapter | null>(null)
  const invalidate = useThree(state => state.invalidate)
  const highlight = useRef<BoxHelper>(null)
  useEffect(() => {
    const abort = new AbortController()
    let active = true
    let loaded: ModelAdapter | null = null
    onStatus({ state: 'loading' })
    const timeout = window.setTimeout(() => { abort.abort(); if (active) onStatus({ state: 'failed', message: 'Model load timed out' }) }, 12000)
    loadAssets(['cell.glb', 'section-caps.glb'], abort.signal)
      .then(([gltf, caps]) => {
        if (!active || abort.signal.aborted) { disposeScenes([gltf.scene, caps.scene]); return }
        try { loaded = createModelAdapter(gltf, caps) }
        catch (error) { disposeScenes([gltf.scene, caps.scene]); throw error }
        selectionStore.setInventory(loaded.inventory)
        setModel(loaded)
        onStatus({ state: 'ready' })
        invalidate()
      })
      .catch(error => { if (active) onStatus({ state: 'failed', message: error instanceof Error ? error.message : 'Asset unavailable' }) })
      .finally(() => clearTimeout(timeout))
    const unsubscribe = selectionStore.subscribe(invalidate)
    const unsubscribeAnatomy = anatomyStore.subscribe(invalidate)
    return () => { active = false; abort.abort(); clearTimeout(timeout); unsubscribe(); unsubscribeAnatomy(); if (loaded) disposeModel(loaded) }
  }, [attempt, invalidate, onStatus])
  useFrame(() => {
    if (!model) return
    const selected = selectionStore.get()
    applyModelState(model, storyStore.get(), selected, anatomyStore.get())
    if (highlight.current) {
      const object = selected?.node ? model.scene.getObjectByName(selected.node) : null
      highlight.current.visible = !!object?.visible && model.scene.visible
      if (object) highlight.current.setFromObject(object)
    }
    if (import.meta.env.DEV) window.__CELL_ASSET__ = { meshes: model.meshes.length, triangles: model.triangles, mapped: model.meshes.filter(mesh => mesh.userData.family).length, rigs: model.rigs.length, bounds: model.bounds.min.toArray().concat(model.bounds.max.toArray()) }
  }, -1)
  if (!model) return null
  const pick = (event: ThreeEvent<MouseEvent>) => {
    const hit = event.intersections.find(hit => hit.object instanceof Mesh && hit.object.visible && model.plane.distanceToPoint(hit.point) >= 0)
    if (!hit) return
    const name = hit.object.userData.sourceNode ?? hit.object.name
    const family = classifyNode(name)
    if (family) { event.stopPropagation(); selectionStore.select({ family, node: name }) }
  }
  return <>
    <primitive object={model.scene} onClick={pick} dispose={null} />
    <boxHelper ref={highlight} args={[model.scene, new Color('#e6bd80')]} />
    <ModelLabels model={model} />
    <ProcessEffects model={model} />
  </>
}
declare global { interface Window { __CELL_ASSET__?: { meshes: number; triangles: number; mapped: number; rigs: number; bounds: number[] } } }
