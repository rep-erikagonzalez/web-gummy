import { useThree } from '@react-three/fiber'
import Blossom from '../components/jellies/Blossom'
import Pear from '../components/jellies/Pear'
import Starfruit from '../components/jellies/Starfruit'
import Strawberry from '../components/jellies/Strawberry'
import Draggable from './Draggable'
import { PLACEMENTS, isNarrow } from './layout'

const PIECE_SCALE = 0.87

const PIECES = [
  { id: 'strawberry-a', category: 'berry', Component: Strawberry },
  { id: 'strawberry-b', category: 'berry', Component: Strawberry },
  { id: 'pear-a', category: 'orchard', Component: Pear },
  { id: 'pear-b', category: 'orchard', Component: Pear },
  { id: 'starfruit', category: 'tropic', Component: Starfruit },
  { id: 'bloom-a', category: 'bloom', Component: Blossom },
  { id: 'bloom-b', category: 'bloom', Component: Blossom },
  { id: 'bloom-c', category: 'bloom', Component: Blossom },
]

export default function Grove({ category, resetToken }) {
  const width = useThree((state) => state.size.width)
  const narrow = isNarrow(width)
  const filterKey = category ?? 'all'

  return (
    <group>
      {PIECES.map((piece, index) => {
        const placement = PLACEMENTS[piece.id]
        const home = narrow ? placement.narrow : placement.wide
        const Piece = piece.Component
        const shown = category == null || category === piece.category
        return (
          <Draggable
            key={piece.id}
            homeX={home[0]}
            homeZ={home[1]}
            rotation={placement.rotation}
            shadow={placement.shadow}
            visible={shown}
            filterKey={filterKey}
            resetToken={resetToken}
            index={index}
          >
            <group scale={PIECE_SCALE}>
              <Piece />
            </group>
          </Draggable>
        )
      })}
    </group>
  )
}
