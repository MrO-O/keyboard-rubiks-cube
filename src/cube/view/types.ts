import type { Face } from '../model'

export interface ViewOrientation {
  readonly up: Face
  readonly front: Face
}

export interface ViewFaces {
  readonly up: Face
  readonly down: Face
  readonly left: Face
  readonly right: Face
  readonly front: Face
  readonly back: Face
}

export type PeekDirection = 'showRight' | 'showLeft' | null
