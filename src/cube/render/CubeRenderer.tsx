import type { CubeState } from '../model'
import { CubieMesh } from './CubieMesh'
import { getCubeRenderData } from './renderData'

interface CubeRendererProps {
  readonly cubeState: CubeState
}

export function CubeRenderer({ cubeState }: CubeRendererProps) {
  const cubies = getCubeRenderData(cubeState)

  return (
    <group>
      {cubies.map((cubie) => (
        <CubieMesh key={cubie.id} cubie={cubie} />
      ))}
    </group>
  )
}
