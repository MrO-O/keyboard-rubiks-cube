import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { createSolvedCube, serializeCube } from '../cube/model'

vi.mock('../cube/render', () => ({
  CubeScene: (props: { cubeState: { cubies: readonly unknown[] } }) => (
    <div>Mock cube scene: {props.cubeState.cubies.length} cubies</div>
  ),
}))

import { PlayPage, reducePlayPageCubeState } from './PlayPage'

describe('PlayPage', () => {
  it('renders the basic title and stage description', () => {
    const markup = renderToStaticMarkup(<PlayPage />)

    expect(markup).toContain('Keyboard Rubik&#x27;s Cube')
    expect(markup).toContain('Stage 2: static 3D cube renderer')
    expect(markup).toContain('Cubies rendered: 26')
  })

  it('changes serialized CubeState after Apply F', () => {
    const solved = createSolvedCube()
    const moved = reducePlayPageCubeState(solved, { type: 'move', face: 'F' })

    expect(serializeCube(moved)).not.toBe(serializeCube(solved))
  })

  it('resets CubeState back to solved', () => {
    const solved = createSolvedCube()
    const moved = reducePlayPageCubeState(solved, { type: 'move', face: 'F' })
    const reset = reducePlayPageCubeState(moved, { type: 'reset' })

    expect(serializeCube(reset)).toBe(serializeCube(solved))
  })
})
