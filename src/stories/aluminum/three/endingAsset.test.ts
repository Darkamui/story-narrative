import { readFile } from 'node:fs/promises'
import { expect, it } from 'vitest'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Box3, Mesh } from 'three'
import { castingParts, tappingParts } from '../data/ending'

it('identifies every ending mesh and keeps the tapping inlet inside metal',async()=>{
  const buffer=await readFile(new URL('../../../../public/assets/ending.glb',import.meta.url))
  const {scene}=await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'')
  scene.updateMatrixWorld(true)
  const names:string[]=[]
  scene.traverse(o=>{if(o instanceof Mesh){names.push(o.name);expect([...tappingParts,...castingParts].filter(p=>p.prefixes.some(prefix=>o.name.startsWith(prefix)))).toHaveLength(1)}})
  expect(names).toHaveLength(41)
  const metal=new Box3().setFromObject(scene.getObjectByName('TAP_metal_pad')!)
  const tube=new Box3().setFromObject(scene.getObjectByName('TAP_tube_00')!)
  expect(tube.min.y).toBeGreaterThan(metal.min.y)
  expect(tube.min.y).toBeLessThan(metal.max.y)
  expect(tube.min.x).toBeGreaterThan(metal.min.x)
  expect(tube.max.x).toBeLessThan(metal.max.x)
  expect(names.every(name=>name.startsWith('TAP_')||name.startsWith('CAST_'))).toBe(true)
})
