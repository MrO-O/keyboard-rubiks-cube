import type { CubeMove, CubeState } from '../model'
import type { CubeAction } from '../controls'
import type { PeekDirection, ViewOrientation } from '../view'

export interface MoveHistoryEntry {
  readonly move: CubeMove
  readonly label: string
}

export const TURN_ANIMATION_MS = 180

export interface ActiveTurnAnimation {
  readonly move: CubeMove
  readonly fromState: CubeState
  readonly toState: CubeState
  readonly startedAt: number
  readonly durationMs: number
}

export type CubeGameAction =
  | CubeAction
  | {
      readonly id: 'completeFaceTurnAnimation'
      readonly startedAt: number
      readonly completedAt: number
    }

export interface CubeGameState {
  readonly cubeState: CubeState
  readonly viewOrientation: ViewOrientation
  readonly peekDirection: PeekDirection
  readonly activeTurnAnimation: ActiveTurnAnimation | null
  readonly pendingTurn: CubeMove | null
  readonly moveHistory: readonly MoveHistoryEntry[]
  readonly lastActionLabel: string
  readonly isSolved: boolean
}
