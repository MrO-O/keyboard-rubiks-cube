import {
  applyMove,
  createSolvedCube,
  inverseMove,
  isSolved,
  scramble,
  type CubeMove,
} from '../model'
import { INITIAL_VIEW, type ViewOrientation } from '../view'
import {
  formatMoveLabel,
  getFaceForViewAction,
  type CubeAction,
} from '../controls'
import type { CubeGameState } from './gameTypes'

export function createInitialCubeGameState(): CubeGameState {
  const cubeState = createSolvedCube()
  return {
    cubeState,
    viewOrientation: INITIAL_VIEW,
    moveHistory: [],
    lastActionLabel: 'Ready',
    isSolved: true,
  }
}

export function gameReducer(
  state: CubeGameState,
  action: CubeAction,
): CubeGameState {
  switch (action.id) {
    case 'turnViewUp':
    case 'turnViewDown':
    case 'turnViewLeft':
    case 'turnViewRight':
    case 'turnViewFront':
    case 'turnViewBack':
      return applyUserTurn(state, {
        face: getFaceForViewAction(state.viewOrientation, action.id),
        direction: action.direction,
      })

    case 'undoMove':
      return undoLastMove(state)

    case 'resetCube':
      return resetCube(state.viewOrientation)

    case 'scrambleCube':
      return scrambleCube(state.viewOrientation)
  }
}

function applyUserTurn(state: CubeGameState, move: CubeMove): CubeGameState {
  const cubeState = applyMove(state.cubeState, move)
  const label = formatMoveLabel(move.face, move.direction)
  return {
    ...state,
    cubeState,
    moveHistory: [...state.moveHistory, { move, label }],
    lastActionLabel: `Move ${label}`,
    isSolved: isSolved(cubeState),
  }
}

function undoLastMove(state: CubeGameState): CubeGameState {
  const lastMove = state.moveHistory.at(-1)
  if (!lastMove) {
    return { ...state, lastActionLabel: 'No move to undo' }
  }

  const cubeState = applyMove(state.cubeState, inverseMove(lastMove.move))
  return {
    ...state,
    cubeState,
    moveHistory: state.moveHistory.slice(0, -1),
    lastActionLabel: `Undo ${lastMove.label}`,
    isSolved: isSolved(cubeState),
  }
}

function resetCube(viewOrientation: ViewOrientation): CubeGameState {
  const cubeState = createSolvedCube()
  return {
    cubeState,
    viewOrientation,
    moveHistory: [],
    lastActionLabel: 'Reset',
    isSolved: true,
  }
}

function scrambleCube(viewOrientation: ViewOrientation): CubeGameState {
  const { state: cubeState } = scramble(createSolvedCube())
  return {
    cubeState,
    viewOrientation,
    moveHistory: [],
    lastActionLabel: 'Scramble',
    isSolved: isSolved(cubeState),
  }
}
