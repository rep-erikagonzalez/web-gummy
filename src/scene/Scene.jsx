import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Grove from './Grove'
import Lights from './Lights'
import ResponsiveCamera from './ResponsiveCamera'

function StudioEnvironment({ compact }) {
  return (
    <Environment frames={1} resolution={compact ? 64 : 256} environmentIntensity={0.22}>
      <Lightformer
        form="rect"
        intensity={0.85}
        color="#ffffff"
        position={[0, 5, -1]}
        scale={[14, 8, 1]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={0.4}
        color="#f4f5f7"
        position={[-6, 2.5, 3]}
        scale={[7, 5, 1]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={0.28}
        color="#ffffff"
        position={[6, 1.8, 2]}
        scale={[6, 4, 1]}
        target={[0, 0, 0]}
      />
    </Environment>
  )
}

function Exposure({ theme }) {
  const gl = useThree((state) => state.gl)

  useLayoutEffect(() => {
    gl.toneMappingExposure = theme === 'dark' ? 1.12 : 1.05
  }, [gl, theme])

  return null
}

function EnvIntensity({ value }) {
  const scene = useThree((state) => state.scene)

  useLayoutEffect(() => {
    scene.environmentIntensity = value
  }, [scene, value])

  return null
}

function Reveal({ onReady }) {
  const scene = useThree((state) => state.scene)
  const notified = useRef(false)

  const notify = () => {
    if (notified.current || !scene.environment) return
    notified.current = true
    onReady()
  }

  useLayoutEffect(notify)
  useFrame(notify)

  return null
}

function ZoneTouch() {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const scene = useThree((state) => state.scene)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])

  useEffect(() => {
    const canvas = gl.domElement
    let tracking = null

    const hitsPiece = (event) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      return raycaster.intersectObjects(scene.children, true).some((hit) => {
        let node = hit.object
        while (node) {
          if (node.userData?.candy) return true
          node = node.parent
        }
        return false
      })
    }

    const onDown = (event) => {
      if (event.pointerType !== 'touch' || canvas.style.touchAction === 'none') return
      if (hitsPiece(event)) {
        event.preventDefault()
        return
      }
      tracking = { id: event.pointerId, y: event.clientY }
    }

    const onMove = (event) => {
      if (!tracking || event.pointerId !== tracking.id) return
      const delta = tracking.y - event.clientY
      tracking.y = event.clientY
      if (delta) window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' })
    }

    const onEnd = (event) => {
      if (!tracking || event.pointerId !== tracking.id) return
      tracking = null
    }

    canvas.addEventListener('pointerdown', onDown, { passive: false })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
    }
  }, [camera, gl, pointer, raycaster, scene])

  return null
}

function AdaptiveQuality() {
  const regress = useThree((state) => state.performance.regress)
  useFrame((_, delta) => {
    if (delta > 0.02 && delta < 0.1) regress()
  })
  return null
}

export default function Scene({
  drops = [],
  feel = 'soft',
  shakeToken = 0,
  resetToken = 0,
  paused = false,
  onGone,
  theme = 'light',
  scaleMode = false,
  showTags = false,
  angled = false,
  knifeMode = false,
  fragments = [],
  severed,
  onCut,
  onFragmentGone,
  compact = false,
  onReady,
  hold = false,
  released = [],
  dropIn = false,
  fadeIn = false,
  leaving = false,
  wave = 0,
}) {
  const [ready, setReady] = useState(false)
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 820px)').matches)
  const [poseEpoch, setPoseEpoch] = useState(0)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)')
    const sync = () => setNarrow(media.matches)
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return (
    <div className="scene">
      {ready ? null : <div className="scene-pending" aria-hidden="true" />}
      <Canvas
        key={compact ? 'compact' : 'wide'}
        className={ready ? 'scene-ready' : 'scene-waiting'}
        dpr={compact ? [1, 1.5] : narrow ? [1, 1] : [1, 1.5]}
        performance={{ min: 0.5, debounce: 300 }}
        camera={{ position: [0.2, 12, 1.8], fov: 28, near: 0.1, far: 90 }}
        gl={{
          antialias: !compact,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = theme === 'dark' ? 1.12 : 1.05
          gl.setClearColor(0x000000, 0)
          gl.domElement.setAttribute('aria-label', 'Gominolas de fruta que puedes arrastrar')
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
          })
        }}
      >
        <ResponsiveCamera angled={angled} onSettled={() => setPoseEpoch((value) => value + 1)} />
        <ZoneTouch />
        <AdaptiveQuality />
        <Exposure theme={theme} />
        <Lights theme={theme} />
        <Suspense fallback={null}>
          <StudioEnvironment compact={compact} />
          <EnvIntensity value={theme === 'dark' ? 0.34 : 0.22} />
          <Reveal
            onReady={() => {
              setReady(true)
              onReady?.()
            }}
          />
          <Grove
            drops={drops}
            feel={feel}
            shakeToken={shakeToken}
            resetToken={resetToken}
            paused={paused && !hold}
            onGone={onGone}
            scaleMode={scaleMode}
            showTags={showTags}
            poseEpoch={poseEpoch}
            knifeMode={knifeMode}
            fragments={fragments}
            severed={severed}
            onCut={onCut}
            onFragmentGone={onFragmentGone}
            compact={compact}
            released={released}
            dropIn={dropIn}
            fadeIn={fadeIn}
            leaving={leaving}
            wave={wave}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
