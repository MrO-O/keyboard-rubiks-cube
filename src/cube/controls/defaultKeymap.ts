import type { KeyBinding } from './actions'

export const DEFAULT_KEYMAP: readonly KeyBinding[] = [
  { key: 'U', actionId: 'turnViewUp', label: 'U: turn top face' },
  { key: 'I', actionId: 'turnViewDown', label: 'I: turn bottom face' },
  { key: 'H', actionId: 'turnViewLeft', label: 'H: turn left face' },
  { key: 'J', actionId: 'turnViewRight', label: 'J: turn right face' },
  { key: 'K', actionId: 'turnViewFront', label: 'K: turn front face' },
  { key: 'L', actionId: 'turnViewBack', label: 'L: turn back face' },
  { key: 'R', actionId: 'resetCube', label: 'R: reset' },
  { key: 'X', actionId: 'scrambleCube', label: 'X: scramble' },
  { key: 'Z', actionId: 'undoMove', label: 'Z: undo' },
] as const
