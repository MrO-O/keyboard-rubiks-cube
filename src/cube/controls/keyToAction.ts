import type { CubeAction, KeyBinding } from './actions'
import { isTurnActionId } from './actions'
import {
  DEFAULT_KEYMAP,
  DEFAULT_WIDE_TURN_MODIFIER_KEY,
} from './defaultKeymap'

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
  wideTurnModifierKey = DEFAULT_WIDE_TURN_MODIFIER_KEY,
  wideTurnModifierActive = false,
): CubeAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null

  const key = normalizeBindingKey(event.key)
  if (key === normalizeBindingKey(wideTurnModifierKey)) {
    return {
      id:
        eventType === 'keydown'
          ? 'startWideTurnModifier'
          : 'stopWideTurnModifier',
    }
  }
  const binding = keymap.find((candidate) => candidate.key === key)
  if (!binding) return null

  const actionId =
    eventType === 'keydown' ? binding.actionId : binding.keyUpActionId
  if (!actionId) return null

  if (isTurnActionId(actionId)) {
    return {
      id: actionId,
      direction: event.shiftKey ? -1 : 1,
      layers: wideTurnModifierActive ? 2 : 1,
    }
  }

  return { id: actionId }
}

export function normalizeBindingKey(key: string): string {
  if (key === 'Space' || key === 'Spacebar') return ' '
  return key.toUpperCase()
}
