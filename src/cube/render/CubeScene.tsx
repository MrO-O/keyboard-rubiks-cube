import { PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { ActiveTurnAnimation } from '../game'
import type { CubeState } from '../model'
import type { PeekDirection, ViewOrientation } from '../view'
import { CubeRenderer } from './CubeRenderer'
import { getDefaultCameraConfig } from './cameraConfig'
import { clampProgress } from './turnAnimation'

interface CubeSceneProps {
  readonly cubeState: CubeState
  readonly viewOrientation: ViewOrientation
  readonly peekDirection: PeekDirection
  readonly activeTurnAnimation: ActiveTurnAnimation | null
  readonly onTurnAnimationComplete: (startedAt: number) => void
}

export function CubeScene({
  cubeState,
  viewOrientation,
  peekDirection,
  activeTurnAnimation,
  onTurnAnimationComplete,
}: CubeSceneProps) {
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
        onUpdate={(perspectiveCamera) =>
          perspectiveCamera.lookAt(...camera.target)
        }
      />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 6]} intensity={1.4} />
      <directionalLight position={[-3, 2, -4]} intensity={0.35} />
      <TurnAnimationDriver
        key={activeTurnAnimation?.startedAt ?? 'idle'}
        cubeState={cubeState}
        viewOrientation={viewOrientation}
        peekDirection={peekDirection}
        activeTurnAnimation={activeTurnAnimation}
        onComplete={onTurnAnimationComplete}
      />
    </Canvas>
  )
}

interface TurnAnimationDriverProps {
  readonly cubeState: CubeState
  readonly viewOrientation: ViewOrientation
  readonly peekDirection: PeekDirection
  readonly activeTurnAnimation: ActiveTurnAnimation | null
  readonly onComplete: (startedAt: number) => void
}

function TurnAnimationDriver({
  cubeState,
  viewOrientation,
  peekDirection,
  activeTurnAnimation,
  onComplete,
}: TurnAnimationDriverProps) {
  const [progress, setProgress] = useState(0)
  const completed = useRef(false)

  useFrame(() => {
    if (!activeTurnAnimation || completed.current) return
    const elapsed = performance.now() - activeTurnAnimation.startedAt
    const nextProgress = clampProgress(elapsed / activeTurnAnimation.durationMs)
    setProgress(nextProgress)
    if (nextProgress === 1) {
      completed.current = true
      onComplete(activeTurnAnimation.startedAt)
    }
  })

  return (
    <CubeRenderer
      cubeState={cubeState}
      viewOrientation={viewOrientation}
      peekDirection={peekDirection}
      activeTurnAnimation={activeTurnAnimation}
      animationProgress={progress}
    />
  )
}
