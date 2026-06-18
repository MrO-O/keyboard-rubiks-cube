import type { CubeMove, CubeState } from '../model'
import type { PeekDirection, ViewOrientation } from '../view'

export interface MoveHistoryEntry {
  readonly move: CubeMove
  readonly label: string
}

export interface CubeGameState {
  readonly cubeState: CubeState
  readonly viewOrientation: ViewOrientation
  readonly peekDirection: PeekDirection
  readonly moveHistory: readonly MoveHistoryEntry[]
  readonly lastActionLabel: string
  readonly isSolved: boolean
}
