import { describe, expect, it, vi } from 'vitest'
import { createSolvedCube, isSolved, serializeCube } from '../model'
import { INITIAL_VIEW, getViewFaces } from '../view'
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
    const rotated = gameReducer(createInitialCubeGameState(), {
      id: 'rotateViewLeft',
    })
    const moved = gameReducer(rotated, {
      id: 'turnViewFront',
      direction: 1,
    })
    const reset = gameReducer(moved, { id: 'resetCube' })

    expect(serializeCube(reset.cubeState)).toBe(serializeCube(createSolvedCube()))
    expect(reset.isSolved).toBe(true)
    expect(reset.moveHistory).toHaveLength(0)
    expect(reset.viewOrientation).toEqual(INITIAL_VIEW)
  })

  it.each([
    'rotateViewUp',
    'rotateViewDown',
    'rotateViewLeft',
    'rotateViewRight',
  ] as const)('%s only changes view orientation', (id) => {
    const initial = createInitialCubeGameState()
    const serialized = serializeCube(initial.cubeState)
    const next = gameReducer(initial, { id })

    expect(next.viewOrientation).not.toEqual(initial.viewOrientation)
    expect(serializeCube(next.cubeState)).toBe(serialized)
    expect(next.moveHistory).toEqual(initial.moveHistory)
  })

  it('rolls the side faces while keeping front fixed', () => {
    const initial = createInitialCubeGameState()
    const rolled = gameReducer(initial, { id: 'rollViewClockwise' })

    expect(rolled.viewOrientation.front).toBe(initial.viewOrientation.front)
    expect(rolled.viewOrientation.up).not.toBe(initial.viewOrientation.up)
    expect(rolled.cubeState).toBe(initial.cubeState)
    expect(rolled.moveHistory).toBe(initial.moveHistory)
  })

  it('returns to the initial orientation after four rolls or left rotations', () => {
    const repeat = (id: 'rollViewClockwise' | 'rotateViewLeft') => {
      let state = createInitialCubeGameState()
      for (let index = 0; index < 4; index += 1) {
        state = gameReducer(state, { id })
      }
      return state
    }

    expect(repeat('rollViewClockwise').viewOrientation).toEqual(INITIAL_VIEW)
    expect(repeat('rotateViewLeft').viewOrientation).toEqual(INITIAL_VIEW)
  })

  it('turns the new physical front after rotating the view', () => {
    const initial = createInitialCubeGameState()
    const rotated = gameReducer(initial, { id: 'rotateViewLeft' })
    const physicalFront = getViewFaces(rotated.viewOrientation).front
    const moved = gameReducer(rotated, {
      id: 'turnViewFront',
      direction: 1,
    })

    expect(physicalFront).not.toBe('F')
    expect(moved.moveHistory[0]?.move.face).toBe(physicalFront)
  })

  it('undoes the last face turn without reverting view orientation', () => {
    const moved = gameReducer(createInitialCubeGameState(), {
      id: 'turnViewFront',
      direction: 1,
    })
    const rotated = gameReducer(moved, { id: 'rotateViewLeft' })
    const undone = gameReducer(rotated, { id: 'undoMove' })

    expect(undone.viewOrientation).toEqual(rotated.viewOrientation)
    expect(serializeCube(undone.cubeState)).toBe(
      serializeCube(createSolvedCube()),
    )
  })

  it('keeps the current view when scrambling', () => {
    const rotated = gameReducer(createInitialCubeGameState(), {
      id: 'rotateViewRight',
    })
    const scrambled = gameReducer(rotated, { id: 'scrambleCube' })

    expect(scrambled.viewOrientation).toEqual(rotated.viewOrientation)
  })

  it.each([
    ['startPeekRight', 'showRight'],
    ['startPeekLeft', 'showLeft'],
  ] as const)('%s sets peekDirection without changing game state', (id, peek) => {
    const initial = createInitialCubeGameState()
    const serialized = serializeCube(initial.cubeState)
    const next = gameReducer(initial, { id })

    expect(next.peekDirection).toBe(peek)
    expect(serializeCube(next.cubeState)).toBe(serialized)
    expect(next.viewOrientation).toEqual(initial.viewOrientation)
    expect(next.moveHistory).toBe(initial.moveHistory)
  })

  it('uses the latest peek key and clears only the active direction', () => {
    const right = gameReducer(createInitialCubeGameState(), {
      id: 'startPeekRight',
    })
    const left = gameReducer(right, { id: 'startPeekLeft' })
    const releaseInactive = gameReducer(left, { id: 'stopPeekRight' })
    const releaseActive = gameReducer(releaseInactive, { id: 'stopPeekLeft' })

    expect(left.peekDirection).toBe('showLeft')
    expect(releaseInactive.peekDirection).toBe('showLeft')
    expect(releaseActive.peekDirection).toBeNull()
  })

  it.each(['showRight', 'showLeft'] as const)(
    'still turns the current physical front while peeking %s',
    (peekDirection) => {
      const rotated = gameReducer(createInitialCubeGameState(), {
        id: 'rotateViewLeft',
      })
      const peeking = gameReducer(rotated, {
        id:
          peekDirection === 'showRight' ? 'startPeekRight' : 'startPeekLeft',
      })
      const moved = gameReducer(peeking, {
        id: 'turnViewFront',
        direction: 1,
      })

      expect(moved.moveHistory[0]?.move.face).toBe(
        getViewFaces(rotated.viewOrientation).front,
      )
      expect(moved.peekDirection).toBe(peekDirection)
    },
  )

  it('reset and scramble clear peek while undo preserves it', () => {
    const moved = gameReducer(createInitialCubeGameState(), {
      id: 'turnViewFront',
      direction: 1,
    })
    const peeking = gameReducer(moved, { id: 'startPeekRight' })

    expect(gameReducer(peeking, { id: 'undoMove' }).peekDirection).toBe(
      'showRight',
    )
    expect(gameReducer(peeking, { id: 'resetCube' }).peekDirection).toBeNull()
    expect(
      gameReducer(peeking, { id: 'scrambleCube' }).peekDirection,
    ).toBeNull()
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
