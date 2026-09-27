let detail = false
const listeners = new Set<() => void>()
export const anatomyStore = {
  get: () => detail,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
  set(value: boolean) { detail = value; listeners.forEach(listener => listener()) },
}
