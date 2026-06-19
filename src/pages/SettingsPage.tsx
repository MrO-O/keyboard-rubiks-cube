import { useEffect, useState } from 'react'
import {
  ACTION_TITLES,
  ALLOWED_ANIMATION_DURATIONS,
  displayBindingKey,
  rebindAction,
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
  const [editingAction, setEditingAction] = useState<BindableActionId | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

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

      const result = rebindAction(
        settings.keymap,
        editingAction!,
        validation.key,
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
        <button onClick={onBack}>Back to play</button>
      </header>

      <section className="settings-section" aria-labelledby="keybindings-title">
        <h2 id="keybindings-title">Key bindings</h2>
        <div className="binding-list">
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
        <p>Game state is saved locally in this browser.</p>
        <p>Clearing browser data may delete the saved cube state.</p>
        <p>Settings and game state are stored separately.</p>
        <button onClick={onClearSavedGame}>Clear saved game</button>
      </section>
    </main>
  )
}
