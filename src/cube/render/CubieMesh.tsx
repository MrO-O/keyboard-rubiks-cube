import { CUBIE_SIZE } from './renderData'
import { StickerMesh } from './StickerMesh'
import type { CubieRenderData } from './renderTypes'

interface CubieMeshProps {
  readonly cubie: CubieRenderData
}

export function CubieMesh({ cubie }: CubieMeshProps) {
  return (
    <group position={cubie.position}>
      <mesh>
        <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
        <meshStandardMaterial color="#111827" roughness={0.75} />
      </mesh>
      {cubie.stickers.map((sticker) => (
        <StickerMesh key={sticker.face} sticker={sticker} />
      ))}
    </group>
  )
}
