import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SettingsProvider } from '../settings'
import { SettingsPage } from './SettingsPage'

describe('SettingsPage', () => {
  it('shows key bindings, speed choices, and restore controls', () => {
    const markup = renderToStaticMarkup(
      <SettingsProvider>
        <SettingsPage onBack={vi.fn()} onClearSavedGame={vi.fn()} />
      </SettingsProvider>,
    )

    expect(markup).toContain('Settings')
    expect(markup).toContain('Turn front face')
    expect(markup).toContain('>K<')
    expect(markup).toContain('Animation speed')
    expect(markup).toContain('Fast')
    expect(markup).toContain('Normal')
    expect(markup).toContain('Slow')
    expect(markup).toContain('Restore defaults')
    expect(markup).toContain('Game data')
    expect(markup).toContain('Game state is saved locally in this browser')
    expect(markup).toContain('Settings and game state are stored separately')
    expect(markup).toContain('Clear saved game')
    expect(markup).toContain('Back to play')
  })
})
