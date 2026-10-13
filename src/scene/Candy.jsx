import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ConvexHullCollider, RigidBody, useBeforePhysicsStep } from '@react-three/rapier'
import * as THREE from 'three'
import Blossom from '../components/jellies/Blossom'
import Pear from '../components/jellies/Pear'
import Starfruit from '../components/jellies/Starfruit'
import Strawberry from '../components/jellies/Strawberry'
import { getContactShadowTexture } from '../utils/textures'
import { HULLS, PIECE_SCALE, restHeight } from './hulls'

const BODY_DYNAMIC = 0
const BODY_KINEMATIC = 2
const STEP = 1 / 60

const KINDS = {
  berry: { Component: Strawberry, shadow: [0.7, 0.82] },
  orchard: { Component: Pear, shadow: [0.66, 0.86] },
  bloom: { Component: Blossom, shadow: [0.68, 0.68] },
  tropic: { Component: Starfruit, shadow: [0.72, 0.72] },
}

const FEEL = {
  soft: { restitution: 0.84, friction: 0.26, linearDamping: 0.72, angularDamping: 0.86 },
  hard: { restitution: 0.04, friction: 0.92, linearDamping: 0.18, angularDamping: 0.3 },
}

let activeDrag = null

function spring(value, velocity, target, dt, stiffness, damping) {
  let nextVelocity = velocity + (target - value) * stiffness * dt
  nextVelocity *= Math.exp(-damping * dt)
  return [value + nextVelocity * dt, nextVelocity]
}

