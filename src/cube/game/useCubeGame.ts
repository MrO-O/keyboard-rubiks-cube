import { useCallback, useEffect, useReducer, useRef } from 'react'
import { formatMoveLabel, type CubeAction } from '../controls'
import { isSolved } from '../model'
import {
  clearSavedGame,
  loadGameState,
  saveGameState,
  type GameStorage,
  type PersistedGameStateV1,
} from '../../gamePersistence'
import { createInitialCubeGameState, gameReducer } from './gameReducer'
import type { CubeGameState } from './gameTypes'

export function restoreGameState(
  persisted: PersistedGameStateV1 | null,
): CubeGameState {
  if (!persisted) return createInitialCubeGameState()
  return {
    cubeState: persisted.cubeState,
    viewOrientation: persisted.viewOrientation,
    moveHistory: persisted.moveHistory.map((move) => ({
      move,
      label: formatMoveLabel(move.face, move.direction),
    })),
    peekDirection: null,
    activeTurnAnimation: null,
    pendingTurn: null,
    lastActionLabel: 'Restored saved game',
    isSolved: isSolved(persisted.cubeState),
  }
}

export function initializeGameState(storage?: GameStorage): CubeGameState {
  return restoreGameState(loadGameState(storage))
}

export function createPersistedGameState(
  state: CubeGameState,
  savedAt = new Date().toISOString(),
): PersistedGameStateV1 {
  return {
    app: 'keyboard-rubiks-cube',
    schemaVersion: 1,
    savedAt,
    cubeState: state.cubeState,
    viewOrientation: state.viewOrientation,
    moveHistory: state.moveHistory.map((entry) => entry.move),
  }
}

export function shouldAutosaveGameState(
  previous: CubeGameState,
  current: CubeGameState,
): boolean {
  return (
    previous.cubeState !== current.cubeState ||
    previous.viewOrientation !== current.viewOrientation ||
    previous.moveHistory !== current.moveHistory
  )
}

export function autosaveGameState(
  previous: CubeGameState,
  current: CubeGameState,
  storage?: GameStorage,
): boolean {
  if (!shouldAutosaveGameState(previous, current)) return false
  saveGameState(createPersistedGameState(current), storage)
  return true
}

export function useCubeGame(
  animationDurationMs = 180,
  storage?: GameStorage,
) {
  const [state, dispatch] = useReducer(
    gameReducer,
    storage,
    initializeGameState,
  )
  const previousState = useRef(state)
  const skipNextAutosave = useRef(false)

  useEffect(() => {
    const previous = previousState.current
    const shouldSave = shouldAutosaveGameState(previous, state)
    previousState.current = state
    if (!shouldSave) return
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false
      return
    }
    autosaveGameState(previous, state, storage)
  }, [state, storage])

  const dispatchCubeAction = useCallback(
    (action: CubeAction) => {
      if ('direction' in action) {
        dispatch({
          ...action,
          startedAt: performance.now(),
          animationDurationMs,
        })
        return
      }
      dispatch(action)
    },
    [animationDurationMs],
  )

  const completeTurnAnimation = useCallback(
    (startedAt: number) => {
      dispatch({
        id: 'completeFaceTurnAnimation',
        startedAt,
        completedAt: performance.now(),
        nextAnimationDurationMs: animationDurationMs,
      })
    },
    [animationDurationMs],
  )

  const clearGame = useCallback(() => {
    skipNextAutosave.current = true
    clearSavedGame(storage)
    dispatch({ id: 'resetCube' })
  }, [storage])

  return {
    state,
    dispatch: dispatchCubeAction,
    completeTurnAnimation,
    clearSavedGame: clearGame,
  }
}

export type CubeGameController = ReturnType<typeof useCubeGame>
