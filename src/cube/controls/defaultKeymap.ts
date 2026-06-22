import type { KeyBinding } from './actions'

export const DEFAULT_WIDE_TURN_MODIFIER_KEY = ';'

const ACTION_DESCRIPTIONS: Readonly<Record<KeyBinding['actionId'], string>> = {
  turnViewUp: 'turn top face',
  turnViewDown: 'turn bottom face',
  turnViewLeft: 'turn left face',
  turnViewRight: 'turn right face',
  turnViewFront: 'turn front face',
  turnViewBack: 'turn back face',
  rotateViewUp: 'rotate view up',
  rotateViewDown: 'rotate view down',
  rotateViewLeft: 'rotate view left',
  rotateViewRight: 'rotate view right',
  rollViewClockwise: 'roll current front clockwise',
  startPeekRight: 'peek right side',
  startPeekLeft: 'peek left side',
  stopPeekRight: 'stop right peek',
  stopPeekLeft: 'stop left peek',
  clearPeek: 'clear peek',
  resetCube: 'reset',
  scrambleCube: 'scramble',
  undoMove: 'undo',
}

export function displayBindingKey(key: string): string {
  return key === ' ' ? 'Space' : key
}

export function formatKeyBindingLabel(binding: KeyBinding): string {
  const key = displayBindingKey(binding.key)
  const prefix =
    binding.actionId === 'startPeekRight' ||
    binding.actionId === 'startPeekLeft'
      ? `Hold ${key}`
      : key
  return `${prefix}: ${ACTION_DESCRIPTIONS[binding.actionId]}`
}

function binding(value: Omit<KeyBinding, 'label'>): KeyBinding {
  return { ...value, label: formatKeyBindingLabel({ ...value, label: '' }) }
}

export const DEFAULT_KEYMAP: readonly KeyBinding[] = [
  binding({ key: 'U', actionId: 'turnViewUp' }),
  binding({ key: 'I', actionId: 'turnViewDown' }),
  binding({ key: 'H', actionId: 'turnViewLeft' }),
  binding({ key: 'J', actionId: 'turnViewRight' }),
  binding({ key: 'K', actionId: 'turnViewFront' }),
  binding({ key: 'L', actionId: 'turnViewBack' }),
  binding({ key: 'W', actionId: 'rotateViewUp' }),
  binding({ key: 'S', actionId: 'rotateViewDown' }),
  binding({ key: 'A', actionId: 'rotateViewLeft' }),
  binding({ key: 'D', actionId: 'rotateViewRight' }),
  binding({
    key: ' ',
    actionId: 'rollViewClockwise',
  }),
  binding({
    key: 'Q',
    actionId: 'startPeekRight',
    keyUpActionId: 'stopPeekRight',
  }),
  binding({
    key: 'E',
    actionId: 'startPeekLeft',
    keyUpActionId: 'stopPeekLeft',
  }),
  binding({ key: 'R', actionId: 'resetCube' }),
  binding({ key: 'X', actionId: 'scrambleCube' }),
  binding({ key: 'Z', actionId: 'undoMove' }),
] as const
