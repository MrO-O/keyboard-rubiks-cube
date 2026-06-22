import { rotateFace } from './rotateFace'
import type { CubeMove, CubeState } from './types'

export function applyMove(state: CubeState, move: CubeMove): CubeState {
  return rotateFace(state, move.face, move.direction, move.layers)
}

export function applyMoves(
  state: CubeState,
  moves: readonly CubeMove[],
): CubeState {
  return moves.reduce(applyMove, state)
}

export function inverseMove(move: CubeMove): CubeMove {
  return { ...move, direction: move.direction === 1 ? -1 : 1 }
}
