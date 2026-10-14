import { FLAT_ROTATION, createSlice, sliceHeight } from '../../utils/jelly'
import { STRAWBERRY_CROWN, sepalShape, strawberryShape } from '../../utils/shapes'
import { paintSepal, paintStrawberry } from '../../utils/textures'

const body = createSlice(strawberryShape(), paintStrawberry, '#e2324a')
const crown = createSlice(sepalShape(), paintSepal, '#2e8a3e', {
  extrude: {
    depth: 0.045,
    bevelThickness: 0.055,
    bevelSize: 0.028,
    bevelSegments: 4,
    curveSegments: 8,
  },
  transmission: 0.16,
  thickness: 0.18,
  polygonOffset: true,
  textureSize: 512,
})

const lift = sliceHeight() - 0.018

export const berryParts = { body, crown, lift }

export default function Strawberry() {
  return (
    <group>
      <mesh geometry={body.geometry} material={body.materials} rotation={FLAT_ROTATION} />
      <mesh
        geometry={crown.geometry}
        material={crown.materials}
        rotation={FLAT_ROTATION}
        position={[STRAWBERRY_CROWN.x, lift, -STRAWBERRY_CROWN.y]}
      />
    </group>
  )
}
