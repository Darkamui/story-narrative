import fs from 'node:fs'
import { URL } from 'node:url'
import process from 'node:process'

for (const filename of ['cell.glb', 'section-caps.glb', 'ending.glb']) {
  const path = new URL(`../public/assets/${filename}`, import.meta.url)
  if (!fs.existsSync(path)) { process.stdout.write(`${filename}: absent; check public/assets and the asset build tools.\n`); continue }
  const buffer = fs.readFileSync(path)
  if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error(`Invalid GLB: ${filename}`)
  const gltf = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString())
  const groups = {}
  for (const node of gltf.nodes) { const group = node.name.split('_').slice(0, 2).join('_'); groups[group] = (groups[group] ?? 0) + 1 }
  process.stdout.write(`${JSON.stringify({ filename, bytes: buffer.length, nodes: gltf.nodes.length, meshes: gltf.meshes?.length ?? 0, materials: gltf.materials?.length ?? 0, groups, animations: (gltf.animations ?? []).map(a => ({ name: a.name, channels: a.channels.length })), processNodes: gltf.nodes.filter(n => n.name.startsWith('04_PROCESS')).map(n => n.name) }, null, 2)}\n`)
}
