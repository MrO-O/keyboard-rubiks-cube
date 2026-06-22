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
  rollViewCounterClockwise,
  rotateViewDown,
  rotateViewLeft,
  rotateViewRight,
  rotateViewUp,
  type ViewOrientation,
} from '../view'
import {
  formatMoveLabel,
  formatViewActionLabel,
  getFaceForViewAction,
  type ViewActionId,
} from '../controls'
import {
  TURN_ANIMATION_MS,
  type CubeGameAction,
  type CubeGameState,
} from './gameTypes'

export function createInitialCubeGameState(): CubeGameState {
  const cubeState = createSolvedCube()
  return {
    cubeState,
    viewOrientation: INITIAL_VIEW,
    peekDirection: null,
    activeTurnAnimation: null,
    activeViewAnimation: null,
    pendingTurn: null,
    wideTurnModifierActive: false,
    moveHistory: [],
    lastActionLabel: 'Ready',
    isSolved: true,
  }
}

function isAllowedDuringViewAnimation(
  actionId: CubeGameAction['id'],
): boolean {
  return [
    'completeViewAnimation',
    'resetCube',
    'startPeekRight',
    'startPeekLeft',
    'stopPeekRight',
    'stopPeekLeft',
    'clearPeek',
    'startWideTurnModifier',
    'stopWideTurnModifier',
    'clearWideTurnModifier',
  ].includes(actionId)
}

function isBlockedDuringAnimation(actionId: CubeGameAction['id']): boolean {
  return ![
    'completeFaceTurnAnimation',
    'resetCube',
    'startPeekRight',
    'startPeekLeft',
    'stopPeekRight',
    'stopPeekLeft',
    'clearPeek',
    'startWideTurnModifier',
    'stopWideTurnModifier',
    'clearWideTurnModifier',
  ].includes(actionId)
}

export function gameReducer(
  state: CubeGameState,
  action: CubeGameAction,
): CubeGameState {
  if (
    state.activeViewAnimation &&
    !isAllowedDuringViewAnimation(action.id)
  ) {
    return state
  }

  if (state.activeTurnAnimation && 'direction' in action) {
    return bufferUserTurn(state, {
      face: getFaceForViewAction(state.viewOrientation, action.id),
      direction: action.direction,
      ...(action.layers ? { layers: action.layers } : {}),
    })
  }

  if (state.activeTurnAnimation && isBlockedDuringAnimation(action.id)) {
    return state
  }

  switch (action.id) {
    case 'turnViewUp':
    case 'turnViewDown':
    case 'turnViewLeft':
    case 'turnViewRight':
    case 'turnViewFront':
    case 'turnViewBack':
      return startUserTurn(
        state,
        {
          face: getFaceForViewAction(state.viewOrientation, action.id),
          direction: action.direction,
          ...(action.layers ? { layers: action.layers } : {}),
        },
        action.startedAt ?? 0,
        action.animationDurationMs ?? TURN_ANIMATION_MS,
      )

    case 'completeFaceTurnAnimation':
      return completeUserTurn(
        state,
        action.startedAt,
        action.completedAt,
        action.nextAnimationDurationMs,
      )

    case 'rotateViewUp':
      return startViewAnimation(state, action, 'View up')

    case 'rotateViewDown':
      return startViewAnimation(state, action, 'View down')

    case 'rotateViewLeft':
      return startViewAnimation(state, action, 'View left')

    case 'rotateViewRight':
      return startViewAnimation(state, action, 'View right')

    case 'rollViewClockwise':
      return startViewAnimation(state, action, 'Roll clockwise')

    case 'rollViewCounterClockwise':
      return startViewAnimation(state, action, 'Roll counterclockwise')

    case 'completeViewAnimation':
      return completeViewAnimation(state, action.startedAt)

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

    case 'startWideTurnModifier':
      return updateWideTurnModifier(state, true)

    case 'stopWideTurnModifier':
    case 'clearWideTurnModifier':
      return updateWideTurnModifier(state, false)

    case 'undoMove':
      return undoLastMove(state)

    case 'resetCube':
      return resetCube()

    case 'scrambleCube':
      return scrambleCube(state.viewOrientation)
  }
}

