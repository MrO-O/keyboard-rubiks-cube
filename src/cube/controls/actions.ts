import type { Direction, Face } from '../model'
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

export type PeekActionId =
  | 'startPeekRight'
  | 'startPeekLeft'
  | 'stopPeekRight'
  | 'stopPeekLeft'
  | 'clearPeek'

export type ActionId =
  | TurnActionId
  | ViewActionId
  | PeekActionId
  | UtilityActionId

export type CubeAction =
  | {
      readonly id: TurnActionId
      readonly direction: Direction
      readonly startedAt?: number
      readonly animationDurationMs?: number
    }
  | {
      readonly id: ViewActionId | PeekActionId | UtilityActionId
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

export function getFaceForViewAction(
  viewOrientation: ViewOrientation,
  actionId: TurnActionId,
): Face {
  const viewFaces = getViewFaces(viewOrientation)
  return viewFaces[VIEW_ACTION_TO_FACE_KEY[actionId]]
}

export function formatMoveLabel(face: Face, direction: Direction): string {
  return direction === 1 ? face : `${face}'`
}

export function shouldPreventDefault(action: CubeAction | null): boolean {
  return action !== null
}
