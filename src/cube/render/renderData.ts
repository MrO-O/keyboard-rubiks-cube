import { FACE_COLORS, FACES } from '../model'
import type { Cubie, CubeColor, CubeState, Face, Vec3 } from '../model'
import type {
  CubieRenderData,
  StickerRenderData,
  StickerTransform,
  Vector3Tuple,
} from './renderTypes'

export const CUBIE_SPACING = 1.08
export const CUBIE_SIZE = 0.96
export const STICKER_SIZE = 0.78
export const STICKER_OFFSET = CUBIE_SIZE / 2 + 0.012

export const STICKER_MATERIAL_COLORS: Readonly<Record<CubeColor, string>> = {
  white: '#f8fafc',
  yellow: '#facc15',
  orange: '#f97316',
  red: '#dc2626',
  green: '#16a34a',
  blue: '#2563eb',
}

const FACE_NORMALS: Readonly<Record<Face, Vec3>> = {
  U: { x: 0, y: 1, z: 0 },
  D: { x: 0, y: -1, z: 0 },
  L: { x: -1, y: 0, z: 0 },
  R: { x: 1, y: 0, z: 0 },
  F: { x: 0, y: 0, z: 1 },
  B: { x: 0, y: 0, z: -1 },
}

const FACE_ROTATIONS: Readonly<Record<Face, Vector3Tuple>> = {
  U: [-Math.PI / 2, 0, 0],
  D: [Math.PI / 2, 0, 0],
  L: [0, -Math.PI / 2, 0],
  R: [0, Math.PI / 2, 0],
  F: [0, 0, 0],
  B: [0, Math.PI, 0],
}

export function getFaceColor(face: Face): CubeColor {
  return FACE_COLORS[face]
}

export function getStickerMaterialColor(color: CubeColor): string {
  return STICKER_MATERIAL_COLORS[color]
}

export function getCubieRenderPosition(cubie: Cubie): Vector3Tuple {
  return [
    cubie.position.x * CUBIE_SPACING,
    cubie.position.y * CUBIE_SPACING,
    cubie.position.z * CUBIE_SPACING,
  ]
}

export function getStickerTransform(face: Face): StickerTransform {
  const normal = FACE_NORMALS[face]

  return {
    position: [
      normal.x * STICKER_OFFSET,
      normal.y * STICKER_OFFSET,
      normal.z * STICKER_OFFSET,
    ],
    rotation: FACE_ROTATIONS[face],
  }
}

export function getStickerRenderData(
  cubie: Cubie,
): readonly StickerRenderData[] {
  return FACES.flatMap((face) => {
    const color = cubie.stickers[face]
    if (!color) return []
    return [
      {
        face,
        color,
        materialColor: getStickerMaterialColor(color),
        transform: getStickerTransform(face),
      },
    ]
  })
}

export function getCubeRenderData(state: CubeState): readonly CubieRenderData[] {
  return state.cubies.map((cubie) => ({
    id: cubie.id,
    position: getCubieRenderPosition(cubie),
    stickers: getStickerRenderData(cubie),
  }))
}
