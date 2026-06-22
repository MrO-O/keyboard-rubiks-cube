import { FACE_VECTORS } from '../cube/model'
import type {
  Coordinate,
  CubeColor,
  CubeMove,
  CubeState,
  Face,
} from '../cube/model'
import type { ViewOrientation } from '../cube/view'
import type { PersistedGameStateV1 } from './types'

const FACES = new Set<Face>(['U', 'D', 'L', 'R', 'F', 'B'])
const COLORS = new Set<CubeColor>([
  'white',
  'yellow',
  'orange',
  'red',
  'green',
  'blue',
])
const COORDINATES = new Set<Coordinate>([-1, 0, 1])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFace(value: unknown): value is Face {
  return typeof value === 'string' && FACES.has(value as Face)
}

function isCubeMove(value: unknown): value is CubeMove {
  return (
    isRecord(value) &&
    isFace(value.face) &&
    (value.direction === 1 || value.direction === -1) &&
    (value.layers === undefined || value.layers === 1 || value.layers === 2)
  )
}

function isViewOrientation(value: unknown): value is ViewOrientation {
  if (!isRecord(value) || !isFace(value.up) || !isFace(value.front)) {
    return false
  }
  const up = FACE_VECTORS[value.up]
  const front = FACE_VECTORS[value.front]
  return up.x * front.x + up.y * front.y + up.z * front.z === 0
}

function isCubeState(value: unknown): value is CubeState {
  if (!isRecord(value) || !Array.isArray(value.cubies)) return false
  if (value.cubies.length !== 26) return false

  const ids = new Set<string>()
  const positions = new Set<string>()
  for (const cubie of value.cubies) {
    if (!isRecord(cubie) || typeof cubie.id !== 'string') return false
    if (!isRecord(cubie.position) || !isRecord(cubie.stickers)) return false
    const { x, y, z } = cubie.position
    if (
      !COORDINATES.has(x as Coordinate) ||
      !COORDINATES.has(y as Coordinate) ||
      !COORDINATES.has(z as Coordinate) ||
      (x === 0 && y === 0 && z === 0)
    ) {
      return false
    }
    if (ids.has(cubie.id)) return false
    ids.add(cubie.id)
    const positionKey = `${String(x)},${String(y)},${String(z)}`
    if (positions.has(positionKey)) return false
    positions.add(positionKey)

    for (const [face, color] of Object.entries(cubie.stickers)) {
      if (!isFace(face) || !COLORS.has(color as CubeColor)) return false
    }
  }
  return true
}

export function validatePersistedGame(
  value: unknown,
): PersistedGameStateV1 | null {
  if (!isRecord(value)) return null
  if (value.app !== 'keyboard-rubiks-cube' || value.schemaVersion !== 1) {
    return null
  }
  if (typeof value.savedAt !== 'string' || Number.isNaN(Date.parse(value.savedAt))) {
    return null
  }
  if (!isCubeState(value.cubeState)) return null
  if (!isViewOrientation(value.viewOrientation)) return null
  if (!Array.isArray(value.moveHistory) || !value.moveHistory.every(isCubeMove)) {
    return null
  }
  return value as unknown as PersistedGameStateV1
}