function updateWideTurnModifier(
  state: CubeGameState,
  active: boolean,
): CubeGameState {
  if (state.wideTurnModifierActive === active) return state
  return {
    ...state,
    wideTurnModifierActive: active,
    lastActionLabel: active ? 'Wide modifier active' : 'Wide modifier released',
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

function startViewAnimation(
  state: CubeGameState,
  action: Extract<CubeGameAction, { id: ViewActionId }>,
  lastActionLabel: string,
): CubeGameState {
  return {
    ...state,
    activeViewAnimation: {
      action: action.id,
      fromOrientation: state.viewOrientation,
      toOrientation: getNextViewOrientation(state.viewOrientation, action.id),
      startedAt: action.startedAt ?? 0,
      durationMs: action.animationDurationMs ?? TURN_ANIMATION_MS,
    },
    lastActionLabel,
  }
}

function getNextViewOrientation(
  view: ViewOrientation,
  action: ViewActionId,
): ViewOrientation {
  switch (action) {
    case 'rotateViewUp':
      return rotateViewUp(view)
    case 'rotateViewDown':
      return rotateViewDown(view)
    case 'rotateViewLeft':
      return rotateViewLeft(view)
    case 'rotateViewRight':
      return rotateViewRight(view)
    case 'rollViewClockwise':
      return rollViewClockwise(view)
    case 'rollViewCounterClockwise':
      return rollViewCounterClockwise(view)
  }
}

function completeViewAnimation(
  state: CubeGameState,
  startedAt: number,
): CubeGameState {
  const animation = state.activeViewAnimation
  if (!animation || animation.startedAt !== startedAt) return state
  return {
    ...state,
    viewOrientation: animation.toOrientation,
    activeViewAnimation: null,
    lastActionLabel: formatViewActionLabel(animation.action),
  }
}

function startUserTurn(
  state: CubeGameState,
  move: CubeMove,
  startedAt: number,
  durationMs: number,
): CubeGameState {
  const toState = applyMove(state.cubeState, move)
  const label = formatMoveLabel(move.face, move.direction, move.layers)
  return {
    ...state,
    activeTurnAnimation: {
      move,
      fromState: state.cubeState,
      toState,
      startedAt,
      durationMs,
    },
    pendingTurn: null,
    lastActionLabel: `Turning ${label}`,
  }
}

function bufferUserTurn(state: CubeGameState, move: CubeMove): CubeGameState {
  return {
    ...state,
    pendingTurn: move,
    lastActionLabel: `Buffered ${formatMoveLabel(move.face, move.direction, move.layers)}`,
  }
}

function completeUserTurn(
  state: CubeGameState,
  startedAt: number,
  completedAt: number,
  nextAnimationDurationMs: number,
): CubeGameState {
  const animation = state.activeTurnAnimation
  if (!animation || animation.startedAt !== startedAt) return state

  const label = formatMoveLabel(
    animation.move.face,
    animation.move.direction,
    animation.move.layers,
  )
  const committedState: CubeGameState = {
    ...state,
    cubeState: animation.toState,
    activeTurnAnimation: null,
    activeViewAnimation: null,
    moveHistory: [...state.moveHistory, { move: animation.move, label }],
    lastActionLabel: `Move ${label}`,
    isSolved: isSolved(animation.toState),
  }

  if (!state.pendingTurn) return committedState

  return startUserTurn(
    committedState,
    state.pendingTurn,
    completedAt,
    nextAnimationDurationMs,
  )
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
    activeTurnAnimation: null,
    activeViewAnimation: null,
    pendingTurn: null,
    wideTurnModifierActive: false,
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
    activeTurnAnimation: null,
    activeViewAnimation: null,
    pendingTurn: null,
    wideTurnModifierActive: false,
    moveHistory: [],
    lastActionLabel: 'Scramble',
    isSolved: isSolved(cubeState),
  }
}
