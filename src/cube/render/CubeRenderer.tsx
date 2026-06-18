import type { CubeState } from '../model'
import type { ViewOrientation } from '../view'
import { CubieMesh } from './CubieMesh'
import { getCubeRenderData } from './renderData'
import { getCubeGroupRotation } from './viewTransform'

interface CubeRendererProps {
  readonly cubeState: CubeState
  readonly viewOrientation: ViewOrientation
}

export function CubeRenderer({
  cubeState,
  viewOrientation,
}: CubeRendererProps) {
  const cubies = getCubeRenderData(cubeState)
  const quaternion = getCubeGroupRotation(viewOrientation)

  return (
    <group quaternion={quaternion}>
      {cubies.map((cubie) => (
        <CubieMesh key={cubie.id} cubie={cubie} />
      ))}
    </group>
  )
}
