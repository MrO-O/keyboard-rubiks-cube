import { useEffect, useState } from 'react'
import {
  ACTION_TITLES,
  ALLOWED_ANIMATION_DURATIONS,
  displayBindingKey,
  rebindAction,
  rebindWideTurnModifier,
  useSettings,
  validateBindingEvent,
  type AnimationDurationMs,
  type BindableActionId,
} from '../settings'

interface SettingsPageProps {
  readonly onBack: () => void
  readonly onClearSavedGame: () => void
}

const SPEED_LABELS: Readonly<Record<AnimationDurationMs, string>> = {
  120: 'Fast',
  180: 'Normal',
  260: 'Slow',
}

export function SettingsPage({
  onBack,
  onClearSavedGame,
}: SettingsPageProps) {
  const { settings, updateSettings, restoreDefaults } = useSettings()
  const [editingAction, setEditingAction] = useState<
    BindableActionId | 'wideTurnModifier' | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const rollBinding = settings.keymap.find(
    (binding) => binding.actionId === 'rollViewClockwise',
  )

  useEffect(() => {
    if (!editingAction) return

    function handleKeyDown(event: KeyboardEvent) {
      event.preventDefault()
      if (event.key === 'Escape') {
        setEditingAction(null)
        setError(null)
        return
      }

      const validation = validateBindingEvent(event)
      if (!validation.ok) {
        setError(validation.error)
        return
      }

      if (editingAction === 'wideTurnModifier') {
        const result = rebindWideTurnModifier(
          settings.keymap,
          validation.key,
        )
        if (!result.ok) {
          setError(result.error)
          return
        }
        updateSettings({ ...settings, wideTurnModifierKey: result.key })
        setEditingAction(null)
        setError(null)
        return
      }

      const result = rebindAction(
        settings.keymap,
        editingAction!,
        validation.key,
        settings.wideTurnModifierKey,
      )
      if (!result.ok) {
        setError(result.error)
        return
      }

      updateSettings({ ...settings, keymap: result.keymap })
      setEditingAction(null)
      setError(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingAction, settings, updateSettings])

  function updateAnimationDuration(duration: AnimationDurationMs) {
    updateSettings({ ...settings, animationDurationMs: duration })
  }

  function restore() {
    restoreDefaults()
    setEditingAction(null)
    setError(null)
  }

  return (
    <main className="settings-page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Browser-local controls and turn timing.</p>
        </div>
        <p>
          Shift + {displayBindingKey(rollBinding?.key ?? ' ')} rolls the current
          front counterclockwise.
        </p>
        <button onClick={onBack}>Back to play</button>
      </header>

      <section className="settings-section" aria-labelledby="keybindings-title">
        <h2 id="keybindings-title">Key bindings</h2>
        <div className="binding-list">
          <div className="binding-row">
            <span>Wide turn modifier</span>
            <kbd>{displayBindingKey(settings.wideTurnModifierKey)}</kbd>
            {editingAction === 'wideTurnModifier' ? (
              <div className="binding-actions">
                <span className="capture-status">Press a key</span>
                <button
                  onClick={() => {
                    setEditingAction(null)
                    setError(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingAction('wideTurnModifier')
                  setError(null)
                }}
              >
                Change
              </button>
            )}
          </div>
          {settings.keymap.map((binding) => {
            const actionId = binding.actionId as BindableActionId
            const isEditing = editingAction === actionId
            return (
              <div className="binding-row" key={actionId}>
                <span>{ACTION_TITLES[actionId]}</span>
                <kbd>{displayBindingKey(binding.key)}</kbd>
                {isEditing ? (
                  <div className="binding-actions">
                    <span className="capture-status">Press a key</span>
                    <button
                      onClick={() => {
                        setEditingAction(null)
                        setError(null)
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingAction(actionId)
                      setError(null)
                    }}
                  >
                    Change
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {error ? (
          <p className="settings-error" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <fieldset className="settings-section speed-settings">
        <legend>Animation speed</legend>
        {ALLOWED_ANIMATION_DURATIONS.map((duration) => (
          <label key={duration}>
            <input
              checked={settings.animationDurationMs === duration}
              name="animation-speed"
              onChange={() => updateAnimationDuration(duration)}
              type="radio"
            />
            <span>{SPEED_LABELS[duration]}</span>
            <small>{duration}ms</small>
          </label>
        ))}
      </fieldset>

      <section className="settings-section settings-reset">
        <h2>Defaults</h2>
        <button onClick={restore}>Restore defaults</button>
      </section>

      <section className="settings-section settings-reset">
        <h2>Game data</h2>
        <p>This app stores game state and settings locally in this browser.</p>
        <p>Installing as a PWA does not create cloud sync.</p>
        <p>Clearing browser data may remove saved game state and settings.</p>
        <button onClick={onClearSavedGame}>Clear saved game</button>
      </section>
    </main>
  )
}
