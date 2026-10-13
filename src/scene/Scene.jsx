import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Grove from './Grove'
import Lights from './Lights'
import ResponsiveCamera from './ResponsiveCamera'

function StudioEnvironment() {
  return (
    <Environment frames={1} resolution={256} environmentIntensity={0.22}>
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

export default function Scene({ category = null, resetToken = 0 }) {
  const [ready, setReady] = useState(false)

  return (
    <div className="scene">
      {ready ? null : <div className="scene-pending" aria-hidden="true" />}
      <Canvas
        className={ready ? 'scene-ready' : 'scene-waiting'}
        dpr={[1, 1.75]}
        camera={{ position: [0.2, 12, 1.8], fov: 28, near: 0.1, far: 90 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.setClearColor(0x000000, 0)
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
          })
        }}
      >
        <ResponsiveCamera />
        <Lights />
        <Suspense fallback={null}>
          <StudioEnvironment />
          <Reveal onReady={() => setReady(true)} />
        </Suspense>
        <Grove category={category} resetToken={resetToken} />
      </Canvas>
    </div>
  )
}
