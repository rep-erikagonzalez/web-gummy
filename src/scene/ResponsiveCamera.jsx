import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_TILT, frameOf } from './layout'

const VIEW_TILT = Math.PI / 4
const VIEW_MS = 1000

function poseOf(width, height, angled) {
  const frame = frameOf(width, height)
  const tilt = angled ? VIEW_TILT : CAMERA_TILT
  const distance = frame.distance * (angled ? 1.12 : 1)
  const [x, , z] = frame.lookAt
  return {
    fov: frame.fov,
    far: Math.max(90, distance * 4),
    position: new THREE.Vector3(x, Math.cos(tilt) * distance, z + Math.sin(tilt) * distance),
    lookAt: new THREE.Vector3(x, 0, z),
  }
}

function applyPose(camera, pose) {
  camera.fov = pose.fov
  camera.far = pose.far
  camera.position.copy(pose.position)
  camera.lookAt(pose.lookAt)
  camera.updateProjectionMatrix()
}

export default function ResponsiveCamera({ angled = false, onSettled }) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const ready = useRef(false)
  const mode = useRef(angled)
  const anim = useRef(null)
  const look = useRef(new THREE.Vector3())
  const onSettledRef = useRef(onSettled)
  onSettledRef.current = onSettled

  useLayoutEffect(() => {
    const next = poseOf(size.width, size.height, angled)
    if (!ready.current) {
      applyPose(camera, next)
      ready.current = true
      mode.current = angled
      return
    }
    if (mode.current === angled) {
      applyPose(camera, next)
      anim.current = null
      return
    }
    mode.current = angled
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      applyPose(camera, next)
      anim.current = null
      onSettledRef.current?.()
      return
    }
    anim.current = {
      from: camera.position.clone(),
      to: next.position,
      lookAt: next.lookAt,
      fov: next.fov,
      far: next.far,
      fromFov: camera.fov,
      start: performance.now(),
    }
  }, [angled, camera, size])

  useFrame(() => {
    const slide = anim.current
    if (!slide) return
    const t = Math.min(1, (performance.now() - slide.start) / VIEW_MS)
    const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2
    camera.position.lerpVectors(slide.from, slide.to, eased)
    look.current.copy(slide.lookAt)
    camera.lookAt(look.current)
    camera.fov = slide.fromFov + (slide.fov - slide.fromFov) * eased
    camera.far = slide.far
    camera.updateProjectionMatrix()
    if (t >= 1) {
      anim.current = null
      onSettledRef.current?.()
    }
  })

  return null
}
