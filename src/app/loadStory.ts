// A stalled module request must offer a way back to the library.
export function loadStory<T>(load: () => Promise<T>, timeoutMs = 15000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Story load timed out')), timeoutMs)
    Promise.resolve().then(load).then(resolve, reject).finally(() => clearTimeout(timer))
  })
}
