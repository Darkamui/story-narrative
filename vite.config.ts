import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { include: ['src/**/*.test.ts'] },
  build: { rollupOptions: { output: { manualChunks: id => {
    const path = id.replaceAll('\\', '/')
    if (/node_modules\/(react|react-dom|scheduler)\//.test(path)) return 'react'
    if (/node_modules\/(three|@react-three)/.test(path)) return 'three'
  } } } },
})
