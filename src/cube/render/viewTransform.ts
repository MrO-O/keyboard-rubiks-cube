import { Matrix4, Quaternion, Vector3 } from 'three'
import { FACE_VECTORS } from '../model'
import {
  getViewFaces,
  type PeekDirection,
  type ViewOrientation,
} from '../view'
import type { QuaternionTuple } from './renderTypes'
import { easeTurnProgress } from './turnAnimation'

const EPSILON = 1e-10
export const PEEK_YAW_DEGREES = 24

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

export function getPeekYawRadians(peekDirection: PeekDirection): number {
  if (peekDirection === 'showRight') {
    return (-PEEK_YAW_DEGREES * Math.PI) / 180
  }
  if (peekDirection === 'showLeft') {
    return (PEEK_YAW_DEGREES * Math.PI) / 180
  }
  return 0
}

export function getDisplayRotation(
  viewOrientation: ViewOrientation,
  peekDirection: PeekDirection,
  activeViewAnimation?: ViewAnimationTransform | null,
  progress = 0,
): QuaternionTuple {
  const viewRotation = activeViewAnimation
    ? getInterpolatedViewRotation(
        activeViewAnimation.fromOrientation,
        activeViewAnimation.toOrientation,
        progress,
      )
    : getCubeGroupRotation(viewOrientation)
  if (!peekDirection) return viewRotation

  // Negative world-Y yaw turns the current right face toward the +Z camera.
  const viewQuaternion = new Quaternion(...viewRotation)
  const peekQuaternion = new Quaternion().setFromAxisAngle(
    new Vector3(0, 1, 0),
    getPeekYawRadians(peekDirection),
  )

  return toTuple(peekQuaternion.multiply(viewQuaternion).normalize())
}

export interface ViewAnimationTransform {
  readonly fromOrientation: ViewOrientation
  readonly toOrientation: ViewOrientation
}

export function getInterpolatedViewRotation(
  fromOrientation: ViewOrientation,
  toOrientation: ViewOrientation,
  progress: number,
): QuaternionTuple {
  if (progress <= 0) return getCubeGroupRotation(fromOrientation)
  if (progress >= 1) return getCubeGroupRotation(toOrientation)
  const from = new Quaternion(...getCubeGroupRotation(fromOrientation))
  const to = new Quaternion(...getCubeGroupRotation(toOrientation))
  return toTuple(from.slerp(to, easeTurnProgress(progress)).normalize())
}

function toTuple(quaternion: Quaternion): QuaternionTuple {
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
