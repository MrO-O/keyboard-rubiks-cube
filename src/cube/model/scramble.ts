import { applyMoves } from './applyMove'
import { FACES } from './constants'
import type {
  CubeMove,
  CubeState,
  Direction,
  ScrambleOptions,
  ScrambleResult,
} from './types'

export function scramble(
  state: CubeState,
  options: ScrambleOptions = {},
): ScrambleResult {
  const length = options.length ?? 20
  const random = options.random ?? Math.random
  const moves: CubeMove[] = []

  while (moves.length < length) {
    const face = FACES[Math.floor(random() * FACES.length)] ?? 'U'
    if (moves.at(-1)?.face === face) continue
    const direction: Direction = random() < 0.5 ? 1 : -1
    moves.push({ face, direction })
  }

  return { state: applyMoves(state, moves), moves }
}