function Candy({
  id,
  kind,
  home = null,
  rotation = 0,
  feel,
  shakeToken,
  resetToken,
  spawn = false,
  phase = 'in',
  boundsRef,
  onGone,
}) {
  const { Component, shadow } = KINDS[kind]
  const body = useRef(null)
  const collider = useRef(null)
  const visual = useRef(null)
  const shadowGroup = useRef(null)
  const dragging = useRef(false)
  const hovered = useRef(false)
  const phaseRef = useRef(phase)
  const feelRef = useRef(feel)
  const onGoneRef = useRef(onGone)
  const gone = useRef(false)
  const holdRot = useRef(new THREE.Quaternion())
  const spinQuat = useRef(new THREE.Quaternion())
  const lastShake = useRef(0)
  const desired = useRef(new THREE.Vector3())
  const last = useRef(new THREE.Vector3())
  const dragVel = useRef(new THREE.Vector3())
  const pop = useRef(1)
  const popV = useRef(0)
  const popTarget = useRef(1)
  const squash = useRef(0)
  const squashV = useRef(0)
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const hit = useRef(new THREE.Vector3())
  const ndc = useRef(new THREE.Vector2())
  const euler = useRef(new THREE.Euler())
  const { camera, gl } = useThree()
  const cameraRef = useRef(camera)
  const glRef = useRef(gl)
  const restY = restHeight(kind)
  const homeRot = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotation, 0)), [rotation])

  phaseRef.current = phase
  feelRef.current = feel
  onGoneRef.current = onGone
  cameraRef.current = camera
  glRef.current = gl

  const start = useMemo(() => {
    if (!spawn) return [home[0], restY, home[1]]
    const bounds = boundsRef?.current
    const minX = bounds?.minX ?? -3.2
    const maxX = bounds?.maxX ?? 4.6
    const minZ = bounds?.minZ ?? -3.2
    const span = Math.max(0.4, maxX - minX - 1.2)
    return [minX + 0.6 + Math.random() * span, 6.4 + Math.random() * 1.6, minZ + 0.35 + Math.random() * 0.7]
  }, [boundsRef, home, restY, spawn])

  const shadowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        opacity: 0.9,
      }),
    [],
  )

  useEffect(() => () => shadowMaterial.dispose(), [shadowMaterial])

  const pointOnPlane = (event, height) => {
    const rect = glRef.current.domElement.getBoundingClientRect()
    ndc.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    ndc.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    plane.current.constant = -height
    raycaster.current.setFromCamera(ndc.current, cameraRef.current)
    return raycaster.current.ray.intersectPlane(plane.current, hit.current)
  }

  const release = () => {
    const rigid = body.current
    dragging.current = false
    if (activeDrag === id) activeDrag = null
    if (!rigid) return
    rigid.setBodyType(BODY_DYNAMIC, true)
    const velocity = dragVel.current
    const speed = Math.hypot(velocity.x, velocity.y, velocity.z)
    const limit = 16
    const scale = speed > limit ? limit / speed : 1
    rigid.setLinvel({ x: velocity.x * scale, y: velocity.y * scale, z: velocity.z * scale }, true)
    rigid.wakeUp()
    if (feelRef.current === 'soft') squashV.current = 3.2
    glRef.current.domElement.style.cursor = hovered.current ? 'grab' : 'auto'
  }

  useBeforePhysicsStep(() => {
    const rigid = body.current
    if (!dragging.current || !rigid) return
    const prev = rigid.translation()
    const next = {
      x: desired.current.x,
      y: prev.y + (desired.current.y - prev.y) * 0.42,
      z: desired.current.z,
    }
    dragVel.current.set((next.x - last.current.x) / STEP, (next.y - last.current.y) / STEP, (next.z - last.current.z) / STEP)
    last.current.set(next.x, next.y, next.z)
    rigid.setNextKinematicTranslation(next)
    rigid.setNextKinematicRotation(holdRot.current)
  })

  useEffect(() => {
    const rigid = body.current
    const shape = collider.current
    if (!rigid || !shape) return undefined
    const settings = FEEL[feel] ?? FEEL.soft
    rigid.setLinearDamping(settings.linearDamping)
    rigid.setAngularDamping(settings.angularDamping)
    shape.setRestitution(settings.restitution)
    shape.setFriction(settings.friction)
    if (feel === 'hard') {
      squash.current = 0
      squashV.current = 0
    }
    return undefined
  }, [feel])

  useEffect(() => {
    if (!shakeToken || lastShake.current === shakeToken || !body.current || phaseRef.current === 'out') return undefined
    lastShake.current = shakeToken
    const rigid = body.current
    rigid.applyImpulse(
      {
        x: (Math.random() - 0.5) * 1.6,
        y: 2.4 + Math.random() * 2.2,
        z: (Math.random() - 0.5) * 1.6,
      },
      true,
    )
    rigid.applyTorqueImpulse(
      {
        x: (Math.random() - 0.5) * 0.35,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.35,
      },
      true,
    )
    rigid.wakeUp()
    return undefined
  }, [shakeToken])

  useEffect(() => {
    if (!resetToken || spawn || !body.current || !home) return undefined
    if (dragging.current) release()
    const rigid = body.current
    rigid.setBodyType(BODY_DYNAMIC, true)
    rigid.setTranslation({ x: home[0], y: restY + 0.04, z: home[1] }, true)
    rigid.setRotation({ x: homeRot.x, y: homeRot.y, z: homeRot.z, w: homeRot.w }, true)
    rigid.setLinvel({ x: 0, y: 0, z: 0 }, true)
    rigid.setAngvel({ x: 0, y: 0, z: 0 }, true)
    rigid.wakeUp()
    squash.current = 0
    squashV.current = 0
    return undefined
  }, [home, homeRot, resetToken, restY, spawn])

  useEffect(() => {
    if (phase !== 'out') return undefined
    if (dragging.current) release()
    try {
      body.current?.setEnabled(false)
    } catch {
      /* The body can already be gone while the shrink plays out. */
    }
    popTarget.current = 0
    const finish = () => {
      if (gone.current) return
      gone.current = true
      onGoneRef.current?.(id)
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return undefined
    }
    const timer = window.setTimeout(finish, 480)
    return () => window.clearTimeout(timer)
  }, [id, phase])

  useEffect(() => () => {
    if (activeDrag === id) activeDrag = null
  }, [id])

  useFrame((_, delta) => {
    const rigid = body.current
    const step = Math.min(delta, 0.033)
    const hiding = popTarget.current < 0.5
    const [nextPop, nextPopV] = spring(pop.current, popV.current, popTarget.current, step, hiding ? 280 : 160, hiding ? 18 : 8)
    pop.current = nextPop
    popV.current = nextPopV

    const soft = feelRef.current === 'soft'
    const [nextSquash, nextSquashV] = spring(squash.current, squashV.current, 0, step, soft ? 310 : 420, soft ? 6.4 : 9)
    squash.current = !soft || (Math.abs(nextSquash) < 0.0008 && Math.abs(nextSquashV) < 0.01) ? 0 : nextSquash
    squashV.current = squash.current === 0 ? 0 : nextSquashV

    const show = Math.max(pop.current, 0)
    if (visual.current) {
      const stretch = soft ? Math.max(-0.34, Math.min(0.34, squash.current)) : 0
      visual.current.scale.set(show * (1 + stretch), show, show * (1 - stretch))
      visual.current.visible = show > 0.02 || popTarget.current > 0.5
    }

    if (phaseRef.current === 'out' && pop.current < 0.04 && !gone.current) {
      gone.current = true
      onGoneRef.current?.(id)
    }

    if (phaseRef.current === 'out' || !rigid || !shadowGroup.current) return
    const place = rigid.translation()
    const lift = Math.max(place.y - restY, 0)
    const spread = 1 + Math.min(lift, 1.2) * 1.6
    shadowGroup.current.position.set(place.x, 0.012, place.z)
    const spin = rigid.rotation()
    spinQuat.current.set(spin.x, spin.y, spin.z, spin.w)
    euler.current.setFromQuaternion(dragging.current ? holdRot.current : spinQuat.current)
    shadowGroup.current.rotation.y = euler.current.y
    shadowGroup.current.scale.set(shadow[0] * spread * show, 1, shadow[1] * spread * show)
    shadowGroup.current.visible = show > 0.02
    shadowMaterial.opacity = 0.9 * Math.min(show, 1) * (1 - Math.min(lift, 0.8) * 0.35)
  })

  const settings = FEEL[feel] ?? FEEL.soft

  return (
    <>
      <group ref={shadowGroup} position={[start[0], 0.012, start[2]]} renderOrder={-2}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null} renderOrder={-2}>
          <circleGeometry args={[1, 40]} />
          <primitive object={shadowMaterial} attach="material" />
        </mesh>
      </group>
      <RigidBody
        ref={body}
        position={start}
        rotation={[0, rotation, 0]}
        scale={PIECE_SCALE}
        colliders={false}
        canSleep
        linearDamping={settings.linearDamping}
        angularDamping={settings.angularDamping}
        linearVelocity={spawn ? [(Math.random() - 0.5) * 1.4, -0.4, 1.1] : [0, 0, 0]}
        onCollisionEnter={() => {
          const rigid = body.current
          if (!rigid || feelRef.current !== 'soft' || dragging.current) return
          const velocity = rigid.linvel()
          const speed = Math.hypot(velocity.x, velocity.y, velocity.z)
          if (speed < 1.6) return
          squashV.current = Math.min(9, 3.4 + speed * 0.55)
        }}
      >
        <ConvexHullCollider
          ref={collider}
          args={[HULLS[kind].points]}
          restitution={settings.restitution}
          friction={settings.friction}
        />
        <group
          ref={visual}
          onPointerOver={(event) => {
            event.stopPropagation()
            if (phaseRef.current === 'out') return
            hovered.current = true
            if (!dragging.current) glRef.current.domElement.style.cursor = 'grab'
          }}
          onPointerOut={() => {
            hovered.current = false
            if (!dragging.current) glRef.current.domElement.style.cursor = 'auto'
          }}
          onPointerDown={(event) => {
            event.stopPropagation()
            const rigid = body.current
            if (!rigid || phaseRef.current === 'out' || activeDrag || (event.button != null && event.button !== 0)) return
            const native = event.nativeEvent
            const place = rigid.translation()
            const dragY = Math.max(place.y + 0.55, 1.15)
            if (!pointOnPlane(native, dragY)) return
            const offsetX = hit.current.x - place.x
            const offsetZ = hit.current.z - place.z
            const rot = rigid.rotation()
            activeDrag = id
            dragging.current = true
            holdRot.current.set(rot.x, rot.y, rot.z, rot.w)
            last.current.set(place.x, place.y, place.z)
            desired.current.set(place.x, dragY, place.z)
            dragVel.current.set(0, 0, 0)
            rigid.setBodyType(BODY_KINEMATIC, true)
            rigid.setAngvel({ x: 0, y: 0, z: 0 }, true)
            rigid.wakeUp()
            glRef.current.domElement.style.cursor = 'grabbing'

            const onMove = (pointer) => {
              if (!dragging.current || !pointOnPlane(pointer, desired.current.y)) return
              desired.current.x = hit.current.x - offsetX
              desired.current.z = hit.current.z - offsetZ
            }
            const onUp = () => {
              window.removeEventListener('pointermove', onMove)
              window.removeEventListener('pointerup', onUp)
              window.removeEventListener('pointercancel', onUp)
              if (dragging.current) release()
            }
            window.addEventListener('pointermove', onMove)
            window.addEventListener('pointerup', onUp)
            window.addEventListener('pointercancel', onUp)
          }}
        >
          <Component />
        </group>
      </RigidBody>
    </>
  )
}

export default Candy
