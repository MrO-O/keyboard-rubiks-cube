import type { KeyBinding } from './actions'

export const DEFAULT_KEYMAP: readonly KeyBinding[] = [
  { key: 'U', actionId: 'turnViewUp', label: 'U: turn top face' },
  { key: 'I', actionId: 'turnViewDown', label: 'I: turn bottom face' },
  { key: 'H', actionId: 'turnViewLeft', label: 'H: turn left face' },
  { key: 'J', actionId: 'turnViewRight', label: 'J: turn right face' },
  { key: 'K', actionId: 'turnViewFront', label: 'K: turn front face' },
  { key: 'L', actionId: 'turnViewBack', label: 'L: turn back face' },
  { key: 'W', actionId: 'rotateViewUp', label: 'W: rotate view up' },
  { key: 'S', actionId: 'rotateViewDown', label: 'S: rotate view down' },
  { key: 'A', actionId: 'rotateViewLeft', label: 'A: rotate view left' },
  { key: 'D', actionId: 'rotateViewRight', label: 'D: rotate view right' },
  {
    key: ' ',
    actionId: 'rollViewClockwise',
    label: 'Space: roll current front clockwise',
  },
  {
    key: 'Q',
    actionId: 'startPeekRight',
    keyUpActionId: 'stopPeekRight',
    label: 'Hold Q: peek right side',
  },
  {
    key: 'E',
    actionId: 'startPeekLeft',
    keyUpActionId: 'stopPeekLeft',
    label: 'Hold E: peek left side',
  },
  { key: 'R', actionId: 'resetCube', label: 'R: reset' },
  { key: 'X', actionId: 'scrambleCube', label: 'X: scramble' },
  { key: 'Z', actionId: 'undoMove', label: 'Z: undo' },
] as const
