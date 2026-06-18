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

export function keyToAction(
  event: KeyboardActionEvent,
  keymap: readonly KeyBinding[] = DEFAULT_KEYMAP,
): CubeAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null

  const key = normalizeKey(event.key)
  const binding = keymap.find((candidate) => candidate.key === key)
  if (!binding) return null

  if (isTurnActionId(binding.actionId)) {
    return {
      id: binding.actionId,
      direction: event.shiftKey ? -1 : 1,
    }
  }

  return { id: binding.actionId }
}

function normalizeKey(key: string): string {
  if (key === 'Space' || key === 'Spacebar') return ' '
  return key.toUpperCase()
}
