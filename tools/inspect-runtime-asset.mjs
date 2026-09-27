import fs from 'node:fs'
import process from 'node:process'
import { URL } from 'node:url'
import { Box3, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const data = fs.readFileSync(new URL('../public/assets/cell.glb', import.meta.url))
const gltf = await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), '')
gltf.scene.updateMatrixWorld(true)
const families = {}
let triangles = 0, meshes = 0
gltf.scene.traverse(object => {
  if (!object.isMesh) return
  meshes++
  triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3
  const key = object.name.replace(/_\d+$/, '')
  families[key] = (families[key] ?? 0) + 1
})
const bounds = new Box3().setFromObject(gltf.scene)
const report = { meshes, triangles, bounds: { min: bounds.min.toArray(), max: bounds.max.toArray(), size: bounds.getSize(new Vector3()).toArray() }, families, rigs: gltf.animations.flatMap(clip => clip.tracks.map(track => ({ name: track.name, keyCount: track.times.length, start: Array.from(track.values.slice(0, 3)), end: Array.from(track.values.slice(-3)) }))) }
fs.writeFileSync(new URL('../docs/runtime-asset.json', import.meta.url), JSON.stringify(report, null, 2))
process.stdout.write(JSON.stringify(report, null, 2))
