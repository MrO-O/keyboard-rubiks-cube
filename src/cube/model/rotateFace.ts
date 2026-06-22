import { faceFromVector, FACE_VECTORS } from './constants'
import {
  getCubieIsInMoveLayer,
  getMoveAxisAndLayer,
  getMoveQuarterTurn,
} from './moveGeometry'
import type {
  Axis,
  Coordinate,
  CubeState,
  Direction,
  Face,
  MoveLayers,
  Stickers,
  Vec3,
} from './types'

function asCoordinate(value: number): Coordinate {
  if (value !== -1 && value !== 0 && value !== 1) {
    throw new Error(`Invalid rotated coordinate: ${value}`)
  }
  return value
}

function rotateVector(vector: Vec3, axis: Axis, quarterTurn: Direction): Vec3 {
  const { x, y, z } = vector
  if (axis === 'x') {
    return quarterTurn === 1
      ? { x, y: asCoordinate(-z), z: y }
      : { x, y: z, z: asCoordinate(-y) }
  }
  if (axis === 'y') {
    return quarterTurn === 1
      ? { x: z, y, z: asCoordinate(-x) }
      : { x: asCoordinate(-z), y, z: x }
  }
  return quarterTurn === 1
    ? { x: asCoordinate(-y), y: x, z }
    : { x: y, y: asCoordinate(-x), z }
}

function rotateStickers(
  stickers: Stickers,
  axis: Axis,
  quarterTurn: Direction,
): Stickers {
  return Object.fromEntries(
    Object.entries(stickers).map(([face, color]) => {
      const normal = FACE_VECTORS[face as Face]
      return [faceFromVector(rotateVector(normal, axis, quarterTurn)), color]
    }),
  )
}

/**
 * Clockwise means clockwise while facing the selected face from outside.
 * Positive-axis faces therefore rotate -90°, and negative-axis faces +90°.
 */
export function rotateFace(
  state: CubeState,
  face: Face,
  direction: Direction,
  layers: MoveLayers = 1,
): CubeState {
  const move = { face, direction, layers }
  const { axis } = getMoveAxisAndLayer(move)
  const quarterTurn = getMoveQuarterTurn(move)

  return {
    cubies: state.cubies.map((cubie) => {
      if (!getCubieIsInMoveLayer(cubie, move)) return cubie
      return {
        ...cubie,
        position: rotateVector(cubie.position, axis, quarterTurn),
        stickers: rotateStickers(cubie.stickers, axis, quarterTurn),
      }
    }),
  }
}
