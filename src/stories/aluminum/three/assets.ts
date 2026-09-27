import { BufferGeometry, Material, Mesh, Texture, type Object3D } from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'

// glTF meshes can share resources. Dispose each resource once, including
// source scenes whose geometry/materials were cloned for the runtime adapter.
export function disposeScenes(scenes: Object3D[]) {
  const geometries = new Set<BufferGeometry>()
  const materials = new Set<Material>()
  const textures = new Set<Texture>()
  scenes.forEach(scene => scene.traverse(object => {
    if (!(object instanceof Mesh)) return
    geometries.add(object.geometry)
    const list = Array.isArray(object.material) ? object.material : [object.material]
    list.forEach(material => {
      materials.add(material)
      Object.values(material).forEach(value => { if (value instanceof Texture) textures.add(value) })
    })
  }))
  textures.forEach(texture => texture.dispose())
  materials.forEach(material => material.dispose())
  geometries.forEach(geometry => geometry.dispose())
}

export async function loadAssets(files: string[], signal: AbortSignal): Promise<GLTF[]> {
  // Wait for all parses before cleaning up a partial failure. A sibling fetch
  // or an in-flight parse can finish after another asset rejects or is aborted.
  const results = await Promise.allSettled(files.map(async file => {
    const response = await fetch(`${import.meta.env.BASE_URL}assets/${file}`, { signal })
    if (!response.ok) throw new Error(`Asset request failed (${response.status})`)
    const buffer = await response.arrayBuffer()
    signal.throwIfAborted()
    return new GLTFLoader().parseAsync(buffer, '')
  }))
  const loaded = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
  const failed = results.find(result => result.status === 'rejected')
  if (signal.aborted || failed) {
    disposeScenes(loaded.map(asset => asset.scene))
    signal.throwIfAborted()
    throw failed!.reason
  }
  return loaded
}
