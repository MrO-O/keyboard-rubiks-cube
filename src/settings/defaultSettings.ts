import { DEFAULT_KEYMAP, type ActionId } from '../cube/controls'
import type { AppSettings } from './types'

export type BindableActionId = Exclude<
  ActionId,
  'stopPeekRight' | 'stopPeekLeft' | 'clearPeek'
>

export const ACTION_TITLES: Readonly<Record<BindableActionId, string>> = {
  turnViewUp: 'Turn top face',
  turnViewDown: 'Turn bottom face',
  turnViewLeft: 'Turn left face',
  turnViewRight: 'Turn right face',
  turnViewFront: 'Turn front face',
  turnViewBack: 'Turn back face',
  rotateViewUp: 'Rotate view up',
  rotateViewDown: 'Rotate view down',
  rotateViewLeft: 'Rotate view left',
  rotateViewRight: 'Rotate view right',
  rollViewClockwise: 'Roll current front',
  startPeekRight: 'Peek right side',
  startPeekLeft: 'Peek left side',
  resetCube: 'Reset cube',
  scrambleCube: 'Scramble cube',
  undoMove: 'Undo move',
}

export function createDefaultSettings(): AppSettings {
  return {
    keymap: DEFAULT_KEYMAP.map((binding) => ({ ...binding })),
    animationDurationMs: 180,
  }
}
