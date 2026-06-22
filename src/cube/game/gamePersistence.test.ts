import { describe, expect, it } from 'vitest'
import { serializeCube } from '../model'
import { INITIAL_VIEW } from '../view'
import { GAME_STORAGE_KEY, type GameStorage } from '../../gamePersistence'
import { createInitialCubeGameState, gameReducer } from './gameReducer'
import {
  autosaveGameState,
  createPersistedGameState,
  initializeGameState,
  restoreGameState,
  shouldAutosaveGameState,
} from './useCubeGame'

class MemoryStorage implements GameStorage {
  readonly values = new Map<string, string>()
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
  removeItem(key: string) {
    this.values.delete(key)
  }
}

function completeFrontTurn() {
  const active = gameReducer(createInitialCubeGameState(), {
    id: 'turnViewFront',
    direction: 1,
    startedAt: 100,
  })
  return gameReducer(active, {
    id: 'completeFaceTurnAnimation',
    startedAt: 100,
    completedAt: 280,
    nextAnimationDurationMs: 180,
  })
}

describe('game persistence integration', () => {
  it('restores cubeState, viewOrientation, and moveHistory', () => {
    const moved = completeFrontTurn()
    const rotated = gameReducer(moved, { id: 'rotateViewLeft' })
    const persisted = createPersistedGameState(
      rotated,
      '2026-06-19T00:00:00.000Z',
    )
    const restored = restoreGameState(persisted)

    expect(serializeCube(restored.cubeState)).toBe(
      serializeCube(rotated.cubeState),
    )
    expect(restored.viewOrientation).toEqual(rotated.viewOrientation)
    expect(restored.moveHistory.map((entry) => entry.move)).toEqual(
      rotated.moveHistory.map((entry) => entry.move),
    )
    expect(restored.activeTurnAnimation).toBeNull()
    expect(restored.pendingTurn).toBeNull()
    expect(restored.peekDirection).toBeNull()
  })

  it('falls back to a solved initial state for a missing save', () => {
    const restored = restoreGameState(null)
    expect(restored.isSolved).toBe(true)
    expect(restored.viewOrientation).toEqual(INITIAL_VIEW)
    expect(restored.moveHistory).toEqual([])
  })

  it('restores wide move history and notation', () => {
    const active = gameReducer(createInitialCubeGameState(), {
      id: 'turnViewFront',
      direction: -1,
      layers: 2,
      startedAt: 100,
    })
    const moved = gameReducer(active, {
      id: 'completeFaceTurnAnimation',
      startedAt: 100,
      completedAt: 280,
      nextAnimationDurationMs: 180,
    })
    const restored = restoreGameState(createPersistedGameState(moved))
    expect(restored.moveHistory[0]).toEqual({
      move: { face: 'F', direction: -1, layers: 2 },
      label: "Fw'",
    })
    expect(restored.wideTurnModifierActive).toBe(false)
  })

  it('falls back without crashing when the stored game is corrupt', () => {
    const storage = new MemoryStorage()
    storage.setItem(GAME_STORAGE_KEY, '{broken')
    expect(initializeGameState(storage).isSolved).toBe(true)
  })

  it('autosaves committed turns, reset, scramble, undo, and view changes', () => {
    const initial = createInitialCubeGameState()
    const moved = completeFrontTurn()
    const reset = gameReducer(moved, { id: 'resetCube' })
    const scrambled = gameReducer(initial, { id: 'scrambleCube' })
    const undone = gameReducer(moved, { id: 'undoMove' })
    const rotated = gameReducer(initial, { id: 'rotateViewLeft' })

    expect(shouldAutosaveGameState(initial, moved)).toBe(true)
    expect(shouldAutosaveGameState(moved, reset)).toBe(true)
    expect(shouldAutosaveGameState(initial, scrambled)).toBe(true)
    expect(shouldAutosaveGameState(moved, undone)).toBe(true)
    expect(shouldAutosaveGameState(initial, rotated)).toBe(true)

    const storage = new MemoryStorage()
    for (const [previous, current] of [
      [initial, moved],
      [moved, reset],
      [initial, scrambled],
      [moved, undone],
      [initial, rotated],
    ] as const) {
      expect(autosaveGameState(previous, current, storage)).toBe(true)
      expect(storage.values.has(GAME_STORAGE_KEY)).toBe(true)
    }
  })

  it('does not autosave peek, wide modifier, an active animation, or pendingTurn', () => {
    const initial = createInitialCubeGameState()
    const peeking = gameReducer(initial, { id: 'startPeekRight' })
    const wideModifier = gameReducer(initial, { id: 'startWideTurnModifier' })
    const active = gameReducer(initial, {
      id: 'turnViewFront',
      direction: 1,
      startedAt: 100,
    })
    const pending = gameReducer(active, {
      id: 'turnViewRight',
      direction: 1,
      startedAt: 101,
    })

    expect(shouldAutosaveGameState(initial, peeking)).toBe(false)
    expect(shouldAutosaveGameState(initial, wideModifier)).toBe(false)
    expect(shouldAutosaveGameState(initial, active)).toBe(false)
    expect(shouldAutosaveGameState(active, pending)).toBe(false)

    const persisted = createPersistedGameState(pending)
    expect(persisted).not.toHaveProperty('peekDirection')
    expect(persisted).not.toHaveProperty('activeTurnAnimation')
    expect(persisted).not.toHaveProperty('pendingTurn')
  })
})
