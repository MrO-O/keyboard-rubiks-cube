import {
  applyMove,
  createSolvedCube,
  inverseMove,
  isSolved,
  scramble,
  type CubeMove,
} from '../model'
import {
  INITIAL_VIEW,
  rollViewClockwise,
  rotateViewDown,
  rotateViewLeft,
  rotateViewRight,
  rotateViewUp,
  type ViewOrientation,
} from '../view'
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
    peekDirection: null,
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

    case 'rotateViewUp':
      return updateView(state, rotateViewUp(state.viewOrientation), 'View up')

    case 'rotateViewDown':
      return updateView(
        state,
        rotateViewDown(state.viewOrientation),
        'View down',
      )

    case 'rotateViewLeft':
      return updateView(
        state,
        rotateViewLeft(state.viewOrientation),
        'View left',
      )

    case 'rotateViewRight':
      return updateView(
        state,
        rotateViewRight(state.viewOrientation),
        'View right',
      )

    case 'rollViewClockwise':
      return updateView(
        state,
        rollViewClockwise(state.viewOrientation),
        'Roll view',
      )

    case 'startPeekRight':
      return {
        ...state,
        peekDirection: 'showRight',
        lastActionLabel: 'Peek right',
      }

    case 'startPeekLeft':
      return {
        ...state,
        peekDirection: 'showLeft',
        lastActionLabel: 'Peek left',
      }

    case 'stopPeekRight':
      return stopPeek(state, 'showRight')

    case 'stopPeekLeft':
      return stopPeek(state, 'showLeft')

    case 'clearPeek':
      return clearPeek(state)

    case 'undoMove':
      return undoLastMove(state)

    case 'resetCube':
      return resetCube()

    case 'scrambleCube':
      return scrambleCube(state.viewOrientation)
  }
}

function stopPeek(
  state: CubeGameState,
  direction: Exclude<CubeGameState['peekDirection'], null>,
): CubeGameState {
  if (state.peekDirection !== direction) return state
  return clearPeek(state)
}

function clearPeek(state: CubeGameState): CubeGameState {
  if (!state.peekDirection) return state
  return { ...state, peekDirection: null, lastActionLabel: 'Peek cleared' }
}

function updateView(
  state: CubeGameState,
  viewOrientation: ViewOrientation,
  lastActionLabel: string,
): CubeGameState {
  return { ...state, viewOrientation, lastActionLabel }
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

function resetCube(): CubeGameState {
  const cubeState = createSolvedCube()
  return {
    cubeState,
    viewOrientation: INITIAL_VIEW,
    peekDirection: null,
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
    peekDirection: null,
    moveHistory: [],
    lastActionLabel: 'Scramble',
    isSolved: isSolved(cubeState),
  }
}
