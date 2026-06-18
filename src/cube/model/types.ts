export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
export type Axis = 'x' | 'y' | 'z'
export type Direction = 1 | -1
export type Coordinate = -1 | 0 | 1

export interface Vec3 {
  x: Coordinate
  y: Coordinate
  z: Coordinate
}

export type CubeColor = 'white' | 'yellow' | 'orange' | 'red' | 'green' | 'blue'
export type Stickers = Partial<Record<Face, CubeColor>>

export interface Cubie {
  readonly id: string
  readonly position: Vec3
  readonly stickers: Stickers
}

export interface CubeState {
  readonly cubies: readonly Cubie[]
}

export interface CubeMove {
  readonly face: Face
  readonly direction: Direction
}

export interface ScrambleOptions {
  readonly length?: number
  readonly random?: () => number
}

export interface ScrambleResult {
  readonly state: CubeState
  readonly moves: readonly CubeMove[]
}
