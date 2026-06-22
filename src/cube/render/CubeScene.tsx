import { PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { ActiveTurnAnimation, ActiveViewAnimation } from '../game'
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
  readonly activeViewAnimation: ActiveViewAnimation | null
  readonly onTurnAnimationComplete: (startedAt: number) => void
  readonly onViewAnimationComplete: (startedAt: number) => void
}

export function CubeScene({
  cubeState,
  viewOrientation,
  peekDirection,
  activeTurnAnimation,
  activeViewAnimation,
  onTurnAnimationComplete,
  onViewAnimationComplete,
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
      <AnimationDriver
        key={
          activeTurnAnimation
            ? `turn-${activeTurnAnimation.startedAt}`
            : activeViewAnimation
              ? `view-${activeViewAnimation.startedAt}`
              : 'idle'
        }
        cubeState={cubeState}
        viewOrientation={viewOrientation}
        peekDirection={peekDirection}
        activeTurnAnimation={activeTurnAnimation}
        activeViewAnimation={activeViewAnimation}
        onTurnComplete={onTurnAnimationComplete}
        onViewComplete={onViewAnimationComplete}
      />
    </Canvas>
  )
}

interface AnimationDriverProps {
  readonly cubeState: CubeState
  readonly viewOrientation: ViewOrientation
  readonly peekDirection: PeekDirection
  readonly activeTurnAnimation: ActiveTurnAnimation | null
  readonly activeViewAnimation: ActiveViewAnimation | null
  readonly onTurnComplete: (startedAt: number) => void
  readonly onViewComplete: (startedAt: number) => void
}

function AnimationDriver({
  cubeState,
  viewOrientation,
  peekDirection,
  activeTurnAnimation,
  activeViewAnimation,
  onTurnComplete,
  onViewComplete,
}: AnimationDriverProps) {
  const [progress, setProgress] = useState(0)
  const completed = useRef(false)

  useFrame(() => {
    const animation = activeTurnAnimation ?? activeViewAnimation
    if (!animation || completed.current) return
    const elapsed = performance.now() - animation.startedAt
    const nextProgress = clampProgress(elapsed / animation.durationMs)
    setProgress(nextProgress)
    if (nextProgress === 1) {
      completed.current = true
      if (activeTurnAnimation) onTurnComplete(activeTurnAnimation.startedAt)
      else if (activeViewAnimation) {
        onViewComplete(activeViewAnimation.startedAt)
      }
    }
  })

  return (
    <CubeRenderer
      cubeState={cubeState}
      viewOrientation={viewOrientation}
      peekDirection={peekDirection}
      activeTurnAnimation={activeTurnAnimation}
      activeViewAnimation={activeViewAnimation}
      animationProgress={progress}
    />
  )
}
