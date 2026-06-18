import {
  DEFAULT_KEYMAP,
  formatKeyBindingLabel,
  normalizeBindingKey,
  type KeyBinding,
} from '../cube/controls'
import type { BindableActionId } from './defaultSettings'
import {
  ALLOWED_ANIMATION_DURATIONS,
  type AppSettings,
  type BindingKeyboardEvent,
} from './types'

const FORBIDDEN_KEYS = new Set([
  'ALT',
  'ALTGRAPH',
  'CONTROL',
  'ESCAPE',
  'META',
  'SHIFT',
])

export type BindingValidationResult =
  | { readonly ok: true; readonly key: string }
  | { readonly ok: false; readonly error: string }

export type RebindResult =
  | { readonly ok: true; readonly keymap: readonly KeyBinding[] }
  | { readonly ok: false; readonly error: string }

export function validateBindingEvent(
  event: BindingKeyboardEvent,
): BindingValidationResult {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return {
      ok: false,
      error: 'Ctrl, Meta, and Alt combinations are not allowed.',
    }
  }

  const key = normalizeBindingKey(event.key)
  if (!key || FORBIDDEN_KEYS.has(key)) {
    return { ok: false, error: `${event.key || 'Empty'} cannot be assigned.` }
  }
  return { ok: true, key }
}

export function rebindAction(
  keymap: readonly KeyBinding[],
  actionId: BindableActionId,
  inputKey: string,
): RebindResult {
  const validation = validateBindingEvent({ key: inputKey })
  if (!validation.ok) return validation

  const conflict = keymap.find(
    (binding) =>
      binding.actionId !== actionId && binding.key === validation.key,
  )
  if (conflict) {
    return {
      ok: false,
      error: `${validation.key === ' ' ? 'Space' : validation.key} is already assigned.`,
    }
  }

  return {
    ok: true,
    keymap: keymap.map((binding) => {
      if (binding.actionId !== actionId) return binding
      const updated = { ...binding, key: validation.key }
      return { ...updated, label: formatKeyBindingLabel(updated) }
    }),
  }
}

export function validateSettings(value: unknown): AppSettings | null {
  if (!isRecord(value)) return null
  if (
    typeof value.animationDurationMs !== 'number' ||
    !ALLOWED_ANIMATION_DURATIONS.includes(
      value.animationDurationMs as (typeof ALLOWED_ANIMATION_DURATIONS)[number],
    )
  ) {
    return null
  }
  if (
    !Array.isArray(value.keymap) ||
    value.keymap.length !== DEFAULT_KEYMAP.length
  ) {
    return null
  }

  const normalized: KeyBinding[] = []
  const usedKeys = new Set<string>()
  for (const template of DEFAULT_KEYMAP) {
    const candidate = value.keymap.find(
      (binding) => isRecord(binding) && binding.actionId === template.actionId,
    )
    if (!isRecord(candidate) || typeof candidate.key !== 'string') return null

    const keyResult = validateBindingEvent({ key: candidate.key })
    if (!keyResult.ok || usedKeys.has(keyResult.key)) return null
    if (candidate.keyUpActionId !== template.keyUpActionId) return null

    usedKeys.add(keyResult.key)
    const binding = { ...template, key: keyResult.key }
    normalized.push({ ...binding, label: formatKeyBindingLabel(binding) })
  }

  return {
    keymap: normalized,
    animationDurationMs:
      value.animationDurationMs as AppSettings['animationDurationMs'],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
