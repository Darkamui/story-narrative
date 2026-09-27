import { CameraRig } from './CameraRig'
import { GrainAndMetal } from './GrainAndMetal'
import { ModelLoader, type AssetStatus } from './ModelLoader'
import { StudioEnvironment } from './StudioEnvironment'
import { EndingScene } from './EndingScene'

export default function CellScene({ attempt, onStatus }: { attempt: number; onStatus: (status: AssetStatus) => void }) {
  return <>
    <CameraRig />
    <StudioEnvironment />
    <hemisphereLight intensity={2.2} color="#e1e7e4" groundColor="#73766c" />
    <directionalLight position={[4, 14, 10]} intensity={3.3} color="#fff0d7" />
    <directionalLight position={[-9, 8, -5]} intensity={2.8} color="#b6d1cf" />
    <directionalLight position={[0, 2, 10]} intensity={1.1} color="#d3dad7" />
    <ModelLoader attempt={attempt} onStatus={onStatus} />
    <GrainAndMetal />
    <EndingScene />
  </>
}
