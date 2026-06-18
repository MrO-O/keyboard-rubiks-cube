import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { CubeState } from '../model'
import { CubeRenderer } from './CubeRenderer'

interface CubeSceneProps {
  readonly cubeState: CubeState
}

export function CubeScene({ cubeState }: CubeSceneProps) {
  return (
    <Canvas className="cube-scene" dpr={[1, 2]}>
      <color attach="background" args={['#e5e7eb']} />
      <OrthographicCamera
        makeDefault
        position={[4.2, 3.4, 5.2]}
        zoom={78}
        near={0.1}
        far={100}
        onUpdate={(camera) => camera.lookAt(0, 0, 0)}
      />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 6]} intensity={1.4} />
      <directionalLight position={[-3, 2, -4]} intensity={0.35} />
      <CubeRenderer cubeState={cubeState} />
    </Canvas>
  )
}
