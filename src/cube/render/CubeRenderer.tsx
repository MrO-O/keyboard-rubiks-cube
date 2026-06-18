import type { CubeState } from '../model'
import type { PeekDirection, ViewOrientation } from '../view'
import { CubieMesh } from './CubieMesh'
import { getCubeRenderData } from './renderData'
import { getDisplayRotation } from './viewTransform'

interface CubeRendererProps {
  readonly cubeState: CubeState
  readonly viewOrientation: ViewOrientation
  readonly peekDirection: PeekDirection
}

export function CubeRenderer({
  cubeState,
  viewOrientation,
  peekDirection,
}: CubeRendererProps) {
  const cubies = getCubeRenderData(cubeState)
  const quaternion = getDisplayRotation(viewOrientation, peekDirection)

  return (
    <group quaternion={quaternion}>
      {cubies.map((cubie) => (
        <CubieMesh key={cubie.id} cubie={cubie} />
      ))}
    </group>
  )
}
