import { Component, useCallback, useEffect, useRef, useState } from 'react'
import { FlatCluster } from '../components/flat-jellies/FlatFruits'
import { CATALOG, CATEGORY_ORDER } from '../scene/catalog'
import Scene from '../scene/Scene'

const CATEGORIES = CATEGORY_ORDER.map((id) => ({ id, ...CATALOG[id] }))

const INITIAL_COUNT = 8
const PIECE_CAP = 40

function capFragments(fragments, livingInitials, drops) {
  const others = livingInitials + drops.filter((drop) => drop.phase !== 'out').length
  let overflow = others + fragments.filter((fragment) => fragment.phase !== 'out').length - PIECE_CAP
  if (overflow <= 0) return fragments
  const ranked = fragments
    .filter((fragment) => fragment.phase !== 'out')
    .sort((left, right) => left.area - right.area || left.born - right.born)
  const retire = new Set()
  for (const fragment of ranked) {
    if (overflow <= 0) break
    retire.add(fragment.id)
    overflow -= 1
  }
  return fragments.map((fragment) => (retire.has(fragment.id) ? { ...fragment, phase: 'out' } : fragment))
}

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
  const [scaleMode, setScaleMode] = useState(false)
  const [knifeMode, setKnifeMode] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [angled, setAngled] = useState(false)
  const [fragments, setFragments] = useState([])
  const [severed, setSevered] = useState(() => new Set())
  const nextId = useRef(1)
  const serials = useRef({ berry: 2, bloom: 3, orchard: 2, tropic: 1 })
  const dropsRef = useRef([])
  const fragmentsRef = useRef([])
  const severedRef = useRef(new Set())
  const fallback = <FlatCluster />

  const removeDrop = useCallback((id) => {
    const next = dropsRef.current.filter((drop) => drop.id !== id)
    dropsRef.current = next
    setDrops(next)
  }, [])

  const removeFragment = useCallback((id) => {
    const next = fragmentsRef.current.filter((fragment) => fragment.id !== id)
    fragmentsRef.current = next
    setFragments(next)
  }, [])

  const applyCuts = useCallback((born, removed) => {
    const nextSevered = new Set(severedRef.current)
    for (const id of removed) {
      if (!id.startsWith('drop-') && !id.startsWith('cut-')) nextSevered.add(id)
    }
    const nextDrops = dropsRef.current.filter((drop) => !removed.includes(drop.id))
    const kept = fragmentsRef.current.filter((fragment) => !removed.includes(fragment.id))
    const nextFragments = capFragments([...kept, ...born], INITIAL_COUNT - nextSevered.size, nextDrops)
    severedRef.current = nextSevered
    dropsRef.current = nextDrops
    fragmentsRef.current = nextFragments
    setSevered(nextSevered)
    setDrops(nextDrops)
    setFragments(nextFragments)
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
    const trim = () => {
      const next = trimToLimit(dropsRef.current)
      dropsRef.current = next
      setDrops(next)
    }
    media.addEventListener('change', trim)
    return () => media.removeEventListener('change', trim)
  }, [])

  const spawn = (category) => {
    const count = 1 + Math.floor(Math.random() * 2)
    const added = Array.from({ length: count }, () => {
      serials.current[category] += 1
      return {
        id: `drop-${nextId.current++}`,
        category,
        phase: 'in',
        serial: serials.current[category],
      }
    })
    const nextDrops = trimToLimit([...dropsRef.current, ...added])
    const nextFragments = capFragments(fragmentsRef.current, INITIAL_COUNT - severedRef.current.size, nextDrops)
    dropsRef.current = nextDrops
    fragmentsRef.current = nextFragments
    setDrops(nextDrops)
    setFragments(nextFragments)
  }

  const reset = () => {
    dropsRef.current = []
    fragmentsRef.current = []
    severedRef.current = new Set()
    setDrops([])
    setFragments([])
    setSevered(new Set())
    setResetToken((value) => value + 1)
  }

  const toggleScale = () => {
    setScaleMode((value) => !value)
    if (!scaleMode) setKnifeMode(false)
  }

  const toggleKnife = () => {
    setKnifeMode((value) => !value)
    if (!knifeMode) setScaleMode(false)
  }

  const hint = knifeMode
    ? 'KNIFE: arrastra a través de una gominola para cortarla'
    : scaleMode
      ? 'SCALE: toca una gominola para inflarla'
      : 'Arrastra una gominola'

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
            scaleMode={scaleMode}
            showTags={showTags}
            angled={angled}
            knifeMode={knifeMode}
            fragments={fragments}
            severed={severed}
            onCut={applyCuts}
            onFragmentGone={removeFragment}
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
                <i className={`dot dot-${category.dot}`} />
                {category.label}
              </button>
            ))}
          </div>
          <div className="hero-play">
            <p>{hint}</p>
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
              <button
                type="button"
                className={knifeMode ? 'hero-pill is-on' : 'hero-pill'}
                aria-pressed={knifeMode}
                onClick={toggleKnife}
              >
                Knife
              </button>
              <button
                type="button"
                className={scaleMode ? 'hero-pill is-on' : 'hero-pill'}
                aria-pressed={scaleMode}
                onClick={toggleScale}
              >
                Scale
              </button>
              <button type="button" className="hero-pill" onClick={() => setShakeToken((value) => value + 1)}>
                Shake
              </button>
              <button type="button" className="hero-pill" onClick={reset}>
                Reset
              </button>
              <button
                type="button"
                className={showTags ? 'hero-pill is-on' : 'hero-pill'}
                aria-pressed={showTags}
                onClick={() => setShowTags((value) => !value)}
              >
                Tags
              </button>
              <button
                type="button"
                className={angled ? 'hero-pill is-on' : 'hero-pill'}
                aria-pressed={angled}
                onClick={() => setAngled((value) => !value)}
              >
                View
              </button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
