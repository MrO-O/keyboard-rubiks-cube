import { Children, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { createSolvedCube } from '../model'
import { INITIAL_VIEW } from '../view'
import type { Cubie } from '../model'
import { CubeRenderer } from './CubeRenderer'
import {
  CUBIE_SPACING,
  STICKER_MATERIAL_COLORS,
  STICKER_OFFSET,
  getCubeRenderData,
  getCubieRenderPosition,
  getFaceColor,
  getStickerRenderData,
  getStickerTransform,
} from './renderData'

describe('cube render data', () => {
  it('prepares 26 cubies for a solved cube', () => {
    const renderData = getCubeRenderData(createSolvedCube())

    expect(renderData).toHaveLength(26)
  })

  it('CubeRenderer receives a solved cube and creates 26 cubie elements', () => {
    const element = CubeRenderer({
      cubeState: createSolvedCube(),
      viewOrientation: INITIAL_VIEW,
      peekDirection: null,
    }) as ReactElement<{ children: ReactNode }>

    expect(Children.toArray(element.props.children)).toHaveLength(26)
  })

  it('uses cubie.position as the source of render position', () => {
    const cubie = createSolvedCube().cubies.find(
      (candidate) => candidate.id === 'URF',
    )

    expect(cubie).toBeDefined()
    expect(getCubieRenderPosition(cubie!)).toEqual([
      CUBIE_SPACING,
      CUBIE_SPACING,
      CUBIE_SPACING,
    ])
  })

  it('converts stickers and colors into sticker render data', () => {
    const cubie = createSolvedCube().cubies.find(
      (candidate) => candidate.id === 'URF',
    )

    expect(cubie).toBeDefined()
    expect(getStickerRenderData(cubie!)).toEqual([
      expect.objectContaining({
        face: 'U',
        color: getFaceColor('U'),
        materialColor: STICKER_MATERIAL_COLORS.white,
      }),
      expect.objectContaining({
        face: 'R',
        color: getFaceColor('R'),
        materialColor: STICKER_MATERIAL_COLORS.red,
      }),
      expect.objectContaining({
        face: 'F',
        color: getFaceColor('F'),
        materialColor: STICKER_MATERIAL_COLORS.green,
      }),
    ])
  })

  it('keeps sticker render data attached to current sticker normals', () => {
    const cubie: Cubie = {
      id: 'test',
      position: { x: 1, y: 0, z: 0 },
      stickers: { R: 'green' },
    }

    expect(getStickerRenderData(cubie)).toEqual([
      expect.objectContaining({
        face: 'R',
        color: 'green',
        transform: getStickerTransform('R'),
      }),
    ])
  })

  it('maps face normals to sticker positions and rotations', () => {
    expect(getStickerTransform('F')).toEqual({
      position: [0, 0, STICKER_OFFSET],
      rotation: [0, 0, 0],
    })
    expect(getStickerTransform('B')).toEqual({
      position: [0, 0, -STICKER_OFFSET],
      rotation: [0, Math.PI, 0],
    })
    expect(getStickerTransform('U')).toEqual({
      position: [0, STICKER_OFFSET, 0],
      rotation: [-Math.PI / 2, 0, 0],
    })
    expect(getStickerTransform('D')).toEqual({
      position: [0, -STICKER_OFFSET, 0],
      rotation: [Math.PI / 2, 0, 0],
    })
    expect(getStickerTransform('R')).toEqual({
      position: [STICKER_OFFSET, 0, 0],
      rotation: [0, Math.PI / 2, 0],
    })
    expect(getStickerTransform('L')).toEqual({
      position: [-STICKER_OFFSET, 0, 0],
      rotation: [0, -Math.PI / 2, 0],
    })
  })
})
