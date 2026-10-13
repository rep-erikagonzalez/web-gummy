import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getContactShadowTexture } from '../utils/textures'

const LIFT = 0.38

function spring(value, velocity, target, dt, stiffness, damping) {
  let nextVelocity = velocity + (target - value) * stiffness * dt
  nextVelocity *= Math.exp(-damping * dt)
  return [value + nextVelocity * dt, nextVelocity]
}

function springVector(current, velocity, target, dt, stiffness, damping) {
  velocity.x += (target.x - current.x) * stiffness * dt
  velocity.y += (target.y - current.y) * stiffness * dt
  velocity.z += (target.z - current.z) * stiffness * dt
  velocity.multiplyScalar(Math.exp(-damping * dt))
  current.addScaledVector(velocity, dt)
}

export default function Draggable({
  homeX,
  homeZ,
  rotation = 0,
  shadow = [0.7, 0.7],
  visible = true,
  filterKey = 'all',
  resetToken = 0,
  index = 0,
  children,
}) {
  const group = useRef(null)
  const shadowGroup = useRef(null)
  const dragging = useRef(false)
  const hovered = useRef(false)
  const visibleRef = useRef(visible)
  const booted = useRef(false)
  const wasVisible = useRef(visible)
  const offset = useRef(new THREE.Vector3())
  const current = useRef(new THREE.Vector3(homeX, 0, homeZ))
  const target = useRef(new THREE.Vector3(homeX, 0, homeZ))
  const velocity = useRef(new THREE.Vector3())
  const homeRef = useRef([homeX, homeZ])
  const pop = useRef(visible ? 1 : 0.001)
  const popTarget = useRef(visible ? 1 : 0)
  const popV = useRef(0)
  const squash = useRef(0)
  const squashV = useRef(0)
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const hit = useRef(new THREE.Vector3())
  const ndc = useRef(new THREE.Vector2())
  const cameraRef = useRef(null)
  const glRef = useRef(null)
  const { camera, gl } = useThree()

  cameraRef.current = camera
  glRef.current = gl
  visibleRef.current = visible

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

  const setCursor = (value) => {
    glRef.current.domElement.style.cursor = value
  }

  const pointOnPlane = (event) => {
    const rect = glRef.current.domElement.getBoundingClientRect()
    ndc.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    ndc.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.current.setFromCamera(ndc.current, cameraRef.current)
    plane.current.constant = 0
    return raycaster.current.ray.intersectPlane(plane.current, hit.current)
  }

  useEffect(() => {
    const root = group.current
    if (root) {
      root.traverse((obj) => {
        if (obj.isMesh) obj.raycast = visible ? THREE.Mesh.prototype.raycast : () => null
      })
    }

    if (!booted.current) {
      booted.current = true
      wasVisible.current = visible
      return undefined
    }

    const was = wasVisible.current
    wasVisible.current = visible

    if (!visible) {
      dragging.current = false
      hovered.current = false
      popTarget.current = 0
      setCursor('auto')
      return undefined
    }

    if (was) {
      pop.current = Math.min(pop.current, 0.9)
      popV.current = 1.8
      popTarget.current = 1
      return undefined
    }

    pop.current = 0.02
    popV.current = 0
    popTarget.current = 0
    const id = window.setTimeout(() => {
      popTarget.current = 1
    }, 30 + index * 55)
    return () => window.clearTimeout(id)
  }, [visible, filterKey, index])

  useEffect(() => {
    const moved = homeRef.current[0] !== homeX || homeRef.current[1] !== homeZ
    homeRef.current = [homeX, homeZ]
    if (!moved) return
    dragging.current = false
    target.current.set(homeX, 0, homeZ)
    if (!visibleRef.current) {
      current.current.set(homeX, 0, homeZ)
      velocity.current.set(0, 0, 0)
    }
  }, [homeX, homeZ])

  useEffect(() => {
    if (resetToken === 0) return
    dragging.current = false
    hovered.current = false
    const [x, z] = homeRef.current
    target.current.set(x, 0, z)
    velocity.current.set(0, 0, 0)
    setCursor('auto')
  }, [resetToken])

  useEffect(() => {
    const onMove = (event) => {
      if (!dragging.current || !pointOnPlane(event)) return
      target.current.set(hit.current.x - offset.current.x, LIFT, hit.current.z - offset.current.z)
    }

    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      target.current.set(current.current.x, 0, current.current.z)
      squash.current = 0
      squashV.current = 3.2
      setCursor(hovered.current ? 'grab' : 'auto')
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      setCursor('auto')
    }
  }, [])

  useFrame((_, delta) => {
    if (!group.current || !shadowGroup.current) return
    const step = Math.min(delta, 0.033)
    const active = dragging.current

    springVector(current.current, velocity.current, target.current, step, active ? 520 : 84, active ? 24 : 12)

    const hiding = popTarget.current < 0.5
    const [nextPop, nextPopV] = spring(pop.current, popV.current, popTarget.current, step, hiding ? 270 : 148, hiding ? 18 : 7.4)
    pop.current = nextPop
    popV.current = nextPopV

    const [nextSquash, nextSquashV] = spring(
      squash.current,
      squashV.current,
      0,
      step,
      active ? 420 : 310,
      active ? 22 : 6.4,
    )
    squash.current = Math.abs(nextSquash) < 0.0008 && Math.abs(nextSquashV) < 0.01 && !active ? 0 : nextSquash
    squashV.current = squash.current === 0 && !active && Math.abs(nextSquashV) < 0.01 ? 0 : nextSquashV

    const show = Math.max(pop.current, 0)
    group.current.position.copy(current.current)
    group.current.rotation.set(0, rotation, 0)
    group.current.scale.set(show * (1 + squash.current), show, show * (1 - squash.current))
    group.current.visible = show > 0.02 || popTarget.current > 0.5

    const lift = Math.max(current.current.y, 0)
    const spread = 1 + lift * 2.15
    shadowGroup.current.position.set(current.current.x, 0.012, current.current.z)
    shadowGroup.current.rotation.y = rotation
    shadowGroup.current.scale.set(shadow[0] * spread, 1, shadow[1] * spread)
    shadowGroup.current.visible = group.current.visible
    shadowMaterial.opacity = 0.92 * Math.min(show, 1) * (1 - Math.min(lift, 0.45) * 0.28)
  })

  return (
    <group>
      <group ref={shadowGroup} position={[homeX, 0.012, homeZ]} renderOrder={-2}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null} renderOrder={-2}>
          <circleGeometry args={[1, 48]} />
          <primitive object={shadowMaterial} attach="material" />
        </mesh>
      </group>
      <group
        ref={group}
        position={[homeX, 0, homeZ]}
        rotation={[0, rotation, 0]}
        onPointerOver={(event) => {
          event.stopPropagation()
          if (!visibleRef.current) return
          hovered.current = true
          if (!dragging.current) setCursor('grab')
        }}
        onPointerOut={() => {
          hovered.current = false
          if (!dragging.current) setCursor('auto')
        }}
        onPointerDown={(event) => {
          event.stopPropagation()
          if (!visibleRef.current || (event.button != null && event.button !== 0)) return
          const native = event.nativeEvent
          if (!pointOnPlane(native)) return
          dragging.current = true
          offset.current.set(hit.current.x - current.current.x, 0, hit.current.z - current.current.z)
          target.current.y = LIFT
          squashV.current = 0
          setCursor('grabbing')
        }}
      >
        {children}
      </group>
    </group>
  )
}
