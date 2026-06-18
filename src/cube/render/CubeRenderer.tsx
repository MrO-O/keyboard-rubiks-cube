import type { CubeState } from '../model'
import type { ActiveTurnAnimation } from '../game'
import type { PeekDirection, ViewOrientation } from '../view'
import { CubieMesh } from './CubieMesh'
import { getCubeRenderData } from './renderData'
import { getDisplayRotation } from './viewTransform'
import { getTurnRenderGroups, getTurnRotation } from './turnAnimation'

interface CubeRendererProps {
  readonly cubeState: CubeState
  readonly viewOrientation: ViewOrientation
  readonly peekDirection: PeekDirection
  readonly activeTurnAnimation: ActiveTurnAnimation | null
  readonly animationProgress: number
}

export function CubeRenderer({
  cubeState,
  viewOrientation,
  peekDirection,
  activeTurnAnimation,
  animationProgress,
}: CubeRendererProps) {
  const quaternion = getDisplayRotation(viewOrientation, peekDirection)

  if (activeTurnAnimation) {
    const groups = getTurnRenderGroups(
      activeTurnAnimation.fromState,
      activeTurnAnimation.move,
    )
    const rotation = getTurnRotation(
      activeTurnAnimation.move,
      animationProgress,
    )

    return (
      <group quaternion={quaternion}>
        <group>
          {groups.stationary.map((cubie) => (
            <CubieMesh key={cubie.id} cubie={cubie} />
          ))}
        </group>
        <group rotation={rotation}>
          {groups.rotating.map((cubie) => (
            <CubieMesh key={cubie.id} cubie={cubie} />
          ))}
        </group>
      </group>
    )
  }

  const cubies = getCubeRenderData(cubeState)

  return (
    <group quaternion={quaternion}>
      {cubies.map((cubie) => (
        <CubieMesh key={cubie.id} cubie={cubie} />
      ))}
    </group>
  )
}
