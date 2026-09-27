import { useTranslation } from '../i18n/locale'
import { Component, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import CellScene from '../three/CellScene'
import { storyStore } from '../story/store'
import type { AssetStatus } from '../three/ModelLoader'

declare global { interface Window { __CELL_RENDER__?: { frame: number; chapter: number; calls: number; triangles: number; positions: Record<string, number[]> } } }

class SceneBoundary extends Component<{ children: ReactNode; failed: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.failed() }
  render() { return this.state.failed ? null : this.props.children }
}

function RenderOnChange() {
  const invalidate = useThree(state => state.invalidate)
  useEffect(() => storyStore.subscribe(invalidate), [invalidate])
  useFrame(({ scene, gl }) => {
    if (!import.meta.env.DEV) return
    const positions: Record<string, number[]> = {}
    scene.getObjectByName('CELL_ROOT')?.children.forEach(child => { positions[child.name] = child.position.toArray() })
    const snapshot = { frame: (window.__CELL_RENDER__?.frame ?? 0) + 1, chapter: storyStore.get().chapterIndex, calls: 0, triangles: 0, positions }
    window.__CELL_RENDER__ = snapshot
    requestAnimationFrame(() => { snapshot.calls = gl.info.render.calls; snapshot.triangles = gl.info.render.triangles })
  })
  return null
}

export default function Experience({ lowQuality, onReady, onFailure, attempt, onAssetStatus }: { lowQuality: boolean; onReady: () => void; onFailure: () => void; attempt: number; onAssetStatus: (status: AssetStatus) => void }) {
  const { t } = useTranslation()
  const [capable] = useState(() => {
    try {
      const context = document.createElement('canvas').getContext('webgl2')
      if (!context) return false
      context.getExtension('WEBGL_lose_context')?.loseContext()
      return true
    } catch { return false }
  })
  const [failed, setFailed] = useState(false)
  useEffect(() => { if (!capable) onFailure() }, [capable, onFailure])
  const fail = () => { setFailed(true); onFailure() }
  if (!capable) return null
  return <SceneBoundary failed={fail}>
    {!failed && <Canvas frameloop="demand" dpr={lowQuality ? 1 : [1, 1.6]} camera={{ position: [0, 2, 7], fov: 36, near: 0.1, far: 120 }}
      gl={{ antialias: !lowQuality, alpha: true, powerPreference: 'low-power' }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
        gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); fail() }, { once: true })
        onReady()
      }} fallback={<p>{t("Your browser cannot display the 3D canvas. Use Read the story below.")}</p>}>
      <RenderOnChange />
      <Suspense fallback={null}><CellScene attempt={attempt} onStatus={onAssetStatus} /></Suspense>
    </Canvas>}
  </SceneBoundary>
}
