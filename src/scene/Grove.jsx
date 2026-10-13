import { useRef } from 'react'
import { Physics } from '@react-three/rapier'
import { useThree } from '@react-three/fiber'
import Arena from './Arena'
import Candy from './Candy'
import { PLACEMENTS, isNarrow } from './layout'

const INITIAL = [
  { id: 'strawberry-a', kind: 'berry' },
  { id: 'strawberry-b', kind: 'berry' },
  { id: 'pear-a', kind: 'orchard' },
  { id: 'pear-b', kind: 'orchard' },
  { id: 'starfruit', kind: 'tropic' },
  { id: 'bloom-a', kind: 'bloom' },
  { id: 'bloom-b', kind: 'bloom' },
  { id: 'bloom-c', kind: 'bloom' },
]

export default function Grove({ drops = [], feel = 'soft', shakeToken = 0, resetToken = 0, paused = false, onGone }) {
  const width = useThree((state) => state.size.width)
  const narrow = isNarrow(width)
  const boundsRef = useRef(null)

  return (
    <Physics gravity={[0, -22, 0]} timeStep={1 / 60} paused={paused} numSolverIterations={4}>
      <Arena boundsRef={boundsRef} />
      {INITIAL.map((piece) => {
        const placement = PLACEMENTS[piece.id]
        return (
          <Candy
            key={`${piece.id}-${narrow ? 'narrow' : 'wide'}`}
            id={piece.id}
            kind={piece.kind}
            home={narrow ? placement.narrow : placement.wide}
            rotation={placement.rotation}
            feel={feel}
            shakeToken={shakeToken}
            resetToken={resetToken}
            boundsRef={boundsRef}
          />
        )
      })}
      {drops.map((drop) => (
        <Candy
          key={drop.id}
          id={drop.id}
          kind={drop.category}
          rotation={(drop.id.length % 7) * 0.2 - 0.6}
          feel={feel}
          shakeToken={shakeToken}
          resetToken={resetToken}
          spawn
          phase={drop.phase}
          boundsRef={boundsRef}
          onGone={onGone}
        />
      ))}
    </Physics>
  )
}
