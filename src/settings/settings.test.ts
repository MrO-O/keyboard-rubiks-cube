import { describe, expect, it } from 'vitest'
import { keyToAction } from '../cube/controls'
import {
  ALLOWED_ANIMATION_DURATIONS,
  SETTINGS_STORAGE_KEY,
  createDefaultSettings,
  displayBindingKey,
  loadSettings,
  rebindAction,
  resetSettings,
  saveSettings,
  validateBindingEvent,
  validateSettings,
} from './index'

class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

describe('settings storage and validation', () => {
  it('loads defaults when storage is empty', () => {
    expect(loadSettings(new MemoryStorage())).toEqual(createDefaultSettings())
  })

  it('loads valid stored settings', () => {
    const storage = new MemoryStorage()
    const defaults = createDefaultSettings()
    const rebound = rebindAction(defaults.keymap, 'turnViewFront', 'P')
    expect(rebound.ok).toBe(true)
    const custom = {
      keymap: rebound.ok ? rebound.keymap : defaults.keymap,
      animationDurationMs: 260 as const,
    }
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(custom))

    expect(loadSettings(storage)).toEqual(custom)
  })

  it.each(['{broken', JSON.stringify({ keymap: [] })])(
    'falls back for invalid stored data: %s',
    (stored) => {
      const storage = new MemoryStorage()
      storage.setItem(SETTINGS_STORAGE_KEY, stored)

      expect(loadSettings(storage)).toEqual(createDefaultSettings())
    },
  )

  it('saves and resets settings', () => {
    const storage = new MemoryStorage()
    const settings = {
      ...createDefaultSettings(),
      animationDurationMs: 120 as const,
    }

    saveSettings(settings, storage)
    expect(JSON.parse(storage.getItem(SETTINGS_STORAGE_KEY)!)).toEqual(settings)

    expect(resetSettings(storage)).toEqual(createDefaultSettings())
    expect(loadSettings(storage)).toEqual(createDefaultSettings())
  })

  it('detects duplicate bindings', () => {
    const settings = createDefaultSettings()
    const duplicate = settings.keymap.map((binding) =>
      binding.actionId === 'turnViewFront' ? { ...binding, key: 'U' } : binding,
    )

    expect(validateSettings({ ...settings, keymap: duplicate })).toBeNull()
    expect(rebindAction(settings.keymap, 'turnViewFront', 'U')).toMatchObject({
      ok: false,
      error: expect.stringContaining('already'),
    })
  })

  it.each([
    { key: 'P', ctrlKey: true },
    { key: 'P', metaKey: true },
    { key: 'P', altKey: true },
    { key: 'Escape' },
    { key: 'Shift' },
  ])('rejects unsupported binding input', (event) => {
    expect(validateBindingEvent(event).ok).toBe(false)
  })

  it('accepts and displays Space', () => {
    expect(validateBindingEvent({ key: ' ' })).toEqual({ ok: true, key: ' ' })
    expect(displayBindingKey(' ')).toBe('Space')
  })

  it('only permits configured animation durations', () => {
    const defaults = createDefaultSettings()
    for (const duration of ALLOWED_ANIMATION_DURATIONS) {
      expect(
        validateSettings({ ...defaults, animationDurationMs: duration }),
      ).not.toBeNull()
    }
    expect(
      validateSettings({ ...defaults, animationDurationMs: 181 }),
    ).toBeNull()
  })
})

describe('custom controls integration', () => {
  it('uses a rebound front key and stops using the old key', () => {
    const result = rebindAction(
      createDefaultSettings().keymap,
      'turnViewFront',
      'P',
    )
    if (!result.ok) throw new Error(result.error)

    expect(keyToAction({ key: 'P' }, 'keydown', result.keymap)).toEqual({
      id: 'turnViewFront',
      direction: 1,
    })
    expect(keyToAction({ key: 'K' }, 'keydown', result.keymap)).toBeNull()
    expect(
      keyToAction({ key: 'P', ctrlKey: true }, 'keydown', result.keymap),
    ).toBeNull()
  })

  it('uses a custom peek binding for keydown and keyup', () => {
    const result = rebindAction(
      createDefaultSettings().keymap,
      'startPeekRight',
      'O',
    )
    if (!result.ok) throw new Error(result.error)

    expect(keyToAction({ key: 'O' }, 'keydown', result.keymap)).toEqual({
      id: 'startPeekRight',
    })
    expect(keyToAction({ key: 'O' }, 'keyup', result.keymap)).toEqual({
      id: 'stopPeekRight',
    })
  })
})
