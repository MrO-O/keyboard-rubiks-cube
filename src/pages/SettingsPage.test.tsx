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
    expect(markup).toContain('Wide turn modifier')
    expect(markup).toContain('>;<')
    expect(markup).toContain('Game data')
    expect(markup).toContain(
      'This app stores game state and settings locally in this browser',
    )
    expect(markup).toContain('Installing as a PWA does not create cloud sync')
    expect(markup).toContain(
      'Clearing browser data may remove saved game state and settings',
    )
    expect(markup).toContain('Clear saved game')
    expect(markup).toContain('Back to play')
  })
})
