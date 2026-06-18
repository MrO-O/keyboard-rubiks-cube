import { describe, expect, it } from 'vitest'
import { createSolvedCube, serializeCube } from '../model'
import { INITIAL_VIEW, rotateViewLeft } from '../view'
import { getCubeGroupRotation } from './viewTransform'

describe('view render transform', () => {
  it('uses the identity quaternion for the initial orientation', () => {
    expect(getCubeGroupRotation(INITIAL_VIEW)).toEqual([0, 0, 0, 1])
  })

  it('changes when view orientation changes', () => {
    expect(getCubeGroupRotation(rotateViewLeft(INITIAL_VIEW))).not.toEqual(
      getCubeGroupRotation(INITIAL_VIEW),
    )
  })

  it('does not modify CubeState', () => {
    const cubeState = createSolvedCube()
    const before = serializeCube(cubeState)

    getCubeGroupRotation(rotateViewLeft(INITIAL_VIEW))

    expect(serializeCube(cubeState)).toBe(before)
  })
})
