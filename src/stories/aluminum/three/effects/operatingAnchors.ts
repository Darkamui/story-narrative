import { Box3, Mesh, Vector3 } from 'three'
import type { ModelAdapter } from '../modelAdapter'

export function operatingAnchors(model: ModelAdapter) {
  const bounds = (name: string) => {
    const object = model.scene.getObjectByName(name)
    if (!(object instanceof Mesh)) throw new Error(`Missing process anchor: ${name}`)
    return new Box3().copy(object.geometry.boundingBox!).applyMatrix4(object.matrixWorld)
  }
  const anode = bounds('05_ANODES_block_008')
  const bath = bounds('04_PROCESS_bath_000')
  const metal = bounds('04_PROCESS_metal_000')
  const chute = bounds('07_SUPERSTRUCTURE_chute_002')
  const chisel = model.scene.getObjectByName('07_SUPERSTRUCTURE_chisel_002')!
  const chiselBounds = bounds(chisel.name)
  return { anode, bath, metal, chute, chisel, chiselBase: chisel.position.clone(),
    chiselTravel: chiselBounds.min.y - bath.max.y, center: anode.getCenter(new Vector3()),
    bubble: { minX: anode.min.x, maxX: anode.max.x, bottom: anode.min.y, edgeZ: anode.max.z } }
}
