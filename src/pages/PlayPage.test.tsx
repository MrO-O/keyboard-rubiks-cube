import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../cube/render', () => ({
  CubeScene: (props: {
    cubeState: { cubies: readonly unknown[] }
    viewOrientation: { up: string; front: string }
  }) => (
    <div>
      Mock cube scene: {props.cubeState.cubies.length} cubies,{' '}
      {props.viewOrientation.up}/{props.viewOrientation.front}
    </div>
  ),
}))

import { PlayPage } from './PlayPage'

describe('PlayPage', () => {
  it('renders the keyboard instructions and game status', () => {
    const markup = renderToStaticMarkup(<PlayPage />)

    expect(markup).toContain('Keyboard Rubik&#x27;s Cube')
    expect(markup).toContain('Stage 4: view controls')
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
  })
})
