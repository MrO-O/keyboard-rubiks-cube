import { describe, expect, it } from 'vitest'
import { getDefaultCameraConfig } from './cameraConfig'

describe('default camera config', () => {
  it('uses a perspective camera configuration', () => {
    const camera = getDefaultCameraConfig()

    expect(camera.kind).toBe('perspective')
    expect(camera.fov).toBeGreaterThanOrEqual(25)
    expect(camera.fov).toBeLessThanOrEqual(35)
  })

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

  it('keeps z larger than y so F remains the primary face', () => {
    const { position } = getDefaultCameraConfig()

    expect(position[2]).toBeGreaterThan(position[1])
  })

  it('is not an isometric side-view camera', () => {
    const { position } = getDefaultCameraConfig()

    expect(Math.abs(position[0])).toBeLessThan(0.1)
    expect(position[2]).toBeGreaterThan(position[1] * 1.8)
  })

  it('is not a completely flat front camera', () => {
    const { position } = getDefaultCameraConfig()

    expect(position[1]).toBeGreaterThan(1)
  })
})
