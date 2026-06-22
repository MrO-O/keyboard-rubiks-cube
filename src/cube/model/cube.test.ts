import { describe, expect, it } from 'vitest'
import {
  FACE_COLORS,
  FACES,
  applyMove,
  applyMoves,
  createSolvedCube,
  inverseMove,
  isSolved,
  getCubieIsInMoveLayer,
  scramble,
  serializeCube,
} from './index'
import type { CubeMove, Face } from './index'

describe('cube model', () => {
  it('creates 26 cubies in solved state', () => {
    const cube = createSolvedCube()
    expect(cube.cubies).toHaveLength(26)
    expect(isSolved(cube)).toBe(true)
  })

  it('does not include the hidden center cubie', () => {
    expect(createSolvedCube().cubies).not.toContainEqual(
      expect.objectContaining({ position: { x: 0, y: 0, z: 0 } }),
    )
  })

  it('assigns a unique position to every cubie', () => {
    const positions = createSolvedCube().cubies.map(({ position }) =>
      JSON.stringify(position),
    )
    expect(new Set(positions).size).toBe(26)
  })

  it.each(['F', 'U', 'R'] satisfies Face[])(
    '%s four times is identity',
    (face) => {
      const solved = createSolvedCube()
      const move: CubeMove = { face, direction: 1 }
      expect(serializeCube(applyMoves(solved, [move, move, move, move]))).toBe(
        serializeCube(solved),
      )
    },
  )

  it.each(FACES)('%s followed by its inverse is identity', (face) => {
    const solved = createSolvedCube()
    const move: CubeMove = { face, direction: 1 }
    expect(serializeCube(applyMoves(solved, [move, inverseMove(move)]))).toBe(
      serializeCube(solved),
    )
  })

  it('reverses a scramble with inverse moves', () => {
    const solved = createSolvedCube()
    const result = scramble(solved, { length: 30, random: seededRandom(42) })
    const inverse = [...result.moves].reverse().map(inverseMove)
    expect(serializeCube(applyMoves(result.state, inverse))).toBe(
      serializeCube(solved),
    )
  })

  it('does not mutate the input state', () => {
    const solved = createSolvedCube()
    const before = serializeCube(solved)
    const moved = applyMove(solved, { face: 'F', direction: 1 })
    expect(serializeCube(solved)).toBe(before)
    expect(moved).not.toBe(solved)
  })

  it('treats omitted layers as a single-layer move', () => {
    const solved = createSolvedCube()
    expect(
      serializeCube(applyMove(solved, { face: 'U', direction: 1 })),
    ).toBe(
      serializeCube(
        applyMove(solved, { face: 'U', direction: 1, layers: 1 }),
      ),
    )
  })

  it.each([
    ['U', 'y', 1],
    ['F', 'z', 1],
    ['R', 'x', 1],
  ] as const)('%s wide selects its outer and middle layers', (face, axis, outer) => {
    const move: CubeMove = { face, direction: 1, layers: 2 }
    for (const cubie of createSolvedCube().cubies) {
      expect(getCubieIsInMoveLayer(cubie, move)).toBe(
        cubie.position[axis] === outer || cubie.position[axis] === 0,
      )
    }
  })

  it.each(FACES)('%s wide selects 17 visible cubies', (face) => {
    const move: CubeMove = { face, direction: 1, layers: 2 }
    expect(
      createSolvedCube().cubies.filter((cubie) =>
        getCubieIsInMoveLayer(cubie, move),
      ),
    ).toHaveLength(17)
  })

  it.each(FACES)('%s wide four times is identity', (face) => {
    const solved = createSolvedCube()
    const move: CubeMove = { face, direction: 1, layers: 2 }
    expect(serializeCube(applyMoves(solved, [move, move, move, move]))).toBe(
      serializeCube(solved),
    )
  })

  it.each(FACES)('%s wide followed by its inverse is identity', (face) => {
    const solved = createSolvedCube()
    const move: CubeMove = { face, direction: 1, layers: 2 }
    expect(serializeCube(applyMoves(solved, [move, inverseMove(move)]))).toBe(
      serializeCube(solved),
    )
  })

  it('applies a wide move immutably and produces an unsolved state', () => {
    const solved = createSolvedCube()
    const before = serializeCube(solved)
    const moved = applyMove(solved, { face: 'F', direction: 1, layers: 2 })
    expect(serializeCube(solved)).toBe(before)
    expect(moved).not.toBe(solved)
    expect(isSolved(moved)).toBe(false)
  })

  it('serializes equivalent states identically', () => {
    const first = createSolvedCube()
    const second = { cubies: [...createSolvedCube().cubies].reverse() }
    expect(serializeCube(first)).toBe(serializeCube(second))
  })

  it('uses the defined solved sticker colors', () => {
    const cube = createSolvedCube()
    for (const cubie of cube.cubies) {
      for (const [face, color] of Object.entries(cubie.stickers)) {
        expect(color).toBe(FACE_COLORS[face as Face])
      }
    }
  })
})

function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 0x100000000
    return value / 0x100000000
  }
}
