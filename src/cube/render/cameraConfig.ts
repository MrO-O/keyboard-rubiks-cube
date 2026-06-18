import type { Vector3Tuple } from './renderTypes'

export interface DefaultCameraConfig {
  readonly position: Vector3Tuple
  readonly target: Vector3Tuple
  readonly zoom: number
  readonly near: number
  readonly far: number
}

export const DEFAULT_CAMERA_TARGET: Vector3Tuple = [0, 0, 0]

// Default view is front-facing top view: F faces the player, U remains visible.
// Future Q/E side peeks should yaw from this baseline instead of replacing it.
export const DEFAULT_CAMERA_POSITION: Vector3Tuple = [0, 3.5, 7]

export function getDefaultCameraConfig(): DefaultCameraConfig {
  return {
    position: DEFAULT_CAMERA_POSITION,
    target: DEFAULT_CAMERA_TARGET,
    zoom: 78,
    near: 0.1,
    far: 100,
  }
}
