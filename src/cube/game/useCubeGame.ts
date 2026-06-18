import { useReducer } from 'react'
import { createInitialCubeGameState, gameReducer } from './gameReducer'

export function useCubeGame() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialCubeGameState,
  )

  return { state, dispatch }
}
