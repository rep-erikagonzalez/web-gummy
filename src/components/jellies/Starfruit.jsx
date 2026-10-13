import { FLAT_ROTATION, createSlice } from '../../utils/jelly'
import { starfruitShape } from '../../utils/shapes'
import { paintStarfruit } from '../../utils/textures'

const slice = createSlice(starfruitShape(), paintStarfruit, '#b6cc3a', {
  extrude: {
    depth: 0.13,
    bevelThickness: 0.18,
    bevelSize: 0.12,
    bevelSegments: 8,
  },
})

export default function Starfruit() {
  return <mesh geometry={slice.geometry} material={slice.materials} rotation={FLAT_ROTATION} />
}
