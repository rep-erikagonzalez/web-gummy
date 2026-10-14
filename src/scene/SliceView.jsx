import { useEffect, useMemo } from 'react'
import { FLAT_ROTATION } from '../utils/jelly'
import { PEAR_LEAF, PEAR_STEM, STRAWBERRY_CROWN } from '../utils/shapes'
import { berryParts } from '../components/jellies/Strawberry'
import { pearParts } from '../components/jellies/Pear'
import { dropFragment, keepFragment, viewFragment } from './sliceFactory'

export default function SliceView({ spec }) {
  const built = useMemo(() => viewFragment(spec), [spec])

  useEffect(() => {
    keepFragment(spec.id)
    return () => dropFragment(spec.id)
  }, [spec.id])

  const ornaments = spec.ornaments || {}

  return (
    <group>
      <mesh geometry={built.geometry} material={built.materials} rotation={FLAT_ROTATION} />
      {ornaments.crown ? (
        <mesh
          geometry={berryParts.crown.geometry}
          material={berryParts.crown.materials}
          rotation={FLAT_ROTATION}
          position={[STRAWBERRY_CROWN.x, berryParts.lift, -STRAWBERRY_CROWN.y]}
        />
      ) : null}
      {ornaments.stem ? (
        <mesh
          geometry={pearParts.stem.geometry}
          material={pearParts.stem.materials}
          rotation={FLAT_ROTATION}
          position={[PEAR_STEM.x, pearParts.lift, -PEAR_STEM.y]}
        />
      ) : null}
      {ornaments.leaf ? (
        <group position={[PEAR_LEAF.x, pearParts.lift, -PEAR_LEAF.y]} rotation={[0, PEAR_LEAF.yaw, 0]}>
          <mesh geometry={pearParts.leaf.geometry} material={pearParts.leaf.materials} rotation={FLAT_ROTATION} position={[0, 0, -0.12]} />
        </group>
      ) : null}
    </group>
  )
}
