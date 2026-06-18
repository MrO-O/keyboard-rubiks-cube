import { useCallback, useReducer } from 'react'
import type { CubeAction } from '../controls'
import { createInitialCubeGameState, gameReducer } from './gameReducer'

export function useCubeGame(animationDurationMs = 180) {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialCubeGameState,
  )

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

  return {
    state,
    dispatch: dispatchCubeAction,
    completeTurnAnimation,
  }
}

export type CubeGameController = ReturnType<typeof useCubeGame>
