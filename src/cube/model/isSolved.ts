import { createSolvedCube } from './createSolvedCube'
import { serializeCube } from './serializeCube'
import type { CubeState } from './types'

const SOLVED_SERIALIZATION = serializeCube(createSolvedCube())

export function isSolved(state: CubeState): boolean {
  return serializeCube(state) === SOLVED_SERIALIZATION
}
