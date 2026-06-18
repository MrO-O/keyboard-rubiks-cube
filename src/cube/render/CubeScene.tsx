import { PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { CubeState } from '../model'
import { CubeRenderer } from './CubeRenderer'
import { getDefaultCameraConfig } from './cameraConfig'

interface CubeSceneProps {
  readonly cubeState: CubeState
}

export function CubeScene({ cubeState }: CubeSceneProps) {
  const camera = getDefaultCameraConfig()

  return (
    <Canvas className="cube-scene" dpr={[1, 2]}>
      <color attach="background" args={['#e5e7eb']} />
      <PerspectiveCamera
        makeDefault
        position={camera.position}
        fov={camera.fov}
        near={camera.near}
        far={camera.far}
        onUpdate={(perspectiveCamera) => perspectiveCamera.lookAt(...camera.target)}
      />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 6]} intensity={1.4} />
      <directionalLight position={[-3, 2, -4]} intensity={0.35} />
      <CubeRenderer cubeState={cubeState} />
    </Canvas>
  )
}
