import { FACE_VECTORS, faceFromVector } from '../model'
import type { Face, Vec3 } from '../model'
import type { ViewFaces, ViewOrientation } from './types'

export const INITIAL_VIEW: ViewOrientation = { up: 'U', front: 'F' }

function negate(vector: Vec3): Vec3 {
  return {
    x: -vector.x as Vec3['x'],
    y: -vector.y as Vec3['y'],
    z: -vector.z as Vec3['z'],
  }
}

function opposite(face: Face): Face {
  return faceFromVector(negate(FACE_VECTORS[face]))
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: (a.y * b.z - a.z * b.y) as Vec3['x'],
    y: (a.z * b.x - a.x * b.z) as Vec3['y'],
    z: (a.x * b.y - a.y * b.x) as Vec3['z'],
  }
}

export function getViewFaces(view: ViewOrientation): ViewFaces {
  const right = faceFromVector(
    cross(FACE_VECTORS[view.up], FACE_VECTORS[view.front]),
  )
  return {
    up: view.up,
    down: opposite(view.up),
    left: opposite(right),
    right,
    front: view.front,
    back: opposite(view.front),
  }
}

export function rotateViewLeft(view: ViewOrientation): ViewOrientation {
  return { up: view.up, front: getViewFaces(view).right }
}

export function rotateViewRight(view: ViewOrientation): ViewOrientation {
  return { up: view.up, front: getViewFaces(view).left }
}

export function rotateViewUp(view: ViewOrientation): ViewOrientation {
  const faces = getViewFaces(view)
  return { up: faces.back, front: faces.up }
}

export function rotateViewDown(view: ViewOrientation): ViewOrientation {
  const faces = getViewFaces(view)
  return { up: faces.front, front: faces.down }
}

export function rollViewClockwise(view: ViewOrientation): ViewOrientation {
  return { up: getViewFaces(view).left, front: view.front }
}

export function rollViewCounterClockwise(
  view: ViewOrientation,
): ViewOrientation {
  return { up: getViewFaces(view).right, front: view.front }
}
