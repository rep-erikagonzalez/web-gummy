import { useRef } from 'react'
import { Physics } from '@react-three/rapier'
import { useThree } from '@react-three/fiber'
import Arena from './Arena'
import Candy from './Candy'
import Knife from './Knife'
import { PIECE_SCALE } from './hulls'
import { PLACEMENTS, isNarrow } from './layout'

const PHONE_HIDDEN = new Set(['bloom-b', 'bloom-c'])

export function initialIds(compact) {
  const roster = compact ? INITIAL.filter((piece) => !PHONE_HIDDEN.has(piece.id)) : INITIAL
  return roster.map((piece) => piece.id)
}

const INITIAL = [
  { id: 'strawberry-a', kind: 'berry', serial: 1 },
  { id: 'strawberry-b', kind: 'berry', serial: 2 },
  { id: 'pear-a', kind: 'orchard', serial: 1 },
  { id: 'pear-b', kind: 'orchard', serial: 2 },
  { id: 'starfruit', kind: 'tropic', serial: 1 },
  { id: 'bloom-a', kind: 'bloom', serial: 1 },
  { id: 'bloom-b', kind: 'bloom', serial: 2 },
  { id: 'bloom-c', kind: 'bloom', serial: 3 },
]

export default function Grove({
  drops = [],
  feel = 'soft',
  shakeToken = 0,
  resetToken = 0,
  paused = false,
  onGone,
  scaleMode = false,
  showTags = false,
  poseEpoch = 0,
  knifeMode = false,
  fragments = [],
  severed,
  onCut,
  onFragmentGone,
  compact = false,
  released = [],
  dropIn = false,
  fadeIn = false,
  leaving = false,
  wave = 0,
}) {
  const width = useThree((state) => state.size.width)
  const narrow = isNarrow(width)
  const boundsRef = useRef(null)
  const hidden = severed ?? new Set()
  const visible = new Set(released)
  const roster = compact ? INITIAL.filter((piece) => !PHONE_HIDDEN.has(piece.id)) : INITIAL
  const bodyScale = compact ? PIECE_SCALE * 1.2 : PIECE_SCALE

  return (
    <Physics gravity={[0, -22, 0]} timeStep={1 / 60} paused={paused} numSolverIterations={4}>
      <Arena boundsRef={boundsRef} poseEpoch={poseEpoch} />
      {roster.filter((piece) => visible.has(piece.id) && !hidden.has(piece.id)).map((piece) => {
        const placement = PLACEMENTS[piece.id]
        return (
          <Candy
            key={`${piece.id}-${narrow ? 'narrow' : 'wide'}-${compact ? 'phone' : 'desk'}-${wave}`}
            id={piece.id}
            kind={piece.kind}
            home={narrow ? placement.narrow : placement.wide}
            rotation={placement.rotation}
            feel={feel}
            shakeToken={shakeToken}
            resetToken={resetToken}
            boundsRef={boundsRef}
            serial={piece.serial}
            scaleMode={scaleMode}
            showTags={showTags}
            knifeMode={knifeMode}
            bodyScale={bodyScale}
            phase={leaving ? 'out' : 'in'}
            dropIn={dropIn}
            fadeIn={fadeIn}
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
          serial={drop.serial}
          scaleMode={scaleMode}
          showTags={showTags}
          knifeMode={knifeMode}
          bodyScale={bodyScale}
        />
      ))}
      {fragments.map((fragment) => (
        <Candy
          key={fragment.id}
          id={fragment.id}
          kind={fragment.kind}
          slice={fragment}
          rotation={0}
          feel={feel}
          shakeToken={shakeToken}
          resetToken={resetToken}
          phase={fragment.phase}
          boundsRef={boundsRef}
          onGone={onFragmentGone}
          serial={fragment.serial}
          scaleMode={scaleMode}
          showTags={showTags}
          knifeMode={knifeMode}
          bodyScale={bodyScale}
        />
      ))}
      <Knife active={knifeMode} onCut={onCut} />
    </Physics>
  )
}
