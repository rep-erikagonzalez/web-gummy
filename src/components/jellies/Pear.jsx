import { FLAT_ROTATION, createSlice, sliceHeight } from '../../utils/jelly'
import { PEAR_LEAF, PEAR_STEM, pearLeafShape, pearShape, pearStemShape } from '../../utils/shapes'
import { paintLeaf, paintPear, paintStem } from '../../utils/textures'

const body = createSlice(pearShape(), paintPear, '#b5c93a')
const stem = createSlice(pearStemShape(), paintStem, '#6b4423', {
  extrude: {
    depth: 0.04,
    bevelThickness: 0.035,
    bevelSize: 0.018,
    bevelSegments: 3,
    curveSegments: 8,
  },
  transmission: 0.08,
  thickness: 0.12,
  skinRoughness: 0.34,
  faceRoughness: 0.3,
  clearcoat: 0.55,
  polygonOffset: true,
  textureSize: 256,
})
const leaf = createSlice(pearLeafShape(), paintLeaf, '#3f8f34', {
  extrude: {
    depth: 0.04,
    bevelThickness: 0.045,
    bevelSize: 0.03,
    bevelSegments: 4,
    curveSegments: 10,
  },
  transmission: 0.14,
  thickness: 0.16,
  polygonOffset: true,
  textureSize: 512,
})

const lift = sliceHeight() - 0.016

export default function Pear() {
  return (
    <group>
      <mesh geometry={body.geometry} material={body.materials} rotation={FLAT_ROTATION} />
      <mesh
        geometry={stem.geometry}
        material={stem.materials}
        rotation={FLAT_ROTATION}
        position={[PEAR_STEM.x, lift, -PEAR_STEM.y]}
      />
      <group position={[PEAR_LEAF.x, lift, -PEAR_LEAF.y]} rotation={[0, PEAR_LEAF.yaw, 0]}>
        <mesh geometry={leaf.geometry} material={leaf.materials} rotation={FLAT_ROTATION} position={[0, 0, -0.12]} />
      </group>
    </group>
  )
}
