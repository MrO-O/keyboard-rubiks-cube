import type { Direction, Face, MoveLayers } from '../model'
import { getViewFaces, type ViewOrientation } from '../view'

export type TurnActionId =
  | 'turnViewUp'
  | 'turnViewDown'
  | 'turnViewLeft'
  | 'turnViewRight'
  | 'turnViewFront'
  | 'turnViewBack'

export type UtilityActionId = 'resetCube' | 'scrambleCube' | 'undoMove'

export type ViewActionId =
  | 'rotateViewUp'
  | 'rotateViewDown'
  | 'rotateViewLeft'
  | 'rotateViewRight'
  | 'rollViewClockwise'
  | 'rollViewCounterClockwise'

export type PeekActionId =
  | 'startPeekRight'
  | 'startPeekLeft'
  | 'stopPeekRight'
  | 'stopPeekLeft'
  | 'clearPeek'

export type WideModifierActionId =
  | 'startWideTurnModifier'
  | 'stopWideTurnModifier'
  | 'clearWideTurnModifier'

export type ActionId =
  | TurnActionId
  | ViewActionId
  | PeekActionId
  | UtilityActionId

export type CubeAction =
  | {
      readonly id: TurnActionId
      readonly direction: Direction
      readonly layers?: MoveLayers
      readonly startedAt?: number
      readonly animationDurationMs?: number
    }
  | {
      readonly id: ViewActionId
      readonly startedAt?: number
      readonly animationDurationMs?: number
    }
  | {
      readonly id: PeekActionId | UtilityActionId
    }
  | {
      readonly id: WideModifierActionId
    }

export interface KeyBinding {
  readonly key: string
  readonly actionId: ActionId
  readonly keyUpActionId?: ActionId
  readonly label: string
}

const VIEW_ACTION_TO_FACE_KEY = {
  turnViewUp: 'up',
  turnViewDown: 'down',
  turnViewLeft: 'left',
  turnViewRight: 'right',
  turnViewFront: 'front',
  turnViewBack: 'back',
} as const satisfies Record<TurnActionId, keyof ReturnType<typeof getViewFaces>>

export function isTurnActionId(actionId: ActionId): actionId is TurnActionId {
  return actionId in VIEW_ACTION_TO_FACE_KEY
}

export function isViewActionId(actionId: string): actionId is ViewActionId {
  return [
    'rotateViewUp',
    'rotateViewDown',
    'rotateViewLeft',
    'rotateViewRight',
    'rollViewClockwise',
    'rollViewCounterClockwise',
  ].includes(actionId)
}

export function getFaceForViewAction(
  viewOrientation: ViewOrientation,
  actionId: TurnActionId,
): Face {
  const viewFaces = getViewFaces(viewOrientation)
  return viewFaces[VIEW_ACTION_TO_FACE_KEY[actionId]]
}

export function formatMoveLabel(
  face: Face,
  direction: Direction,
  layers: MoveLayers = 1,
): string {
  const base = layers === 2 ? `${face}w` : face
  return direction === 1 ? base : `${base}'`
}

export function formatViewActionLabel(action: ViewActionId): string {
  const labels: Record<ViewActionId, string> = {
    rotateViewUp: 'View up',
    rotateViewDown: 'View down',
    rotateViewLeft: 'View left',
    rotateViewRight: 'View right',
    rollViewClockwise: 'Roll clockwise',
    rollViewCounterClockwise: 'Roll counterclockwise',
  }
  return labels[action]
}

export function shouldPreventDefault(action: CubeAction | null): boolean {
  return action !== null
}
