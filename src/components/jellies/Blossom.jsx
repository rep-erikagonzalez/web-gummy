import { FLAT_ROTATION, createSlice } from '../../utils/jelly'
import { blossomShape } from '../../utils/shapes'
import { paintBlossom } from '../../utils/textures'

const slice = createSlice(blossomShape(), paintBlossom, '#c13d6c', {
  extrude: { bevelSize: 0.045, curveSegments: 6 },
})

export default function Blossom() {
  return <mesh geometry={slice.geometry} material={slice.materials} rotation={FLAT_ROTATION} />
}
