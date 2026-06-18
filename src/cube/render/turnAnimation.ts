import {
  getCubieIsInMoveLayer,
  getMoveAxisAndLayer,
  getMoveQuarterTurn,
  type CubeMove,
  type CubeState,
} from '../model'
import { getCubeRenderData } from './renderData'
import type { CubieRenderData, Vector3Tuple } from './renderTypes'

export interface TurnRenderGroups {
  readonly stationary: readonly CubieRenderData[]
  readonly rotating: readonly CubieRenderData[]
}

export function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function easeTurnProgress(progress: number): number {
  const value = clampProgress(progress)
  return value * value * (3 - 2 * value)
}

export function getTurnAngleRadians(move: CubeMove, progress: number): number {
  const easedProgress = easeTurnProgress(progress)
  if (easedProgress === 0) return 0
  return getMoveQuarterTurn(move) * (Math.PI / 2) * easedProgress
}

export function getTurnRotation(
  move: CubeMove,
  progress: number,
): Vector3Tuple {
  const { axis } = getMoveAxisAndLayer(move)
  const angle = getTurnAngleRadians(move, progress)
  return axis === 'x'
    ? [angle, 0, 0]
    : axis === 'y'
      ? [0, angle, 0]
      : [0, 0, angle]
}

export function getTurnRenderGroups(
  state: CubeState,
  move: CubeMove,
): TurnRenderGroups {
  const stationaryState: CubeState = {
    cubies: state.cubies.filter((cubie) => !getCubieIsInMoveLayer(cubie, move)),
  }
  const rotatingState: CubeState = {
    cubies: state.cubies.filter((cubie) => getCubieIsInMoveLayer(cubie, move)),
  }

  return {
    stationary: getCubeRenderData(stationaryState),
    rotating: getCubeRenderData(rotatingState),
  }
}
