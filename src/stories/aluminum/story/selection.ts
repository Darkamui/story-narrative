import type { AssemblyId } from '../data/assemblies'
export type Selection = { family: AssemblyId; node: string | null } | null
let selected: Selection = null
let inventory: Record<string, string[]> = {}
const listeners = new Set<() => void>()
export const selectionStore = {
  get: () => selected,
  inventory: () => inventory,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
  select(next: Selection) { selected = next; listeners.forEach(listener => listener()) },
  setInventory(next: Record<string, string[]>) { inventory = next; listeners.forEach(listener => listener()) },
}
