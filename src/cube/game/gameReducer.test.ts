import { describe, expect, it, vi } from 'vitest'
import { applyMove, createSolvedCube, isSolved, serializeCube } from '../model'
import { INITIAL_VIEW, getViewFaces } from '../view'
import { createInitialCubeGameState, gameReducer } from './gameReducer'
import type { CubeGameState } from './gameTypes'

function startFrontTurn(state = createInitialCubeGameState(), startedAt = 100) {
  return gameReducer(state, {
    id: 'turnViewFront',
    direction: 1,
    startedAt,
  })
}

function completeTurn(
  state: CubeGameState,
  completedAt?: number,
  nextAnimationDurationMs = 180,
): CubeGameState {
  const startedAt = state.activeTurnAnimation?.startedAt
  if (startedAt === undefined) throw new Error('Expected an active animation')
  return gameReducer(state, {
    id: 'completeFaceTurnAnimation',
    startedAt,
    completedAt: completedAt ?? startedAt + 180,
    nextAnimationDurationMs,
  })
}

describe('cube game reducer', () => {
  it('creates an animation while keeping CubeState at fromState', () => {
    const initial = createInitialCubeGameState()
    const next = startFrontTurn(initial)

    expect(next.activeTurnAnimation).toMatchObject({
      move: { face: 'F', direction: 1 },
      fromState: initial.cubeState,
      startedAt: 100,
    })
    expect(serializeCube(next.cubeState)).toBe(serializeCube(initial.cubeState))
    expect(serializeCube(next.activeTurnAnimation!.toState)).not.toBe(
      serializeCube(initial.cubeState),
    )
    expect(serializeCube(next.activeTurnAnimation!.toState)).toBe(
      serializeCube(applyMove(initial.cubeState, { face: 'F', direction: 1 })),
    )
    expect(next.moveHistory).toHaveLength(0)
  })

  it('commits CubeState and history only when animation completes', () => {
    const active = startFrontTurn()
    const next = completeTurn(active)

    expect(serializeCube(next.cubeState)).toBe(
      serializeCube(active.activeTurnAnimation!.toState),
    )
    expect(next.activeTurnAnimation).toBeNull()
    expect(next.moveHistory).toHaveLength(1)
    expect(next.moveHistory[0]?.move).toEqual({ face: 'F', direction: 1 })
  })

  it('undoMove returns to the previous state', () => {
    const initial = createInitialCubeGameState()
    const moved = completeTurn(startFrontTurn(initial))
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
      startedAt: 100,
    })
    const reset = gameReducer(moved, { id: 'resetCube' })

    expect(serializeCube(reset.cubeState)).toBe(
      serializeCube(createSolvedCube()),
    )
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
    expect(moved.activeTurnAnimation?.move.face).toBe(physicalFront)
  })

  it('undoes the last face turn without reverting view orientation', () => {
    const moved = completeTurn(startFrontTurn())
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
  ] as const)(
    '%s sets peekDirection without changing game state',
    (id, peek) => {
      const initial = createInitialCubeGameState()
      const serialized = serializeCube(initial.cubeState)
      const next = gameReducer(initial, { id })

      expect(next.peekDirection).toBe(peek)
      expect(serializeCube(next.cubeState)).toBe(serialized)
      expect(next.viewOrientation).toEqual(initial.viewOrientation)
      expect(next.moveHistory).toBe(initial.moveHistory)
    },
  )

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
        id: peekDirection === 'showRight' ? 'startPeekRight' : 'startPeekLeft',
      })
      const moved = gameReducer(peeking, {
        id: 'turnViewFront',
        direction: 1,
        startedAt: 100,
      })

      expect(moved.activeTurnAnimation?.move.face).toBe(
        getViewFaces(rotated.viewOrientation).front,
      )
      expect(moved.peekDirection).toBe(peekDirection)
    },
  )

  it('reset and scramble clear peek while undo preserves it', () => {
    const moved = completeTurn(startFrontTurn())
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

    const moved = completeTurn(startFrontTurn())
    const scrambled = gameReducer(moved, { id: 'scrambleCube' })

    expect(isSolved(scrambled.cubeState)).toBe(false)
    expect(scrambled.moveHistory).toHaveLength(0)

    vi.restoreAllMocks()
  })

  it('buffers the latest concrete face turn without committing it', () => {
    const active = startFrontTurn()
    const first = gameReducer(active, {
      id: 'turnViewRight',
      direction: 1,
      startedAt: 101,
    })
    const latest = gameReducer(first, {
      id: 'turnViewUp',
      direction: -1,
      startedAt: 102,
    })

    expect(first.pendingTurn).toEqual({ face: 'R', direction: 1 })
    expect(latest.pendingTurn).toEqual({ face: 'U', direction: -1 })
    expect(latest.cubeState).toBe(active.cubeState)
    expect(latest.moveHistory).toHaveLength(0)
  })

  it('resolves a buffered turn against viewOrientation at keydown time', () => {
    const rotated = gameReducer(createInitialCubeGameState(), {
      id: 'rotateViewLeft',
    })
    const active = gameReducer(rotated, {
      id: 'turnViewUp',
      direction: 1,
      startedAt: 100,
    })
    const buffered = gameReducer(active, {
      id: 'turnViewFront',
      direction: -1,
      startedAt: 101,
    })

    expect(buffered.pendingTurn).toEqual({
      face: getViewFaces(rotated.viewOrientation).front,
      direction: -1,
    })
    expect(buffered.viewOrientation).toEqual(rotated.viewOrientation)
  })

  it('starts the buffered turn from the committed state and clears the slot', () => {
    const first = startFrontTurn()
    const buffered = gameReducer(first, {
      id: 'turnViewRight',
      direction: 1,
      startedAt: 101,
    })
    const second = completeTurn(buffered, 280)

    expect(second.moveHistory.map((entry) => entry.move)).toEqual([
      { face: 'F', direction: 1 },
    ])
    expect(second.pendingTurn).toBeNull()
    expect(second.activeTurnAnimation).toMatchObject({
      move: { face: 'R', direction: 1 },
      fromState: first.activeTurnAnimation!.toState,
      startedAt: 280,
    })
    expect(serializeCube(second.cubeState)).toBe(
      serializeCube(first.activeTurnAnimation!.toState),
    )

    const completed = completeTurn(second, 460)
    expect(completed.activeTurnAnimation).toBeNull()
    expect(completed.moveHistory.map((entry) => entry.move)).toEqual([
      { face: 'F', direction: 1 },
      { face: 'R', direction: 1 },
    ])
  })

  it('ignores view, scramble, and undo actions without clearing the buffer', () => {
    const active = gameReducer(startFrontTurn(), {
      id: 'turnViewUp',
      direction: 1,
      startedAt: 101,
    })

    expect(gameReducer(active, { id: 'rotateViewLeft' })).toBe(active)
    expect(gameReducer(active, { id: 'rollViewClockwise' })).toBe(active)
    expect(gameReducer(active, { id: 'scrambleCube' })).toBe(active)
    expect(gameReducer(active, { id: 'undoMove' })).toBe(active)
    expect(active.pendingTurn).toEqual({ face: 'U', direction: 1 })
  })

  it('reset cancels animation and restores solved state', () => {
    const active = startFrontTurn()
    const reset = gameReducer(active, { id: 'resetCube' })
    const staleCompletion = gameReducer(reset, {
      id: 'completeFaceTurnAnimation',
      startedAt: active.activeTurnAnimation!.startedAt,
      completedAt: 280,
      nextAnimationDurationMs: 180,
    })

    expect(reset.activeTurnAnimation).toBeNull()
    expect(reset.pendingTurn).toBeNull()
    expect(serializeCube(reset.cubeState)).toBe(
      serializeCube(createSolvedCube()),
    )
    expect(staleCompletion).toBe(reset)
  })

  it('allows peek changes and keyup while animation is active', () => {
    const peeking = gameReducer(startFrontTurn(), { id: 'startPeekRight' })
    const released = gameReducer(peeking, { id: 'stopPeekRight' })

    expect(peeking.activeTurnAnimation).not.toBeNull()
    expect(peeking.peekDirection).toBe('showRight')
    expect(released.peekDirection).toBeNull()
    expect(released.activeTurnAnimation).not.toBeNull()
  })

  it('uses the configured duration for newly started animations', () => {
    const fast = gameReducer(createInitialCubeGameState(), {
      id: 'turnViewFront',
      direction: 1,
      startedAt: 100,
      animationDurationMs: 120,
    })

    expect(fast.activeTurnAnimation?.durationMs).toBe(120)

    const buffered = gameReducer(fast, {
      id: 'turnViewRight',
      direction: 1,
      startedAt: 101,
      animationDurationMs: 120,
    })
    const slowNext = completeTurn(buffered, 220, 260)

    expect(fast.activeTurnAnimation?.durationMs).toBe(120)
    expect(slowNext.activeTurnAnimation?.durationMs).toBe(260)
  })
})
