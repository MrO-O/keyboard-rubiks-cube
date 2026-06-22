import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { createSolvedCube, type CubeMove } from '../cube/model'
import { INITIAL_VIEW } from '../cube/view'
import {
  SettingsProvider,
  createDefaultSettings,
  rebindAction,
  type AppSettings,
} from '../settings'

const gameMock = {
  state: {
    cubeState: createSolvedCube(),
    viewOrientation: INITIAL_VIEW,
    peekDirection: null,
    activeTurnAnimation: null,
    pendingTurn: null as CubeMove | null,
    wideTurnModifierActive: false,
    moveHistory: [] as { move: CubeMove; label: string }[],
    lastActionLabel: 'Ready',
    isSolved: true,
  },
}

vi.mock('../cube/render', () => ({
  CubeScene: (props: {
    cubeState: { cubies: readonly unknown[] }
    viewOrientation: { up: string; front: string }
    peekDirection: string | null
    activeTurnAnimation: null
  }) => (
    <div>
      Mock cube scene: {props.cubeState.cubies.length} cubies,{' '}
      {props.viewOrientation.up}/{props.viewOrientation.front}
      {props.peekDirection ?? 'none'}
    </div>
  ),
}))

import { PlayPage } from './PlayPage'

function renderPlay(settings = createDefaultSettings()) {
  return renderToStaticMarkup(
    <SettingsProvider initialSettings={settings}>
      <PlayPage
        game={{
          state: gameMock.state,
          dispatch: vi.fn(),
          completeTurnAnimation: vi.fn(),
          clearSavedGame: vi.fn(),
        }}
        onOpenSettings={vi.fn()}
      />
    </SettingsProvider>,
  )
}

describe('PlayPage', () => {
  it('renders the keyboard instructions and game status', () => {
    const markup = renderPlay()

    expect(markup).toContain('Keyboard Rubik&#x27;s Cube')
    expect(markup).toContain('Game autosaved locally')
    expect(markup).toContain('Move count:')
    expect(markup).toContain('Solved:')
    expect(markup).toContain('K: turn front face')
    expect(markup).toContain('Shift + U/I/H/J/K/L')
    expect(markup).toContain('Hold ; + U/I/H/J/K/L')
    expect(markup).toContain('W: rotate view up')
    expect(markup).toContain('Space: roll current front clockwise')
    expect(markup).toContain('View orientation')
    expect(markup).toContain('Up:')
    expect(markup).toContain('Front:')
    expect(markup).toContain('Back:')
    expect(markup).toContain('Hold Q: peek right side')
    expect(markup).toContain('Hold E: peek left side')
    expect(markup).toContain('Peek:')
    expect(markup).toContain('none')
    expect(markup).toContain('Turning:')
    expect(markup).toContain('idle')
    expect(markup).toContain('Buffered:')
    expect(markup).toContain('none')
    expect(markup).toContain('Settings')
  })

  it('renders the buffered physical move', () => {
    gameMock.state.pendingTurn = { face: 'R', direction: -1, layers: 2 }

    const markup = renderPlay()

    expect(markup).toContain('Buffered:')
    expect(markup).toContain('Rw&#x27;')
    gameMock.state.pendingTurn = null
  })

  it('renders wide notation in move history', () => {
    gameMock.state.moveHistory = [
      { move: { face: 'U', direction: 1, layers: 2 }, label: 'Uw' },
      { move: { face: 'F', direction: -1, layers: 2 }, label: "Fw'" },
    ]
    const markup = renderPlay()
    expect(markup).toContain('Uw')
    expect(markup).toContain('Fw&#x27;')
    gameMock.state.moveHistory = []
  })

  it('renders the current custom keymap', () => {
    const defaults = createDefaultSettings()
    const result = rebindAction(defaults.keymap, 'turnViewFront', 'P')
    if (!result.ok) throw new Error(result.error)
    const settings: AppSettings = { ...defaults, keymap: result.keymap }

    const markup = renderPlay(settings)

    expect(markup).toContain('P: turn front face')
    expect(markup).not.toContain('K: turn front face')
  })

  it('renders the custom wide modifier', () => {
    const settings: AppSettings = {
      ...createDefaultSettings(),
      wideTurnModifierKey: 'G',
    }
    const markup = renderPlay(settings)
    expect(markup).toContain('Hold G + U/I/H/J/K/L')
    expect(markup).not.toContain('Hold ; + U/I/H/J/K/L')
  })
})
