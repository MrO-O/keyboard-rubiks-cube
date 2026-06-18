import type { Axis, CubeColor, Face, Vec3 } from './types'

export const FACES: readonly Face[] = ['U', 'D', 'L', 'R', 'F', 'B']

export const FACE_COLORS: Readonly<Record<Face, CubeColor>> = {
  U: 'white',
  D: 'yellow',
  L: 'orange',
  R: 'red',
  F: 'green',
  B: 'blue',
}

export const FACE_VECTORS: Readonly<Record<Face, Vec3>> = {
  U: { x: 0, y: 1, z: 0 },
  D: { x: 0, y: -1, z: 0 },
  L: { x: -1, y: 0, z: 0 },
  R: { x: 1, y: 0, z: 0 },
  F: { x: 0, y: 0, z: 1 },
  B: { x: 0, y: 0, z: -1 },
}

export const FACE_LAYERS: Readonly<
  Record<Face, { axis: Axis; coordinate: -1 | 1 }>
> = {
  U: { axis: 'y', coordinate: 1 },
  D: { axis: 'y', coordinate: -1 },
  L: { axis: 'x', coordinate: -1 },
  R: { axis: 'x', coordinate: 1 },
  F: { axis: 'z', coordinate: 1 },
  B: { axis: 'z', coordinate: -1 },
}

export function faceFromVector(vector: Vec3): Face {
  const entry = FACES.find((face) => {
    const candidate = FACE_VECTORS[face]
    return (
      candidate.x === vector.x &&
      candidate.y === vector.y &&
      candidate.z === vector.z
    )
  })

  if (!entry)
    throw new Error(`Vector is not a face normal: ${JSON.stringify(vector)}`)
  return entry
}
