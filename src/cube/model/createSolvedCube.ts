import { FACE_COLORS } from './constants'
import type { Coordinate, CubeState, Face, Stickers, Vec3 } from './types'

const COORDINATES: readonly Coordinate[] = [-1, 0, 1]

function stickersAt(position: Vec3): Stickers {
  const stickers: Stickers = {}
  if (position.y === 1) stickers.U = FACE_COLORS.U
  if (position.y === -1) stickers.D = FACE_COLORS.D
  if (position.x === -1) stickers.L = FACE_COLORS.L
  if (position.x === 1) stickers.R = FACE_COLORS.R
  if (position.z === 1) stickers.F = FACE_COLORS.F
  if (position.z === -1) stickers.B = FACE_COLORS.B
  return stickers
}

function cubieId(position: Vec3): string {
  const faces: Face[] = []
  if (position.y === 1) faces.push('U')
  if (position.y === -1) faces.push('D')
  if (position.x === -1) faces.push('L')
  if (position.x === 1) faces.push('R')
  if (position.z === 1) faces.push('F')
  if (position.z === -1) faces.push('B')
  return faces.join('')
}

export function createSolvedCube(): CubeState {
  const cubies = COORDINATES.flatMap((x) =>
    COORDINATES.flatMap((y) =>
      COORDINATES.flatMap((z) => {
        if (x === 0 && y === 0 && z === 0) return []
        const position: Vec3 = { x, y, z }
        return [
          { id: cubieId(position), position, stickers: stickersAt(position) },
        ]
      }),
    ),
  )

  return { cubies }
}
