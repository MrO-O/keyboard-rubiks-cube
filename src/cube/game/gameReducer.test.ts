import { describe, expect, it, vi } from 'vitest'
import { createSolvedCube, isSolved, serializeCube } from '../model'
import { createInitialCubeGameState, gameReducer } from './gameReducer'

describe('cube game reducer', () => {
  it('changes serialized CubeState after a keyboard turn', () => {
    const initial = createInitialCubeGameState()
    const next = gameReducer(initial, { id: 'turnViewFront', direction: 1 })

    expect(serializeCube(next.cubeState)).not.toBe(
      serializeCube(initial.cubeState),
    )
  })

  it('records user moves in history', () => {
    const next = gameReducer(createInitialCubeGameState(), {
      id: 'turnViewFront',
      direction: 1,
    })

    expect(next.moveHistory).toHaveLength(1)
    expect(next.moveHistory[0]?.move).toEqual({ face: 'F', direction: 1 })
  })

  it('undoMove returns to the previous state', () => {
    const initial = createInitialCubeGameState()
    const moved = gameReducer(initial, { id: 'turnViewFront', direction: 1 })
    const undone = gameReducer(moved, { id: 'undoMove' })

    expect(serializeCube(undone.cubeState)).toBe(
      serializeCube(initial.cubeState),
    )
    expect(undone.moveHistory).toHaveLength(0)
  })

  it('resetCube returns to solved and clears history', () => {
    const moved = gameReducer(createInitialCubeGameState(), {
      id: 'turnViewFront',
      direction: 1,
    })
    const reset = gameReducer(moved, { id: 'resetCube' })

    expect(serializeCube(reset.cubeState)).toBe(serializeCube(createSolvedCube()))
    expect(reset.isSolved).toBe(true)
    expect(reset.moveHistory).toHaveLength(0)
  })

  it('scrambleCube usually creates an unsolved cube and clears move history', () => {
    let index = 0
    const values = [0.01, 0.25, 0.21, 0.75, 0.41, 0.25, 0.61, 0.75]
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const value = values[index % values.length] ?? 0.01
      index += 1
      return value
    })

    const moved = gameReducer(createInitialCubeGameState(), {
      id: 'turnViewFront',
      direction: 1,
    })
    const scrambled = gameReducer(moved, { id: 'scrambleCube' })

    expect(isSolved(scrambled.cubeState)).toBe(false)
    expect(scrambled.moveHistory).toHaveLength(0)

    vi.restoreAllMocks()
  })
})
