import { Matrix4, Mesh, MeshStandardMaterial, Plane, Vector3 } from 'three'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'

export type SectionSurface = { object: Mesh; source: Mesh; kind: 'front' | 'cap'; material: MeshStandardMaterial }

// Complementary half meshes let the near side dissolve while the solid cut faces
// emerge. No moving plane, open tunnel, or geometry swap at the end of the cut.
export function createSectionSurfaces(meshes: Mesh[], caps: GLTF): SectionSurface[] {
  const surfaces: SectionSurface[] = []
  const frontPlane = new Plane(new Vector3(0, 0, 1), 0)
  const inverse = new Matrix4()
  caps.scene.updateMatrixWorld(true)
  for (const source of meshes) {
    const original = source.material as MeshStandardMaterial
    const corners = source.geometry.boundingBox!
    const max = corners.clone().applyMatrix4(source.matrixWorld).max
    if (max.z > 0) {
      const material = original.clone()
      material.clippingPlanes = [frontPlane]
      const object = new Mesh(source.geometry, material)
      object.name = `FRONT_${source.name}`
      object.userData.sourceNode = source.name
      source.add(object)
      object.visible = false
      surfaces.push({ object, source, kind: 'front', material })
    }
    const cap = caps.scene.getObjectByName(`CAP_${source.name}`)
    if (!(cap instanceof Mesh)) continue
    inverse.copy(source.matrixWorld).invert()
    const geometry = cap.geometry.clone().applyMatrix4(cap.matrixWorld).applyMatrix4(inverse)
    const material = original.clone()
    material.clippingPlanes = []
    material.roughness = Math.max(material.roughness, 0.55)
    const object = new Mesh(geometry, material)
    object.name = `CAP_${source.name}`
    object.userData.sourceNode = source.name
    source.add(object)
    object.visible = false
    surfaces.push({ object, source, kind: 'cap', material })
  }
  return surfaces
}

export function updateSectionSurfaces(surfaces: SectionSurface[], amount: number) {
  for (const surface of surfaces) {
    const { object, source, kind, material } = surface
    const original = source.material as MeshStandardMaterial
    const weight = kind === 'cap' ? amount : amount > 0 ? 1 - amount : 0
    material.color.copy(original.color)
    material.emissive.copy(original.emissive)
    material.opacity = original.opacity * weight
    const transparent = material.opacity < 0.995
    if (material.transparent !== transparent) { material.transparent = transparent; material.needsUpdate = true }
    material.depthWrite = !transparent
    object.visible = material.opacity > 0.002
  }
}
