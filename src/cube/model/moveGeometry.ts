import { FACE_LAYERS } from './constants'
import type { Axis, Cubie, CubeMove, Direction } from './types'

export interface MoveAxisAndLayer {
  readonly axis: Axis
  readonly layer: -1 | 1
}

export function getMoveAxisAndLayer(move: CubeMove): MoveAxisAndLayer {
  const { axis, coordinate } = FACE_LAYERS[move.face]
  return { axis, layer: coordinate }
}

export function getMoveQuarterTurn(move: CubeMove): Direction {
  const { layer } = getMoveAxisAndLayer(move)
  return (-layer * move.direction) as Direction
}

export function getCubieIsInMoveLayer(cubie: Cubie, move: CubeMove): boolean {
  const { axis, layer } = getMoveAxisAndLayer(move)
  return cubie.position[axis] === layer
}
