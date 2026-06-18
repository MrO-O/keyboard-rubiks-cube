import { describe, expect, it } from 'vitest'
import { createSolvedCube, serializeCube } from '../model'
import { INITIAL_VIEW, rotateViewLeft } from '../view'
import {
  PEEK_YAW_DEGREES,
  getCubeGroupRotation,
  getDisplayRotation,
  getPeekYawRadians,
} from './viewTransform'

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

  it('uses the regular view transform when peek is inactive', () => {
    expect(getDisplayRotation(INITIAL_VIEW, null)).toEqual(
      getCubeGroupRotation(INITIAL_VIEW),
    )
  })

  it('applies opposite yaw directions for right and left peeks', () => {
    const rightYaw = getPeekYawRadians('showRight')
    const leftYaw = getPeekYawRadians('showLeft')

    expect(rightYaw).toBeCloseTo((-PEEK_YAW_DEGREES * Math.PI) / 180)
    expect(leftYaw).toBeCloseTo((PEEK_YAW_DEGREES * Math.PI) / 180)
    expect(rightYaw).toBe(-leftYaw)
  })

  it('changes display rotation for either peek direction', () => {
    const regular = getDisplayRotation(INITIAL_VIEW, null)

    expect(getDisplayRotation(INITIAL_VIEW, 'showRight')).not.toEqual(regular)
    expect(getDisplayRotation(INITIAL_VIEW, 'showLeft')).not.toEqual(regular)
  })
})
