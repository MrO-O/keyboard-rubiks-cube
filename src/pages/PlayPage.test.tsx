import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../cube/render', () => ({
  CubeScene: (props: { cubeState: { cubies: readonly unknown[] } }) => (
    <div>Mock cube scene: {props.cubeState.cubies.length} cubies</div>
  ),
}))

import { PlayPage } from './PlayPage'

describe('PlayPage', () => {
  it('renders the keyboard instructions and game status', () => {
    const markup = renderToStaticMarkup(<PlayPage />)

    expect(markup).toContain('Keyboard Rubik&#x27;s Cube')
    expect(markup).toContain('Stage 3: keyboard turns')
    expect(markup).toContain('Move count:')
    expect(markup).toContain('Solved:')
    expect(markup).toContain('K: turn front face')
    expect(markup).toContain('Shift + U/I/H/J/K/L')
  })
})
