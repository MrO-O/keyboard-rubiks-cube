import type { CubeAction, KeyBinding } from './actions'
import { isTurnActionId } from './actions'
import { DEFAULT_KEYMAP } from './defaultKeymap'

export interface KeyboardActionEvent {
  readonly key: string
  readonly shiftKey?: boolean
  readonly ctrlKey?: boolean
  readonly metaKey?: boolean
  readonly altKey?: boolean
}

export type KeyboardEventType = 'keydown' | 'keyup'

export function keyToAction(
  event: KeyboardActionEvent,
  eventType: KeyboardEventType = 'keydown',
  keymap: readonly KeyBinding[] = DEFAULT_KEYMAP,
): CubeAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null

  const key = normalizeBindingKey(event.key)
  const binding = keymap.find((candidate) => candidate.key === key)
  if (!binding) return null

  const actionId =
    eventType === 'keydown' ? binding.actionId : binding.keyUpActionId
  if (!actionId) return null

  if (isTurnActionId(actionId)) {
    return {
      id: actionId,
      direction: event.shiftKey ? -1 : 1,
    }
  }

  return { id: actionId }
}

export function normalizeBindingKey(key: string): string {
  if (key === 'Space' || key === 'Spacebar') return ' '
  return key.toUpperCase()
}
