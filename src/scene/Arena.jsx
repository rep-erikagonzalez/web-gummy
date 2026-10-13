import { useLayoutEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { CoefficientCombineRule, CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

const scratch = new THREE.Vector3()
const origin = new THREE.Vector3()
const direction = new THREE.Vector3()

function groundAt(camera, ndcX, ndcY, target) {
  origin.copy(camera.position)
  scratch.set(ndcX, ndcY, 0.5).unproject(camera)
  direction.copy(scratch).sub(origin)
  const distance = direction.y === 0 ? 0 : -origin.y / direction.y
  return target.set(origin.x + direction.x * distance, 0, origin.z + direction.z * distance)
}

export default function Arena({ boundsRef }) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const [box, setBox] = useState(null)

  useLayoutEffect(() => {
    camera.updateMatrixWorld(true)
    const points = [
      groundAt(camera, -1, 1, new THREE.Vector3()),
      groundAt(camera, 1, 1, new THREE.Vector3()),
      groundAt(camera, -1, -1, new THREE.Vector3()),
      groundAt(camera, 1, -1, new THREE.Vector3()),
    ]
    const inset = 0.55
    const next = {
      minX: Math.min(...points.map((point) => point.x)) + inset,
      maxX: Math.max(...points.map((point) => point.x)) - inset,
      minZ: Math.min(...points.map((point) => point.z)) + inset,
      maxZ: Math.max(...points.map((point) => point.z)) - inset,
    }
    if (next.maxX - next.minX < 1 || next.maxZ - next.minZ < 1) return
    boundsRef.current = next
    setBox(next)
  }, [boundsRef, camera, size])

  if (!box) return null

  const centerX = (box.minX + box.maxX) / 2
  const centerZ = (box.minZ + box.maxZ) / 2
  const halfX = (box.maxX - box.minX) / 2
  const halfZ = (box.maxZ - box.minZ) / 2
  const wallHeight = 8
  const thick = 0.4

  return (
    <group>
      <RigidBody type="fixed" position={[centerX, -1.5, centerZ]} colliders={false}>
        <CuboidCollider
          args={[halfX + 2, 1.5, halfZ + 2]}
          friction={0.62}
          restitution={1}
          restitutionCombineRule={CoefficientCombineRule.Min}
        />
      </RigidBody>
      <RigidBody type="fixed" position={[box.minX - thick, wallHeight / 2, centerZ]} colliders={false}>
        <CuboidCollider args={[thick, wallHeight / 2, halfZ + thick]} />
      </RigidBody>
      <RigidBody type="fixed" position={[box.maxX + thick, wallHeight / 2, centerZ]} colliders={false}>
        <CuboidCollider args={[thick, wallHeight / 2, halfZ + thick]} />
      </RigidBody>
      <RigidBody type="fixed" position={[centerX, wallHeight / 2, box.minZ - thick]} colliders={false}>
        <CuboidCollider args={[halfX + thick * 2, wallHeight / 2, thick]} />
      </RigidBody>
      <RigidBody type="fixed" position={[centerX, wallHeight / 2, box.maxZ + thick]} colliders={false}>
        <CuboidCollider args={[halfX + thick * 2, wallHeight / 2, thick]} />
      </RigidBody>
    </group>
  )
}
