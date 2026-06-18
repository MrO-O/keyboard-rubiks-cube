import { describe, expect, it } from 'vitest'
import {
  createSolvedCube,
  getCubieIsInMoveLayer,
  getMoveAxisAndLayer,
  type CubeMove,
  type Face,
} from '../model'
import {
  clampProgress,
  easeTurnProgress,
  getTurnAngleRadians,
  getTurnRenderGroups,
} from './turnAnimation'

describe('turn animation geometry', () => {
  it.each([
    ['F', 'z', 1],
    ['B', 'z', -1],
    ['U', 'y', 1],
    ['D', 'y', -1],
    ['L', 'x', -1],
    ['R', 'x', 1],
  ] as const)('maps %s to the %s axis at layer %s', (face, axis, layer) => {
    expect(getMoveAxisAndLayer({ face, direction: 1 })).toEqual({ axis, layer })
  })

  it.each(['F', 'B', 'U', 'D', 'L', 'R'] as const)(
    '%s selects exactly nine cubies',
    (face) => {
      const cube = createSolvedCube()
      const move: CubeMove = { face, direction: 1 }

      expect(
        cube.cubies.filter((cubie) => getCubieIsInMoveLayer(cubie, move)),
      ).toHaveLength(9)
    },
  )

  it('selects only cubies in the requested layer', () => {
    const cube = createSolvedCube()
    const move: CubeMove = { face: 'F', direction: 1 }

    for (const cubie of cube.cubies) {
      expect(getCubieIsInMoveLayer(cubie, move)).toBe(cubie.position.z === 1)
    }
  })

  it.each(['F', 'B', 'U', 'D', 'L', 'R'] as Face[])(
    '%s starts at zero and ends at a quarter turn',
    (face) => {
      const clockwise: CubeMove = { face, direction: 1 }
      const inverse: CubeMove = { face, direction: -1 }

      expect(getTurnAngleRadians(clockwise, 0)).toBe(0)
      expect(Math.abs(getTurnAngleRadians(clockwise, 1))).toBeCloseTo(
        Math.PI / 2,
      )
      expect(getTurnAngleRadians(inverse, 1)).toBe(
        -getTurnAngleRadians(clockwise, 1),
      )
    },
  )

  it.each([
    ['F', -Math.PI / 2],
    ['U', -Math.PI / 2],
    ['R', -Math.PI / 2],
    ['B', Math.PI / 2],
    ['D', Math.PI / 2],
    ['L', Math.PI / 2],
  ] as const)('uses the applyMove rotation sign for %s', (face, angle) => {
    expect(getTurnAngleRadians({ face, direction: 1 }, 1)).toBeCloseTo(angle)
  })

  it('clamps progress and preserves easing endpoints', () => {
    expect(clampProgress(-1)).toBe(0)
    expect(clampProgress(0.4)).toBe(0.4)
    expect(clampProgress(2)).toBe(1)
    expect(easeTurnProgress(0)).toBe(0)
    expect(easeTurnProgress(1)).toBe(1)
  })

  it('splits animated render data into nine moving and 17 fixed cubies', () => {
    const groups = getTurnRenderGroups(createSolvedCube(), {
      face: 'F',
      direction: 1,
    })

    expect(groups.rotating).toHaveLength(9)
    expect(groups.stationary).toHaveLength(17)
  })

  it('changes the rotating group angle as progress advances', () => {
    const move: CubeMove = { face: 'R', direction: 1 }

    expect(getTurnAngleRadians(move, 0.25)).not.toBe(
      getTurnAngleRadians(move, 0.75),
    )
  })
})
