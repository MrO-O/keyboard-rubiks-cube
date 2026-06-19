import type { CubeMove, CubeState } from '../cube/model'
import type { ViewOrientation } from '../cube/view'

export interface PersistedGameStateV1 {
  readonly app: 'keyboard-rubiks-cube'
  readonly schemaVersion: 1
  readonly savedAt: string
  readonly cubeState: CubeState
  readonly viewOrientation: ViewOrientation
  readonly moveHistory: readonly CubeMove[]
}

export interface GameStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
