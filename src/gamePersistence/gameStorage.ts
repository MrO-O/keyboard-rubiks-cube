import type { GameStorage, PersistedGameStateV1 } from './types'
import { validatePersistedGame } from './validatePersistedGame'

export const GAME_STORAGE_KEY = 'keyboard-rubiks-cube.game.v1'

export function loadGameState(
  storage?: GameStorage | null,
): PersistedGameStateV1 | null {
  try {
    const target = storage ?? getBrowserStorage()
    if (!target) return null
    const stored = target.getItem(GAME_STORAGE_KEY)
    return stored ? validatePersistedGame(JSON.parse(stored)) : null
  } catch {
    return null
  }
}

export function saveGameState(
  game: PersistedGameStateV1,
  storage?: GameStorage | null,
): void {
  if (!validatePersistedGame(game)) {
    throw new Error('Cannot save invalid game state.')
  }
  try {
    const target = storage ?? getBrowserStorage()
    target?.setItem(GAME_STORAGE_KEY, JSON.stringify(game))
  } catch {
    // Storage can be unavailable or full in restricted browser contexts.
  }
}

export function clearSavedGame(storage?: GameStorage | null): void {
  try {
    const target = storage ?? getBrowserStorage()
    target?.removeItem(GAME_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function getBrowserStorage(): GameStorage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}
