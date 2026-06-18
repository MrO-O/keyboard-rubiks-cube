import { describe, expect, it } from 'vitest'
import { getDefaultCameraConfig } from './cameraConfig'

describe('default camera config', () => {
  it('keeps the default camera centered on the front face', () => {
    const { position } = getDefaultCameraConfig()

    expect(Math.abs(position[0])).toBeLessThanOrEqual(0.001)
  })

  it('places the default camera above the cube', () => {
    const { position } = getDefaultCameraConfig()

    expect(position[1]).toBeGreaterThan(0)
  })

  it('places the default camera in front of the F face', () => {
    const { position } = getDefaultCameraConfig()

    expect(position[2]).toBeGreaterThan(0)
  })

  it('keeps z clearly larger than y to avoid an isometric side view', () => {
    const { position } = getDefaultCameraConfig()

    expect(position[2]).toBeGreaterThan(position[1] * 1.5)
  })
})
