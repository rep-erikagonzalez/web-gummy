import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getContactShadowTexture } from '../utils/textures'
import { advanceCut, createCutState, evaluateCut, tooSmallToCut } from './cut'
import { eachPiece } from './pieces'
import { PULP, makeHalves } from './sliceFactory'

const KNIFE_Y = 1.02
const TRAIL_MS = 300
const TRAIL_LIMIT = 48

function dampAngle(current, target, amount) {
  let delta = target - current
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  return current + delta * amount
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
      <mesh geometry={blade} material={metal} castShadow />
      <mesh material={handle} position={[-0.28, -0.012, 0]} castShadow>
        <boxGeometry args={[0.42, 0.09, 0.07]} />
      </mesh>
      <mesh material={metal} position={[-0.08, -0.004, 0]}>
        <boxGeometry args={[0.06, 0.12, 0.05]} />
      </mesh>
      {[-0.18, -0.3, -0.42].map((x) => (
        <mesh key={x} material={rivet} position={[x, 0.02, 0.028]}>
          <sphereGeometry args={[0.022, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}

export default function Knife({ active, onCut }) {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const pointer = useThree((state) => state.pointer)
  const rig = useRef(null)
  const tilt = useRef(null)
  const shadow = useRef(null)
  const trailMesh = useRef(null)
  const dropsMesh = useRef(null)
  const yaw = useRef(-0.4)
  const lastClient = useRef(null)
  const lastWorld = useRef(new THREE.Vector3())
  const worldReady = useRef(false)
  const hovering = useRef(false)
  const cutting = useRef(false)
  const tracks = useRef(new Map())
  const trail = useRef([])
  const kick = useRef(0)
  const applied = useRef(new THREE.Vector3())
  const base = useRef(new THREE.Vector3())
  const shaking = useRef(false)
  const onCutRef = useRef(onCut)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const knifePlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -KNIFE_Y), [])
  const knifeHit = useMemo(() => new THREE.Vector3(), [])
  const pieceHit = useMemo(() => new THREE.Vector3(), [])
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
      canvas.style.cursor = ''
      canvas.style.touchAction = ''
      return undefined
    }
    const previousCursor = canvas.style.cursor
    const previousTouch = canvas.style.touchAction
    canvas.style.cursor = 'none'
    canvas.style.touchAction = 'none'
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const project = (api, clientX, clientY) => {
      const plane = api.plane()
      if (!plane) return null
      const rect = canvas.getBoundingClientRect()
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera)
      if (!raycaster.ray.intersectPlane(plane, pieceHit)) return null
      return api.toShape(pieceHit)
    }

    const burst = (point, color) => {
      const slot = drops.current.find((drop) => drop.life <= 0) || drops.current[0]
      for (let index = 0; index < 8; index += 1) {
        const drop = drops.current.find((item) => item.life <= 0) || slot
        drop.life = reduced ? 0.12 : 0.5 + Math.random() * 0.12
        drop.max = drop.life
        drop.size = 0.028 + Math.random() * 0.028
        drop.p.copy(point)
        drop.v.set((Math.random() - 0.5) * 1.5, 1.1 + Math.random() * 1.5, (Math.random() - 0.5) * 1.5)
        drop.color.set(color)
      }
    }

    const sample = (from, to) => {
      const born = []
      const removed = []
      eachPiece((api) => {
        if (api.spent || !api.cuttable()) return
        const start = project(api, from.x, from.y)
        const end = project(api, to.x, to.y)
        if (!start || !end) return
        let track = tracks.current.get(api.id)
        if (!track) {
          track = { state: createCutState() }
          tracks.current.set(api.id, track)
        }
        const result = advanceCut(track.state, start, end, api.outline())
        if (!result) return
        const cut = evaluateCut(api.outline(), result)
        if (!cut) {
          track.state = createCutState()
          return
        }
        const snapshot = api.snapshot()
        if (!snapshot || tooSmallToCut(snapshot.area, snapshot.originArea)) return
        try {
          const halves = makeHalves(snapshot, cut)
          api.spent = true
          removed.push(api.id)
          born.push(...halves)
          const mid = cut.cutPath[Math.floor(cut.cutPath.length / 2)]
          burst(api.toWorld(mid[0], mid[1]), PULP[snapshot.kind])
          if (!reduced) kick.current = 0.042
        } catch {
          track.state = createCutState()
        }
      })
      if (born.length) onCutRef.current?.(born, removed)
    }

    const onDown = (event) => {
      if (event.button != null && event.button !== 0) return
      if (event.target !== canvas) return
      cutting.current = true
      tracks.current = new Map()
      trail.current = []
      lastClient.current = { x: event.clientX, y: event.clientY }
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
      if (!cutting.current || !lastClient.current) return
      if (event.pointerType === 'touch') event.preventDefault()
      const previous = lastClient.current
      if (Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 2.5) return
      sample(previous, { x: event.clientX, y: event.clientY })
      lastClient.current = { x: event.clientX, y: event.clientY }
      const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera)
      if (raycaster.ray.intersectPlane(knifePlane, knifeHit)) {
        trail.current.push({ x: knifeHit.x, y: 0.48, z: knifeHit.z, t: performance.now() })
        if (trail.current.length > TRAIL_LIMIT) trail.current.shift()
      }
    }
    const onUp = () => {
      cutting.current = false
      tracks.current = new Map()
      lastClient.current = null
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerenter', onEnter)
    canvas.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      cutting.current = false
      canvas.style.cursor = previousCursor
      canvas.style.touchAction = previousTouch
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerenter', onEnter)
      canvas.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [active, camera, gl, knifeHit, knifePlane, pieceHit, raycaster])

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.033)
    if (shaking.current) {
      const expected = base.current.clone().add(applied.current)
      if (camera.position.distanceTo(expected) < 0.004) camera.position.copy(base.current)
    }
    base.current.copy(camera.position)
    applied.current.set(0, 0, 0)
    shaking.current = kick.current > 0.001
    if (shaking.current) {
      kick.current *= 0.8
      applied.current.set((Math.random() - 0.5) * kick.current, (Math.random() - 0.5) * kick.current * 0.35, (Math.random() - 0.5) * kick.current)
      camera.position.add(applied.current)
    }

    if (rig.current) {
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.ray.intersectPlane(knifePlane, knifeHit)
      const visible = active && (hovering.current || cutting.current) && Boolean(hit)
      rig.current.visible = visible
      if (shadow.current) shadow.current.visible = visible
      if (hit && tilt.current) {
        if (worldReady.current) {
          const dx = hit.x - lastWorld.current.x
          const dz = hit.z - lastWorld.current.z
          if (dx * dx + dz * dz > 0.00004) yaw.current = dampAngle(yaw.current, Math.atan2(-dz, dx), 0.35)
        }
        lastWorld.current.copy(hit)
        worldReady.current = true
        rig.current.position.set(hit.x, hit.y + Math.sin(state.clock.elapsedTime * 3) * 0.03, hit.z)
        tilt.current.rotation.order = 'YXZ'
        tilt.current.rotation.set(0.68, yaw.current, -0.28)
        if (shadow.current) {
          shadow.current.position.set(hit.x, 0.014, hit.z)
          shadow.current.rotation.y = yaw.current
        }
      }
    }

    const now = performance.now()
    const points = trail.current.filter((point) => now - point.t < TRAIL_MS)
    trail.current = points
    const position = trailGeometry.getAttribute('position')
    const alpha = trailGeometry.getAttribute('aAlpha')
    let cursor = 0
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1]
      const current = points[index]
      const age = 1 - (now - current.t) / TRAIL_MS
      const width = 0.012 + 0.028 * (index / points.length)
      const dx = current.x - previous.x
      const dz = current.z - previous.z
      const length = Math.hypot(dx, dz) || 1
      const nx = (-dz / length) * width
      const nz = (dx / length) * width
      const quad = [
        [previous.x - nx, previous.y, previous.z - nz],
        [previous.x + nx, previous.y, previous.z + nz],
        [current.x + nx, current.y, current.z + nz],
        [previous.x - nx, previous.y, previous.z - nz],
        [current.x + nx, current.y, current.z + nz],
        [current.x - nx, current.y, current.z - nz],
      ]
      for (const vertex of quad) {
        position.setXYZ(cursor, vertex[0], vertex[1], vertex[2])
        alpha.setX(cursor, Math.max(age, 0) * 0.55)
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
          <KnifeModel />
        </group>
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} visible={false} raycast={() => null}>
        <circleGeometry args={[0.34, 24]} />
        <primitive object={shadowMaterial} attach="material" />
      </mesh>
      <mesh ref={trailMesh} geometry={trailGeometry} material={trailMaterial} frustumCulled={false} raycast={() => null} />
      <instancedMesh ref={dropsMesh} args={[dropGeometry, dropMaterial, 32]} frustumCulled={false} raycast={() => null} />
    </group>
  )
}
