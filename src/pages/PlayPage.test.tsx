import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

const gameMock = vi.hoisted(() => ({
  state: {
    cubeState: { cubies: Array.from({ length: 26 }, () => ({})) },
    viewOrientation: { up: 'U' as const, front: 'F' as const },
    peekDirection: null,
    activeTurnAnimation: null,
    pendingTurn: null as { face: string; direction: 1 | -1 } | null,
    moveHistory: [],
    lastActionLabel: 'Ready',
    isSolved: true,
  },
}))

vi.mock('../cube/game', () => ({
  useCubeGame: () => ({
    state: gameMock.state,
    dispatch: vi.fn(),
    completeTurnAnimation: vi.fn(),
  }),
}))

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

describe('PlayPage', () => {
  it('renders the keyboard instructions and game status', () => {
    const markup = renderToStaticMarkup(<PlayPage />)

    expect(markup).toContain('Keyboard Rubik&#x27;s Cube')
    expect(markup).toContain('Stage 7: one-turn input buffer')
    expect(markup).toContain('Move count:')
    expect(markup).toContain('Solved:')
    expect(markup).toContain('K: turn front face')
    expect(markup).toContain('Shift + U/I/H/J/K/L')
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
  })

  it('renders the buffered physical move', () => {
    gameMock.state.pendingTurn = { face: 'R', direction: -1 }

    const markup = renderToStaticMarkup(<PlayPage />)

    expect(markup).toContain('Buffered:')
    expect(markup).toContain('R&#x27;')
    gameMock.state.pendingTurn = null
  })
})
