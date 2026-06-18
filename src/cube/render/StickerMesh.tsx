import { STICKER_SIZE } from './renderData'
import type { StickerRenderData } from './renderTypes'

interface StickerMeshProps {
  readonly sticker: StickerRenderData
}

export function StickerMesh({ sticker }: StickerMeshProps) {
  return (
    <mesh
      position={sticker.transform.position}
      rotation={sticker.transform.rotation}
    >
      <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
      <meshStandardMaterial color={sticker.materialColor} roughness={0.62} />
    </mesh>
  )
}
