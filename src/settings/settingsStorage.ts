import { createDefaultSettings } from './defaultSettings'
import type { AppSettings, SettingsStorage } from './types'
import { validateSettings } from './validateSettings'

export const SETTINGS_STORAGE_KEY = 'keyboard-rubiks-cube.settings.v1'

export function loadSettings(storage?: SettingsStorage | null): AppSettings {
  try {
    const target = storage ?? getBrowserStorage()
    if (!target) return createDefaultSettings()
    const stored = target.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return createDefaultSettings()
    return validateSettings(JSON.parse(stored)) ?? createDefaultSettings()
  } catch {
    return createDefaultSettings()
  }
}

export function saveSettings(
  settings: AppSettings,
  storage?: SettingsStorage | null,
): void {
  const valid = validateSettings(settings)
  if (!valid) throw new Error('Cannot save invalid settings.')
  try {
    const target = storage ?? getBrowserStorage()
    target?.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(valid))
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function resetSettings(storage?: SettingsStorage | null): AppSettings {
  const settings = createDefaultSettings()
  saveSettings(settings, storage)
  return settings
}

function getBrowserStorage(): SettingsStorage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}
