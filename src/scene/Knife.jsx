import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sliceHeight } from '../utils/jelly'
import { getContactShadowTexture } from '../utils/textures'
import { advanceCut, createCutState, evaluateCut, tooSmallToCut } from './cut'
import { PIECE_SCALE, restHeight } from './hulls'
import { eachPiece } from './pieces'
import { PULP, makeHalves } from './sliceFactory'

const FACE = {
  berry: sliceHeight(),
  orchard: sliceHeight(),
  bloom: sliceHeight(),
  tropic: sliceHeight({ depth: 0.13, bevelThickness: 0.18 }),
}
const FACE_Y =
  ['berry', 'orchard', 'bloom', 'tropic'].reduce((sum, kind) => sum + restHeight(kind) + FACE[kind] * PIECE_SCALE, 0) / 4
const KNIFE_SCALE = 1.6
const EDGE_OFFSET = [-0.4143 * KNIFE_SCALE, 0.0611 * KNIFE_SCALE, 0]
const TRAIL_MS = 250
const TRAIL_LIMIT = 64

function dampAngle(current, target, lambda, dt) {
  let delta = target - current
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  return current + delta * (1 - Math.exp(-lambda * Math.max(dt, 0)))
}

function KnifeModel() {
  const blade = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.02, 0.055)
    shape.lineTo(0.7, 0.02)
    shape.lineTo(0.84, 0)
    shape.lineTo(0.7, -0.05)
    shape.lineTo(-0.02, -0.078)
    shape.quadraticCurveTo(-0.08, -0.01, -0.02, 0.055)
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.028,
      bevelEnabled: true,
      bevelThickness: 0.007,
      bevelSize: 0.006,
      bevelSegments: 2,
      curveSegments: 6,
    })
    geometry.translate(0, 0, -0.014)
    return geometry
  }, [])
  const metal = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#c5ccd4',
        metalness: 0.92,
        roughness: 0.18,
        clearcoat: 0.7,
        clearcoatRoughness: 0.12,
        envMapIntensity: 1.35,
        specularIntensity: 1,
      }),
    [],
  )
  const handle = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#3a2416',
        metalness: 0.04,
        roughness: 0.52,
        clearcoat: 0.25,
        clearcoatRoughness: 0.45,
      }),
    [],
  )
  const rivet = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#e6ebf1',
        metalness: 0.85,
        roughness: 0.22,
        envMapIntensity: 1.1,
      }),
    [],
  )

  useEffect(
    () => () => {
      blade.dispose()
      metal.dispose()
      handle.dispose()
      rivet.dispose()
    },
    [blade, handle, metal, rivet],
  )

  return (
    <group>
      <mesh geometry={blade} material={metal} castShadow raycast={() => null} />
      <mesh material={handle} position={[-0.28, -0.012, 0]} castShadow raycast={() => null}>
        <boxGeometry args={[0.42, 0.09, 0.07]} />
      </mesh>
      <mesh material={metal} position={[-0.08, -0.004, 0]} raycast={() => null}>
        <boxGeometry args={[0.06, 0.12, 0.05]} />
      </mesh>
      {[-0.18, -0.3, -0.42].map((x) => (
        <mesh key={x} material={rivet} position={[x, 0.02, 0.028]} raycast={() => null}>
          <sphereGeometry args={[0.022, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}

export default function Knife({ active, onCut }) {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const rig = useRef(null)
  const tilt = useRef(null)
  const shadow = useRef(null)
  const trailMesh = useRef(null)
  const dropsMesh = useRef(null)
  const aim = useRef({ x: 0, y: 0, inside: false, seen: false })
  const pose = useRef(new THREE.Vector3())
  const posed = useRef(false)
  const prevHit = useRef(new THREE.Vector3())
  const velocity = useRef(new THREE.Vector2())
  const yaw = useRef(-0.4)
  const desiredYaw = useRef(-0.4)
  const yawTravel = useRef(0)
  const lastYawClient = useRef({ x: 0, y: 0, ready: false })
  const hovering = useRef(false)
  const cutting = useRef(false)
  const anchor = useRef(null)
  const tracks = useRef(new Map())
  const stroke = useRef([])
  const trail = useRef([])
  const kick = useRef(0)
  const applied = useRef(new THREE.Vector3())
  const base = useRef(new THREE.Vector3())
  const shaking = useRef(false)
  const onCutRef = useRef(onCut)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const knifePlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -FACE_Y), [])
  const knifeHit = useMemo(() => new THREE.Vector3(), [])
  const holdA = useMemo(() => new THREE.Vector3(), [])
  const holdB = useMemo(() => new THREE.Vector3(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const viewRay = useMemo(() => new THREE.Ray(), [])
  const dropDummy = useMemo(() => new THREE.Object3D(), [])
  const drops = useRef(
    Array.from({ length: 32 }, () => ({
      life: 0,
      max: 0.55,
      p: new THREE.Vector3(),
      v: new THREE.Vector3(),
      color: new THREE.Color(),
      size: 0.04,
    })),
  )
  const trailGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_LIMIT * 18), 3))
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(TRAIL_LIMIT * 6), 1))
    geometry.setDrawRange(0, 0)
    return geometry
  }, [])
  const trailMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        vertexShader: `
          attribute float aAlpha;
          varying float vAlpha;
          void main() {
            vAlpha = aAlpha;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying float vAlpha;
          void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha);
          }
        `,
      }),
    [],
  )
  const shadowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        opacity: 0.45,
      }),
    [],
  )
  const dropMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.28,
        metalness: 0,
        transparent: true,
        opacity: 0.92,
      }),
    [],
  )
  const dropGeometry = useMemo(() => new THREE.SphereGeometry(1, 10, 8), [])
  onCutRef.current = onCut

  useEffect(
    () => () => {
      trailGeometry.dispose()
      trailMaterial.dispose()
      shadowMaterial.dispose()
      dropMaterial.dispose()
      dropGeometry.dispose()
    },
    [dropGeometry, dropMaterial, shadowMaterial, trailGeometry, trailMaterial],
  )

  useEffect(() => {
    const canvas = gl.domElement
    if (!active) {
      cutting.current = false
      anchor.current = null
      canvas.style.cursor = ''
      canvas.style.touchAction = ''
      return undefined
    }
    const previousCursor = canvas.style.cursor
    const previousTouch = canvas.style.touchAction
    canvas.style.cursor = 'none'
    canvas.style.touchAction = 'none'
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const project = (clientX, clientY, target) => {
      const rect = canvas.getBoundingClientRect()
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      return raycaster.ray.intersectPlane(knifePlane, target) ? target : null
    }

    const burst = (point, color) => {
      for (let index = 0; index < 8; index += 1) {
        const drop = drops.current.find((item) => item.life <= 0) || drops.current[0]
        drop.life = reduced ? 0.12 : 0.5 + Math.random() * 0.12
        drop.max = drop.life
        drop.size = 0.028 + Math.random() * 0.028
        drop.p.copy(point)
        drop.v.set((Math.random() - 0.5) * 1.5, 1.1 + Math.random() * 1.5, (Math.random() - 0.5) * 1.5)
        drop.color.set(color)
      }
    }

    const cutSample = (from, to) => {
      const born = []
      const removed = []
      const fromHit = project(from.x, from.y, knifeHit)
      if (!fromHit) return
      holdA.copy(fromHit)
      const toHit = project(to.x, to.y, knifeHit)
      if (!toHit) return
      holdB.copy(toHit)
      const fromWorld = holdA
      const toWorld = holdB
      stroke.current.push([toWorld.x, toWorld.y, toWorld.z])
      if (stroke.current.length > 240) stroke.current.shift()
      eachPiece((api) => {
        if (api.spent || !api.cuttable()) return
        viewRay.origin.copy(camera.position)
        viewRay.direction.copy(fromWorld).sub(camera.position)
        if (viewRay.direction.lengthSq() < 1e-8) return
        viewRay.direction.normalize()
        const start = api.toShapeRay ? api.toShapeRay(viewRay) : api.toShape(fromWorld)
        viewRay.origin.copy(camera.position)
        viewRay.direction.copy(toWorld).sub(camera.position)
        if (viewRay.direction.lengthSq() < 1e-8) return
        viewRay.direction.normalize()
        const end = api.toShapeRay ? api.toShapeRay(viewRay) : api.toShape(toWorld)
        if (!start || !end) return
        let track = tracks.current.get(api.id)
        if (!track) {
          track = { state: createCutState(), last: start }
          tracks.current.set(api.id, track)
          advanceCut(track.state, start, start, api.outline())
        }
        const result = advanceCut(track.state, track.last, end, api.outline())
        track.last = end
        if (!result) return
        const cut = evaluateCut(api.outline(), result)
        if (!cut) {
          track.state = createCutState()
          advanceCut(track.state, end, end, api.outline())
          return
        }
        const snapshot = api.snapshot()
        if (!snapshot || tooSmallToCut(snapshot.area, snapshot.originArea)) {
          track.state = createCutState()
          advanceCut(track.state, end, end, api.outline())
          return
        }
        try {
          const halves = makeHalves(snapshot, cut)
          api.spent = true
          removed.push(api.id)
          born.push(...halves)
          const mid = [(cut.cutPath[0][0] + cut.cutPath[1][0]) * 0.5, (cut.cutPath[0][1] + cut.cutPath[1][1]) * 0.5]
          burst(api.toWorld(mid[0], mid[1]), PULP[snapshot.kind])
          if (!reduced) kick.current = 0.042
        } catch {
          track.state = createCutState()
          advanceCut(track.state, end, end, api.outline())
        }
      })
      if (born.length) onCutRef.current?.(born, removed)
    }

    const onDown = (event) => {
      if (event.button != null && event.button !== 0) return
      if (event.target !== canvas) return
      cutting.current = true
      tracks.current = new Map()
      stroke.current = []
      trail.current = []
      anchor.current = { x: event.clientX, y: event.clientY }
      aim.current.x = event.clientX
      aim.current.y = event.clientY
      aim.current.seen = true
      aim.current.inside = true
    }
    const onEnter = () => {
      hovering.current = true
    }
    const onLeave = () => {
      hovering.current = false
    }
    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      hovering.current = inside || cutting.current
      aim.current.x = event.clientX
      aim.current.y = event.clientY
      aim.current.inside = hovering.current
      aim.current.seen = true
      if (!cutting.current || !anchor.current) return
      if (event.pointerType === 'touch') event.preventDefault()
      const coalesced = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : null
      const samples = coalesced && coalesced.length ? coalesced : [event]
      for (const sample of samples) {
        const next = { x: sample.clientX, y: sample.clientY }
        if (Math.hypot(next.x - anchor.current.x, next.y - anchor.current.y) < 0.4) continue
        cutSample(anchor.current, next)
        anchor.current = next
      }
    }
    const onUp = () => {
      cutting.current = false
      anchor.current = null
      tracks.current = new Map()
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerenter', onEnter)
    canvas.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      cutting.current = false
      anchor.current = null
      canvas.style.cursor = previousCursor
      canvas.style.touchAction = previousTouch
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerenter', onEnter)
      canvas.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [active, camera, gl, holdA, holdB, knifeHit, knifePlane, ndc, raycaster, viewRay])

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.033)
    if (shaking.current) {
      const expected = base.current.clone().add(applied.current)
      if (camera.position.distanceTo(expected) < 0.004) camera.position.copy(base.current)
    }
    base.current.copy(camera.position)

    const pointer = aim.current
    const showKnife = active && pointer.seen && (hovering.current || cutting.current)
    if (rig.current) {
      let hit = null
      if (showKnife) {
        const rect = gl.domElement.getBoundingClientRect()
        ndc.x = ((pointer.x - rect.left) / rect.width) * 2 - 1
        ndc.y = -((pointer.y - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(ndc, camera)
        hit = raycaster.ray.intersectPlane(knifePlane, knifeHit) ? knifeHit : null
      }
      rig.current.visible = Boolean(showKnife && hit)
      if (shadow.current) shadow.current.visible = Boolean(showKnife && hit)
      if (hit) {
        if (!posed.current) {
          pose.current.set(hit.x, FACE_Y, hit.z)
          prevHit.current.copy(hit)
          posed.current = true
          velocity.current.set(0, 0)
        } else {
          pose.current.x = THREE.MathUtils.damp(pose.current.x, hit.x, 25, step)
          pose.current.z = THREE.MathUtils.damp(pose.current.z, hit.z, 25, step)
          pose.current.y = FACE_Y
          const instX = (hit.x - prevHit.current.x) / Math.max(step, 1e-4)
          const instZ = (hit.z - prevHit.current.z) / Math.max(step, 1e-4)
          velocity.current.x = THREE.MathUtils.damp(velocity.current.x, instX, 12, step)
          velocity.current.y = THREE.MathUtils.damp(velocity.current.y, instZ, 12, step)
          prevHit.current.copy(hit)
        }
        const sample = lastYawClient.current
        const moved = sample.ready ? Math.hypot(pointer.x - sample.x, pointer.y - sample.y) : 0
        sample.x = pointer.x
        sample.y = pointer.y
        sample.ready = true
        if (moved > 0.75) {
          yawTravel.current += moved
          if (yawTravel.current >= 4) {
            const speed = velocity.current.length()
            if (speed > 0.2) desiredYaw.current = Math.atan2(-velocity.current.y, velocity.current.x)
            yawTravel.current = 0
          }
          yaw.current = dampAngle(yaw.current, desiredYaw.current, 18, step)
        }
        rig.current.position.copy(pose.current)
        if (tilt.current) {
          tilt.current.rotation.order = 'YXZ'
          tilt.current.rotation.set(0.68, yaw.current, -0.28)
        }
        if (shadow.current) {
          shadow.current.position.set(pose.current.x, 0.014, pose.current.z)
          shadow.current.rotation.y = yaw.current
        }
        if (cutting.current) {
          const last = trail.current[trail.current.length - 1]
          if (!last || Math.hypot(last.x - pose.current.x, last.z - pose.current.z) > 0.008) {
            trail.current.push({ x: pose.current.x, y: pose.current.y + 0.02, z: pose.current.z, t: performance.now() })
            if (trail.current.length > TRAIL_LIMIT) trail.current.shift()
          }
        }
      }
    }

    applied.current.set(0, 0, 0)
    shaking.current = kick.current > 0.001
    if (shaking.current) {
      kick.current *= 0.8
      applied.current.set((Math.random() - 0.5) * kick.current, (Math.random() - 0.5) * kick.current * 0.35, (Math.random() - 0.5) * kick.current)
      camera.position.add(applied.current)
    }

    const now = performance.now()
    const points = trail.current.filter((point) => now - point.t < TRAIL_MS)
    trail.current = points
    const position = trailGeometry.getAttribute('position')
    const alpha = trailGeometry.getAttribute('aAlpha')
    const head = Math.max(points.length - 1, 1)
    let cursor = 0
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1]
      const current = points[index]
      const age = 1 - (now - current.t) / TRAIL_MS
      const width0 = THREE.MathUtils.lerp(0.004, 0.05, (index - 1) / head)
      const width1 = THREE.MathUtils.lerp(0.004, 0.05, index / head)
      const dx = current.x - previous.x
      const dz = current.z - previous.z
      const length = Math.hypot(dx, dz) || 1
      const nx0 = (-dz / length) * width0
      const nz0 = (dx / length) * width0
      const nx1 = (-dz / length) * width1
      const nz1 = (dx / length) * width1
      const fade0 = Math.max(1 - (now - previous.t) / TRAIL_MS, 0) * 0.55
      const fade1 = Math.max(age, 0) * 0.55
      const quad = [
        [previous.x - nx0, previous.y, previous.z - nz0, fade0],
        [previous.x + nx0, previous.y, previous.z + nz0, fade0],
        [current.x + nx1, current.y, current.z + nz1, fade1],
        [previous.x - nx0, previous.y, previous.z - nz0, fade0],
        [current.x + nx1, current.y, current.z + nz1, fade1],
        [current.x - nx1, current.y, current.z - nz1, fade1],
      ]
      for (const vertex of quad) {
        position.setXYZ(cursor, vertex[0], vertex[1], vertex[2])
        alpha.setX(cursor, vertex[3])
        cursor += 1
      }
    }
    position.needsUpdate = true
    alpha.needsUpdate = true
    trailGeometry.setDrawRange(0, cursor)
    if (trailMesh.current) trailMesh.current.visible = cursor > 0

    const mesh = dropsMesh.current
    if (!mesh) return
    drops.current.forEach((drop, index) => {
      if (drop.life <= 0) {
        dropDummy.position.set(0, -10, 0)
        dropDummy.scale.setScalar(0)
      } else {
        drop.life -= step
        drop.v.y -= 14 * step
        drop.p.addScaledVector(drop.v, step)
        const fade = Math.max(drop.life, 0) / drop.max
        dropDummy.position.copy(drop.p)
        dropDummy.scale.setScalar(drop.size * fade)
        mesh.setColorAt(index, drop.color)
      }
      dropDummy.updateMatrix()
      mesh.setMatrixAt(index, dropDummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <group ref={rig} visible={false}>
        <group ref={tilt}>
          <group scale={KNIFE_SCALE} position={EDGE_OFFSET} raycast={() => null}>
            <KnifeModel />
          </group>
        </group>
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} visible={false} raycast={() => null}>
        <circleGeometry args={[0.52, 24]} />
        <primitive object={shadowMaterial} attach="material" />
      </mesh>
      <mesh ref={trailMesh} geometry={trailGeometry} material={trailMaterial} frustumCulled={false} raycast={() => null} />
      <instancedMesh ref={dropsMesh} args={[dropGeometry, dropMaterial, 32]} frustumCulled={false} raycast={() => null} />
    </group>
  )
}
