import { describe, expect, it } from 'vitest'
import { createSolvedCube, serializeCube } from '../model'
import {
  INITIAL_VIEW,
  getViewFaces,
  rollViewClockwise,
  rotateViewLeft,
  rotateViewRight,
} from './viewOrientation'
import type { ViewOrientation } from './types'

function repeat(
  operation: (view: ViewOrientation) => ViewOrientation,
  count: number,
): ViewOrientation {
  let view = INITIAL_VIEW
  for (let index = 0; index < count; index += 1) view = operation(view)
  return view
}

describe('view orientation', () => {
  it('starts with U up and F front', () => {
    expect(getViewFaces(INITIAL_VIEW)).toMatchObject({ up: 'U', front: 'F' })
  })

  it('keeps front fixed while rolling clockwise', () => {
    expect(rollViewClockwise(INITIAL_VIEW).front).toBe('F')
  })

  it('changes front when rotating left or right', () => {
    expect(rotateViewLeft(INITIAL_VIEW).front).not.toBe('F')
    expect(rotateViewRight(INITIAL_VIEW).front).not.toBe('F')
  })

  it('returns after four left rotations', () => {
    expect(repeat(rotateViewLeft, 4)).toEqual(INITIAL_VIEW)
  })

  it('returns after four clockwise rolls', () => {
    expect(repeat(rollViewClockwise, 4)).toEqual(INITIAL_VIEW)
  })

  it('does not change cube state', () => {
    const cube = createSolvedCube()
    const before = serializeCube(cube)
    rotateViewLeft(rollViewClockwise(rotateViewRight(INITIAL_VIEW)))
    expect(serializeCube(cube)).toBe(before)
  })
})
