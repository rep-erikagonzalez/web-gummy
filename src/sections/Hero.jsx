import { Component, useCallback, useEffect, useRef, useState } from 'react'
import { FlatCluster } from '../components/flat-jellies/FlatFruits'
import { CATALOG, CATEGORY_ORDER } from '../scene/catalog'
import { initialIds } from '../scene/Grove'
import Scene from '../scene/Scene'

function shuffle(list) {
  const next = [...list]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    const current = next[index]
    next[index] = next[swap]
    next[swap] = current
  }
  return next
}

function TitleLine({ text, start }) {
  return (
    <span className="hero-line" aria-hidden="true">
      {[...text].map((char, index) => (
        <span key={`${text}-${index}`} className="hero-letter" style={{ '--i': start + index }}>
          {char}
        </span>
      ))}
    </span>
  )
}

const CATEGORIES = CATEGORY_ORDER.map((id) => ({ id, ...CATALOG[id] }))

const PIECE_CAP = 40

function initialCount() {
  return window.matchMedia('(max-width: 639px)').matches ? 6 : 8
}

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
  let overflow = initialCount() + drops.length + extra - pieceLimit()
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
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 639px)').matches)
  const [live, setLive] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [introKey, setIntroKey] = useState(0)
  const [released, setReleased] = useState([])
  const [dropIn, setDropIn] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [hold, setHold] = useState(false)
  const [chromeDelay, setChromeDelay] = useState('1.45s')
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
  const compactRef = useRef(compact)
  const resetTimer = useRef(0)
  const introTimers = useRef([])
  const nextId = useRef(1)
  const serials = useRef({ berry: 2, bloom: 3, orchard: 2, tropic: 1 })
  const dropsRef = useRef([])
  const fragmentsRef = useRef([])
  const severedRef = useRef(new Set())
  const fallback = <FlatCluster />
  compactRef.current = compact

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
    const nextFragments = capFragments([...kept, ...born], initialCount() - nextSevered.size, nextDrops)
    severedRef.current = nextSevered
    dropsRef.current = nextDrops
    fragmentsRef.current = nextFragments
    setSevered(nextSevered)
    setDrops(nextDrops)
    setFragments(nextFragments)
  }, [])

  const handleReady = useCallback(() => {
    const count = initialIds(compactRef.current).length
    const releaseEnd = 0.4 + Math.max(0, count - 1) * 0.12
    setChromeDelay(`${(releaseEnd + 0.2).toFixed(2)}s`)
    setSceneReady(true)
    setLive(true)
    setIntroKey((key) => (key === 0 ? 1 : key))
  }, [])

  useEffect(() => {
    if (webgl) {
      const timer = window.setTimeout(() => setLive(true), 4000)
      return () => window.clearTimeout(timer)
    }
    setLive(true)
    return undefined
  }, [webgl])

  useEffect(() => {
    if (!sceneReady || introKey === 0) return undefined
    const ids = shuffle(initialIds(compactRef.current))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers = []
    setHold(true)
    if (reduced) {
      setDropIn(false)
      setFadeIn(true)
      setReleased(ids)
      timers.push(window.setTimeout(() => setFadeIn(false), 50))
      timers.push(window.setTimeout(() => setHold(false), 400))
    } else {
      setFadeIn(false)
      setDropIn(true)
      setReleased([])
      ids.forEach((id, index) => {
        timers.push(
          window.setTimeout(() => {
            setReleased((current) => (current.includes(id) ? current : [...current, id]))
          }, 400 + index * 120),
        )
      })
      const releaseEnd = 400 + Math.max(0, ids.length - 1) * 120
      timers.push(window.setTimeout(() => setDropIn(false), releaseEnd + 80))
      timers.push(window.setTimeout(() => setHold(false), releaseEnd + 2000))
    }
    introTimers.current = timers
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      introTimers.current = []
    }
  }, [introKey, sceneReady])

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

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
    const narrow = window.matchMedia('(max-width: 820px)')
    const phone = window.matchMedia('(max-width: 639px)')
    const trim = () => {
      setCompact(phone.matches)
      const next = trimToLimit(dropsRef.current)
      dropsRef.current = next
      setDrops(next)
    }
    narrow.addEventListener('change', trim)
    phone.addEventListener('change', trim)
    return () => {
      narrow.removeEventListener('change', trim)
      phone.removeEventListener('change', trim)
    }
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
    const nextFragments = capFragments(fragmentsRef.current, initialCount() - severedRef.current.size, nextDrops)
    dropsRef.current = nextDrops
    fragmentsRef.current = nextFragments
    setDrops(nextDrops)
    setFragments(nextFragments)
  }

  const reset = () => {
    window.clearTimeout(resetTimer.current)
    introTimers.current.forEach((timer) => window.clearTimeout(timer))
    introTimers.current = []
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nextDrops = dropsRef.current.map((drop) => ({ ...drop, phase: 'out' }))
    const nextFragments = fragmentsRef.current.map((fragment) => ({ ...fragment, phase: 'out' }))
    dropsRef.current = nextDrops
    fragmentsRef.current = nextFragments
    setDrops(nextDrops)
    setFragments(nextFragments)
    setLeaving(true)
    setResetToken((value) => value + 1)
    resetTimer.current = window.setTimeout(() => {
      dropsRef.current = []
      fragmentsRef.current = []
      severedRef.current = new Set()
      setDrops([])
      setFragments([])
      setSevered(new Set())
      setLeaving(false)
      setReleased([])
      setIntroKey((key) => key + 1)
    }, reduced ? 40 : 480)
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
    ? 'KNIFE: arrastra a través de una gomita para cortarla'
    : scaleMode
      ? 'SCALE: toca una gomita para inflarla'
      : 'Arrastra una gomita'

  return (
    <section
      className={live ? 'hero is-live' : 'hero'}
      id="inicio"
      aria-label="Inicio"
      style={live ? { '--chrome-delay': chromeDelay } : undefined}
    >
      <div className="hero-column">
        <h1 className="hero-title" aria-label="ERIKA GONZÁLEZ">
          <TitleLine text="ERIKA" start={0} />
          <TitleLine text="GONZÁLEZ" start={5} />
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

      <div className="hero-stage">
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
            compact={compact}
            onReady={handleReady}
            hold={hold}
            released={released}
            dropIn={dropIn}
            fadeIn={fadeIn}
            leaving={leaving}
            wave={introKey}
          />
        </SceneBoundary>
      ) : (
        fallback
      )}

      {webgl ? (
        <>
          <div className="hero-cats" role="group" aria-label="Añadir gomitas">
            {CATEGORIES.map((category) => (
              <button key={category.id} type="button" className="hero-pill" onClick={() => spawn(category.id)}>
                <i className={`dot dot-${category.dot}`} />
                {category.label}
              </button>
            ))}
          </div>
          <div className="hero-play">
            <p className="hero-hint">{hint}</p>
            <div className="hero-tools" role="group" aria-label="Física de las gomitas">
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
      </div>
    </section>
  )
}
