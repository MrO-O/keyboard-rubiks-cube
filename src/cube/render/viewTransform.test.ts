import { describe, expect, it } from 'vitest'
import { createSolvedCube, serializeCube } from '../model'
import {
  INITIAL_VIEW,
  rollViewClockwise,
  rollViewCounterClockwise,
  rotateViewLeft,
} from '../view'
import {
  PEEK_YAW_DEGREES,
  getCubeGroupRotation,
  getDisplayRotation,
  getInterpolatedViewRotation,
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

  it('interpolates exactly from and to view orientations', () => {
    const to = rotateViewLeft(INITIAL_VIEW)
    expect(getInterpolatedViewRotation(INITIAL_VIEW, to, 0)).toEqual(
      getCubeGroupRotation(INITIAL_VIEW),
    )
    expect(getInterpolatedViewRotation(INITIAL_VIEW, to, 1)).toEqual(
      getCubeGroupRotation(to),
    )
    const middle = getInterpolatedViewRotation(INITIAL_VIEW, to, 0.5)
    expect(middle).not.toEqual(getCubeGroupRotation(INITIAL_VIEW))
    expect(middle).not.toEqual(getCubeGroupRotation(to))
  })

  it('has different clockwise and counterclockwise roll targets', () => {
    expect(getCubeGroupRotation(rollViewClockwise(INITIAL_VIEW))).not.toEqual(
      getCubeGroupRotation(rollViewCounterClockwise(INITIAL_VIEW)),
    )
  })

  it('applies peek after interpolating a view animation', () => {
    const animation = {
      fromOrientation: INITIAL_VIEW,
      toOrientation: rotateViewLeft(INITIAL_VIEW),
    }
    const regular = getDisplayRotation(INITIAL_VIEW, null, animation, 0.5)
    expect(
      getDisplayRotation(INITIAL_VIEW, 'showRight', animation, 0.5),
    ).not.toEqual(regular)
  })
})
