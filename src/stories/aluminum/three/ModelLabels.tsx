import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { useTranslation } from '../i18n/locale'
import { Box3, Mesh, Raycaster, Vector3 } from 'three'
import { allLabels, labelsFor } from '../data/anatomy'
import { anatomyStore } from '../story/anatomy'
import { storyStore } from '../story/store'
import { selectionStore } from '../story/selection'
import type { ModelAdapter } from './modelAdapter'

export function ModelLabels({ model }: { model: ModelAdapter }) {
  const { t } = useTranslation()
  const invalidate = useThree(state => state.invalidate)
  useEffect(() => { invalidate() }, [t, invalidate])
  const work = useMemo(() => ({ point: new Vector3(), projected: new Vector3(), direction: new Vector3(), ray: new Raycaster(), box: new Box3() }), [])
  useFrame(({ camera, size, gl }) => {
    const started = import.meta.env.DEV ? performance.now() : 0
    const { point, projected, direction, ray, box } = work
    const state = storyStore.get()
    const selected = selectionStore.get()
    const detail = anatomyStore.get() && state.chapterIndex === 3
    const canvas = gl.domElement.getBoundingClientRect()
    const active = state.chapterIndex > 0 && state.chapterIndex < 10 && model.scene.visible
    const candidates = [...model.meshes, ...model.surfaces.filter(s => s.kind === 'cap' && s.source.visible).map(s => s.object)].filter(mesh => mesh.visible)
    const occupied: { x: number; y: number }[] = []
    for (const entry of allLabels) document.getElementById('leader-' + entry.key)?.setAttribute('opacity', '0')
    for (const entry of labelsFor(detail)) {
      const row = document.getElementById('legend-' + entry.key)
      const status = document.getElementById('visibility-' + entry.key)
      const group = document.getElementById('leader-' + entry.key)
      if (!row || !status || !group) continue
      if (size.width <= 760) {
        status.textContent = t('Select to inspect')
        continue
      }
      const exact = (detail && !['03', '02a'].includes(entry.key)) || (selected?.family === entry.id && selected.node)
      const name = !detail && selected?.family === entry.id && selected.node ? selected.node : entry.anchor
      const object = model.scene.getObjectByName(name) as Mesh
      const options = exact ? [object] : [object, ...model.meshes.filter(mesh => mesh.userData.family === entry.id && mesh !== object)]
      let visible = false
      let inFrame = false
      let clipped = false
      // Cast to a real surface, accepting another member of the same assembly.
      // This avoids identifying a solid assembly by a hidden interior pivot.
      for (const option of options) {
        if (!active || !option.visible || !option.geometry.boundingBox) continue
        box.copy(option.geometry.boundingBox).applyMatrix4(option.matrixWorld).getCenter(point)
        clipped = state.sectionAmount > 0 && box.min.z > 0.0001
        if (clipped) continue
        // The visible edge is crucial for thin courses: aiming at their centre
        // would cast through the layer above and lose the only attached label.
        point.z = box.max.z
        if (state.sectionAmount > 0) point.z = Math.min(point.z, 0)
        projected.copy(point).project(camera)
        inFrame = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 0.94 && Math.abs(projected.y) < 0.95
        if (clipped || !inFrame) continue
        direction.copy(point).sub(camera.position).normalize()
        ray.set(camera.position, direction)
        ray.far = Infinity
        const hit = ray.intersectObjects(candidates, false).find(hit => model.plane.distanceToPoint(hit.point) >= -0.0001)
        const sourceName = hit?.object.userData.sourceNode ?? hit?.object.name
        const source = sourceName ? model.scene.getObjectByName(sourceName) : null
        if (hit && (exact ? source === object : source?.userData.family === entry.id)) {
          point.copy(hit.point)
          projected.copy(point).project(camera)
          visible = true
          break
        }
        // Inspect representative parts, not every one of the 108 repeated stubs.
        if (options.indexOf(option) > 16) break
      }
      status.textContent = t(!object.visible ? detail ? 'Outside this detail' : state.chapterIndex === 6 || state.chapterIndex === 8 ? 'Not shown in this view' : 'Removed for section' : clipped ? 'Removed for section' : visible ? 'In view' : !inFrame ? 'Outside this view' : 'Inside assembly')
      row.dataset.exposure = visible ? 'visible' : 'internal'
      group.setAttribute('opacity', visible && size.width > 760 ? '1' : '0')
      if (!visible) continue
      const x = (projected.x * 0.5 + 0.5) * size.width
      const y = (-projected.y * 0.5 + 0.5) * size.height
      const rect = row.getBoundingClientRect()
      const left = rect.right < canvas.left + size.width / 2
      const endX = (left ? rect.right + 6 : rect.left - 6) - canvas.left
      const endY = rect.top + rect.height / 2 - canvas.top
      document.getElementById('line-' + entry.key)?.setAttribute('d', 'M ' + x + ' ' + y + ' L ' + (endX + (left ? 16 : -16)) + ' ' + endY + ' L ' + endX + ' ' + endY)
      const dot = document.getElementById('dot-' + entry.key)
      dot?.setAttribute('cx', String(x)); dot?.setAttribute('cy', String(y))
      let markerY = y - 7
      while (occupied.some(p => Math.abs(p.x - x) < 25 && Math.abs(p.y - markerY) < 15)) markerY -= 15
      occupied.push({ x, y: markerY })
      const marker = document.getElementById('marker-' + entry.key)
      marker?.setAttribute('x', String(x + 7)); marker?.setAttribute('y', String(markerY))
    }
    if (import.meta.env.DEV) window.__CELL_LABEL_MS__ = performance.now() - started
  })
  return null
}
declare global { interface Window { __CELL_LABEL_MS__?: number } }
