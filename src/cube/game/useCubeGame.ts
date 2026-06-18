import { useCallback, useReducer } from 'react'
import type { CubeAction } from '../controls'
import { createInitialCubeGameState, gameReducer } from './gameReducer'

export function useCubeGame() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialCubeGameState,
  )

  const dispatchCubeAction = useCallback((action: CubeAction) => {
    if ('direction' in action) {
      dispatch({ ...action, startedAt: performance.now() })
      return
    }
    dispatch(action)
  }, [])

  const completeTurnAnimation = useCallback((startedAt: number) => {
    dispatch({ id: 'completeFaceTurnAnimation', startedAt })
  }, [])

  return {
    state,
    dispatch: dispatchCubeAction,
    completeTurnAnimation,
  }
}
