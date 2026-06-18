import type { KeyBinding } from '../cube/controls'

export const ALLOWED_ANIMATION_DURATIONS = [120, 180, 260] as const
export type AnimationDurationMs = (typeof ALLOWED_ANIMATION_DURATIONS)[number]

export interface AppSettings {
  readonly keymap: readonly KeyBinding[]
  readonly animationDurationMs: AnimationDurationMs
}

export interface SettingsStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface BindingKeyboardEvent {
  readonly key: string
  readonly ctrlKey?: boolean
  readonly metaKey?: boolean
  readonly altKey?: boolean
}
