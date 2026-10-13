import { Component, useCallback, useEffect, useRef, useState } from 'react'
import { FlatCluster } from '../components/flat-jellies/FlatFruits'
import Scene from '../scene/Scene'

const CATEGORIES = [
  { id: 'berry', label: 'Berry' },
  { id: 'bloom', label: 'Bloom' },
  { id: 'orchard', label: 'Orchard' },
  { id: 'tropic', label: 'Tropic' },
]

const INITIAL_COUNT = 8

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function pieceLimit() {
  return window.matchMedia('(max-width: 820px)').matches ? 15 : 30
}

function trimToLimit(drops, extra = 0) {
  let overflow = INITIAL_COUNT + drops.length + extra - pieceLimit()
  if (overflow <= 0) return drops
  return drops.map((drop) => {
    if (overflow > 0 && drop.phase !== 'out') {
      overflow -= 1
      return { ...drop, phase: 'out' }
    }
    return drop
  })
}

class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

export default function Hero({ theme }) {
  const [webgl] = useState(supportsWebGL)
  const [feel, setFeel] = useState('soft')
  const [shakeToken, setShakeToken] = useState(0)
  const [resetToken, setResetToken] = useState(0)
  const [drops, setDrops] = useState([])
  const [paused, setPaused] = useState(false)
  const nextId = useRef(1)
  const fallback = <FlatCluster />

  const removeDrop = useCallback((id) => {
    setDrops((current) => current.filter((drop) => drop.id !== id))
  }, [])

  useEffect(() => {
    const hero = document.getElementById('inicio')
    if (!hero) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      setPaused(!entry.isIntersecting)
    })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)')
    const trim = () => setDrops((current) => trimToLimit(current))
    media.addEventListener('change', trim)
    return () => media.removeEventListener('change', trim)
  }, [])

  const spawn = (category) => {
    const count = 1 + Math.floor(Math.random() * 2)
    const added = Array.from({ length: count }, () => ({
      id: `drop-${nextId.current++}`,
      category,
      phase: 'in',
    }))
    setDrops((current) => trimToLimit([...current, ...added]))
  }

  const reset = () => {
    setDrops([])
    setResetToken((value) => value + 1)
  }

  return (
    <section className="hero" id="inicio" aria-label="Inicio">
      <div className="hero-column">
        <h1 className="hero-title">
          <span>ERIKA</span>
          <span>GONZÁLEZ</span>
        </h1>
        <div className="hero-copy">
          <p className="hero-kicker">Del código a la vida real.</p>
          <p className="hero-lead">Ingeniera de Sistemas. Software, webs e IA para resolver cosas concretas.</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#contacto">
              Hablemos
            </a>
            <a className="btn btn-secondary" href="#proyectos">
              Ver proyectos
            </a>
          </div>
        </div>
      </div>

      {webgl ? (
        <SceneBoundary fallback={fallback}>
          <Scene
            theme={theme}
            drops={drops}
            feel={feel}
            shakeToken={shakeToken}
            resetToken={resetToken}
            paused={paused}
            onGone={removeDrop}
          />
        </SceneBoundary>
      ) : (
        fallback
      )}

      {webgl ? (
        <>
          <div className="hero-cats" role="group" aria-label="Añadir gominolas">
            {CATEGORIES.map((category) => (
              <button key={category.id} type="button" className="hero-pill" onClick={() => spawn(category.id)}>
                {category.label}
              </button>
            ))}
          </div>
          <div className="hero-play">
            <p>Arrastra una gominola</p>
            <div className="hero-tools" role="group" aria-label="Física de las gominolas">
              <button
                type="button"
                className={feel === 'hard' ? 'hero-pill is-on' : 'hero-pill'}
                aria-pressed={feel === 'hard'}
                onClick={() => setFeel('hard')}
              >
                Hard
              </button>
              <button
                type="button"
                className={feel === 'soft' ? 'hero-pill is-on' : 'hero-pill'}
                aria-pressed={feel === 'soft'}
                onClick={() => setFeel('soft')}
              >
                Soft
              </button>
              <button type="button" className="hero-pill" onClick={() => setShakeToken((value) => value + 1)}>
                Shake
              </button>
              <button type="button" className="hero-pill" onClick={reset}>
                Reset
              </button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
