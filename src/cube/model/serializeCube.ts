import type { CubeState, Face } from './types'

export function serializeCube(state: CubeState): string {
  return JSON.stringify(
    [...state.cubies]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((cubie) => ({
        id: cubie.id,
        position: [cubie.position.x, cubie.position.y, cubie.position.z],
        stickers: Object.entries(cubie.stickers).sort(([a], [b]) =>
          (a as Face).localeCompare(b as Face),
        ),
      })),
  )
}
