import type { CubeColor, Face } from '../model'

export type Vector3Tuple = readonly [number, number, number]
export type QuaternionTuple = readonly [number, number, number, number]

export interface StickerTransform {
  readonly position: Vector3Tuple
  readonly rotation: Vector3Tuple
}

export interface StickerRenderData {
  readonly face: Face
  readonly color: CubeColor
  readonly materialColor: string
  readonly transform: StickerTransform
}

export interface CubieRenderData {
  readonly id: string
  readonly position: Vector3Tuple
  readonly stickers: readonly StickerRenderData[]
}
