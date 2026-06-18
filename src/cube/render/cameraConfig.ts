import type { Vector3Tuple } from './renderTypes'

export interface DefaultCameraConfig {
  readonly kind: 'perspective'
  readonly position: Vector3Tuple
  readonly target: Vector3Tuple
  readonly fov: number
  readonly near: number
  readonly far: number
}

export const DEFAULT_CAMERA_TARGET: Vector3Tuple = [0, 0, 0]

// Default view is a front-facing top perspective: F faces the player, U remains
// visible with mild perspective compression. Future Q/E side peeks should yaw
// from this baseline instead of replacing it.
export const DEFAULT_CAMERA_POSITION: Vector3Tuple = [0, 3.2, 7.5]
export const DEFAULT_CAMERA_FOV = 32

export function getDefaultCameraConfig(): DefaultCameraConfig {
  return {
    kind: 'perspective',
    position: DEFAULT_CAMERA_POSITION,
    target: DEFAULT_CAMERA_TARGET,
    fov: DEFAULT_CAMERA_FOV,
    near: 0.1,
    far: 100,
  }
}
