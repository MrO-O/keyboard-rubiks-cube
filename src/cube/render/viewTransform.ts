import { Matrix4, Quaternion } from 'three'
import { FACE_VECTORS } from '../model'
import { getViewFaces, type ViewOrientation } from '../view'
import type { QuaternionTuple } from './renderTypes'

const EPSILON = 1e-10

export function getCubeGroupRotation(
  viewOrientation: ViewOrientation,
): QuaternionTuple {
  const faces = getViewFaces(viewOrientation)
  const right = FACE_VECTORS[faces.right]
  const up = FACE_VECTORS[faces.up]
  const front = FACE_VECTORS[faces.front]

  // Maps the current physical right/up/front basis onto world +X/+Y/+Z.
  const matrix = new Matrix4().set(
    right.x,
    right.y,
    right.z,
    0,
    up.x,
    up.y,
    up.z,
    0,
    front.x,
    front.y,
    front.z,
    0,
    0,
    0,
    0,
    1,
  )
  const quaternion = new Quaternion().setFromRotationMatrix(matrix).normalize()

  return [
    stable(quaternion.x),
    stable(quaternion.y),
    stable(quaternion.z),
    stable(quaternion.w),
  ]
}

function stable(value: number): number {
  if (Math.abs(value) < EPSILON) return 0
  if (Math.abs(value - 1) < EPSILON) return 1
  if (Math.abs(value + 1) < EPSILON) return -1
  return value
}
