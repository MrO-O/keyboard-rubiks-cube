import { describe, expect, it } from 'vitest'
import { applyMove, createSolvedCube } from '../cube/model'
import { INITIAL_VIEW, rotateViewLeft } from '../cube/view'
import {
  GAME_STORAGE_KEY,
  clearSavedGame,
  loadGameState,
  saveGameState,
  type GameStorage,
  type PersistedGameStateV1,
} from './index'

class MemoryStorage implements GameStorage {
  readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

function validGame(): PersistedGameStateV1 {
  return {
    app: 'keyboard-rubiks-cube',
    schemaVersion: 1,
    savedAt: '2026-06-19T00:00:00.000Z',
    cubeState: applyMove(createSolvedCube(), { face: 'F', direction: 1 }),
    viewOrientation: rotateViewLeft(INITIAL_VIEW),
    moveHistory: [{ face: 'F', direction: 1 }],
  }
}

describe('game storage', () => {
  it('returns null when storage is empty', () => {
    expect(loadGameState(new MemoryStorage())).toBeNull()
  })

  it('loads a valid saved game', () => {
    const storage = new MemoryStorage()
    storage.setItem(GAME_STORAGE_KEY, JSON.stringify(validGame()))
    expect(loadGameState(storage)).toEqual(
      JSON.parse(JSON.stringify(validGame())),
    )
  })

  it.each([
    ['broken JSON', '{broken'],
    ['wrong app', JSON.stringify({ ...validGame(), app: 'other-app' })],
    ['unsupported version', JSON.stringify({ ...validGame(), schemaVersion: 2 })],
    ['missing cubeState', JSON.stringify({ ...validGame(), cubeState: undefined })],
    [
      'missing viewOrientation',
      JSON.stringify({ ...validGame(), viewOrientation: undefined }),
    ],
    ['invalid moveHistory', JSON.stringify({ ...validGame(), moveHistory: {} })],
  ])('rejects %s', (_case, stored) => {
    const storage = new MemoryStorage()
    storage.setItem(GAME_STORAGE_KEY, stored)
    expect(loadGameState(storage)).toBeNull()
  })

  it('writes a valid game', () => {
    const storage = new MemoryStorage()
    saveGameState(validGame(), storage)
    expect(JSON.parse(storage.values.get(GAME_STORAGE_KEY)!)).toEqual(
      JSON.parse(JSON.stringify(validGame())),
    )
  })

  it('deletes a saved game', () => {
    const storage = new MemoryStorage()
    saveGameState(validGame(), storage)
    clearSavedGame(storage)
    expect(storage.values.has(GAME_STORAGE_KEY)).toBe(false)
  })
})
