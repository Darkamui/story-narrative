import fs from 'node:fs/promises'
import { URL, fileURLToPath } from 'node:url'
import process from 'node:process'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { Box3, Vector3 } from 'three'
import { Document, NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions'
import { dedup, reorder, quantize } from '@gltf-transform/functions'
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer'

// Build only from the preserved delivery. No simplification or geometry removal.
const root = new URL('../', import.meta.url)
const bytes = await fs.readFile(new URL('assets/graphics-card/delivered/modern_gpu_assembled.glb', root))
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')
gltf.scene.updateMatrixWorld(true)
const batches = new Map()
const landmarks = {}
let sourceMeshes = 0
let triangles = 0
gltf.scene.traverse(object => {
  if (!object.isMesh) return
  sourceMeshes++
  let assembly = object.parent
  while (assembly && !assembly.name.startsWith('Assembly_')) assembly = assembly.parent
  if (!assembly) throw new Error(`Missing assembly for ${object.name}`)
  let rotor = object.parent
  while (rotor && !rotor.name.startsWith('Rotor_') && rotor !== assembly) rotor = rotor.parent
  const rotorIndex = rotor?.name.startsWith('Rotor_') ? Number(rotor.name.slice(6)) : null
  const zone = assembly.name === 'Assembly_cooler'
    ? /^Heatpipe/.test(object.name) ? 'heatpipes' : /^Cold_plate/.test(object.name) ? 'contact' : /^Fin_bank/.test(object.name) ? 'fins' : 'cooler'
    : assembly.name === 'Assembly_pads' ? object.name === 'GPU_contact_patch' ? 'paste' : 'pads'
    : assembly.name !== 'Assembly_pcb' ? assembly.name.slice(9)
    : /^(GPU|Die)/i.test(object.name) ? 'processor'
    : /^(Memory|VRAM)/i.test(object.name) ? 'memory'
    : /^(DP_|HDMI_)/.test(object.name) ? 'outputs'
    : /^Power/.test(object.name) ? 'connector'
    : /^PCIe/.test(object.name) ? 'pcie'
    : /^(VRM|Choke|Cap_vent)/i.test(object.name) ? 'power' : 'board'
  if (/^(GPU_die|GPU_substrate|GPU_contact_patch|Cold_plate|Memory_\d\d|Heatpipe_\d\d|Fan_hub_\d|Power_16pin_housing|VRM_\d\d_choke|DP_\d_housing|HDMI_\d_housing|Fin_bank_\d_section_\d|Shroud_shell|PCB_laminate|PCIe_tab_)/.test(object.name)) {
    const bounds = new Box3().setFromObject(object)
    landmarks[object.name] = { assembly: assembly.name.slice(9), center: bounds.getCenter(new Vector3()).toArray(), min: bounds.min.toArray(), max: bounds.max.toArray() }
  }
  const key = `${assembly.name}|${zone}|${rotorIndex ?? 'fixed'}|${object.material.name}`
  const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld)
  const pivot = rotorIndex === null ? null : rotor.getWorldPosition(new Vector3())
  if (pivot) geometry.translate(-pivot.x, -pivot.y, -pivot.z)
  // Delivery contains only positions and normals. Keep this explicit for future exports.
  for (const name of Object.keys(geometry.attributes)) if (!['position', 'normal'].includes(name)) geometry.deleteAttribute(name)
  triangles += geometry.index.count / 3
  if (!batches.has(key)) batches.set(key, { assembly: assembly.name, zone, rotorIndex, pivot, material: object.material, geometries: [], names: [] })
  batches.get(key).geometries.push(geometry)
  batches.get(key).names.push(object.name)
})
const document = new Document()
const buffer = document.createBuffer()
const scene = document.createScene('AXIOM 320').setExtras({ landmarks })
const groups = new Map()
const rotors = new Map()
const materials = new Map()
const inventory = []
for (const [key, batch] of batches) {
  if (!groups.has(batch.assembly)) {
    const node = document.createNode(batch.assembly)
    groups.set(batch.assembly, node)
    scene.addChild(node)
  }
  const source = batch.material
  if (!materials.has(source.name)) materials.set(source.name, document.createMaterial(source.name)
    .setBaseColorFactor([...source.color.toArray(), source.opacity])
    .setMetallicFactor(source.metalness).setRoughnessFactor(source.roughness)
    .setEmissiveFactor(source.emissive.toArray().map(value => value * source.emissiveIntensity)))
  const geometry = mergeGeometries(batch.geometries)
  if (!geometry) throw new Error(`Could not merge ${key}`)
  const accessor = (name, type, array) => document.createAccessor(name).setType(type).setArray(array).setBuffer(buffer)
  const primitive = document.createPrimitive()
    .setAttribute('POSITION', accessor(key, 'VEC3', geometry.attributes.position.array))
    .setAttribute('NORMAL', accessor(key, 'VEC3', geometry.attributes.normal.array))
    .setIndices(accessor(key, 'SCALAR', geometry.index.array))
    .setMaterial(materials.get(source.name))
  const mesh = document.createMesh(key).addPrimitive(primitive)
  let parent = groups.get(batch.assembly)
  if (batch.rotorIndex !== null) {
    if (!rotors.has(batch.rotorIndex)) {
      const rotor = document.createNode(`Rotor_${batch.rotorIndex}`).setTranslation(batch.pivot.toArray())
      parent.addChild(rotor)
      rotors.set(batch.rotorIndex, rotor)
    }
    parent = rotors.get(batch.rotorIndex)
  }
  parent.addChild(document.createNode(`${batch.zone}_${source.name}`).setMesh(mesh).setExtras({ zone: batch.zone }))
  inventory.push({ assembly: batch.assembly, zone: batch.zone, material: source.name, components: batch.names })
}
await MeshoptEncoder.ready
// Keep float positions: the authored surface lettering sits only 1 micron above
// the shell. 16-bit position quantization causes visible depth fighting there.
await document.transform(dedup(), reorder({ encoder: MeshoptEncoder, target: 'size' }), quantize({ pattern: /^NORMAL$/, quantizeNormal: 12 }))
document.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE })
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder })
const output = new URL('public/assets/graphics-card/axiom-320.glb', root)
await io.write(fileURLToPath(output), document)
const report = { sourceMeshes, batches: batches.size, triangles, bytes: (await fs.stat(output)).size, inventory }
await fs.writeFile(new URL('assets/graphics-card/runtime-inventory.json', root), JSON.stringify(report, null, 2) + '\n')
process.stdout.write(JSON.stringify({ sourceMeshes, batches: batches.size, triangles, bytes: report.bytes }) + '\n')
