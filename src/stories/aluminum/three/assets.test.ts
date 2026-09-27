import { afterEach, expect, it, vi } from 'vitest'
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Texture } from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { disposeScenes, loadAssets } from './assets'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })
function asset() {
  const geometry = new BoxGeometry()
  const material = new MeshStandardMaterial({ map: new Texture() })
  const scene = new Group()
  scene.add(new Mesh(geometry, material), new Mesh(geometry, material))
  return { scene, geometry, material }
}
it('disposes shared source and runtime resources once', () => {
  const { scene, geometry, material } = asset()
  const spies = [vi.spyOn(geometry, 'dispose'), vi.spyOn(material, 'dispose'), vi.spyOn(material.map!, 'dispose')]
  disposeScenes([scene, scene.clone(true)])
  spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1))
})
it('disposes a successfully parsed sibling when another asset fails', async () => {
  const { scene, geometry } = asset()
  const dispose = vi.spyOn(geometry, 'dispose')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(new ArrayBuffer(0))).mockResolvedValueOnce(new Response('', { status: 503 })))
  vi.spyOn(GLTFLoader.prototype, 'parseAsync').mockResolvedValue({ scene } as unknown as GLTF)
  await expect(loadAssets(['cell.glb', 'caps.glb'], new AbortController().signal)).rejects.toThrow('503')
  expect(dispose).toHaveBeenCalledOnce()
})
it('disposes a parse that completes after cancellation', async () => {
  const { scene, geometry } = asset()
  const abort = new AbortController()
  const dispose = vi.spyOn(geometry, 'dispose')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new ArrayBuffer(0))))
  vi.spyOn(GLTFLoader.prototype, 'parseAsync').mockImplementation(async () => {
    abort.abort()
    return { scene } as unknown as GLTF
  })
  await expect(loadAssets(['cell.glb'], abort.signal)).rejects.toThrow()
  expect(dispose).toHaveBeenCalledOnce()
})
