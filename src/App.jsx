import { Component, useEffect, useRef, useState } from 'react'
import Scene from './scene/Scene'
import './App.css'

const CATEGORIES = [
  { id: 'berry', label: 'Berry', color: '#e2324a' },
  { id: 'bloom', label: 'Bloom', color: '#e86b9a' },
  { id: 'citrus', label: 'Citrus', color: '#f0b429' },
  { id: 'tropic', label: 'Tropic', color: '#c5d64e' },
  { id: 'orchard', label: 'Orchard', color: '#9a3d86' },
]

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
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

export default function App() {
  const [webgl] = useState(supportsWebGL)
  const [category, setCategory] = useState(null)
  const [notice, setNotice] = useState(null)
  const [resetToken, setResetToken] = useState(0)
  const noticeTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  function selectCategory(id) {
    const next = category === id ? null : id
    setCategory(next)
    window.clearTimeout(noticeTimer.current)
    if (next === 'citrus') {
      setNotice('Coming soon')
      noticeTimer.current = window.setTimeout(() => setNotice(null), 1600)
    } else {
      setNotice(null)
    }
  }

  return (
    <main className="app">
      <header className="brand">
        <p className="logo">
          <span className="logo-marks" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="logo-name">gummy / grove</span>
        </p>
        <h1>
          <span>GUMMY</span>
          <span>GROVE</span>
        </h1>
      </header>
      {webgl ? (
        <SceneBoundary fallback={<div className="stage-fallback">This scene needs WebGL.</div>}>
          <Scene category={category} resetToken={resetToken} />
        </SceneBoundary>
      ) : (
        <div className="stage-fallback">This scene needs WebGL.</div>
      )}
      <div className="hud-top">
        <div className="pills" role="toolbar" aria-label="Categories">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="pill"
              aria-pressed={category === item.id}
              onClick={() => selectCategory(item.id)}
            >
              <span className="dot" style={{ background: item.color }} />
              {item.label}
            </button>
          ))}
        </div>
        {notice ? (
          <p className="notice" role="status">
            {notice}
          </p>
        ) : null}
      </div>
      <footer className="hud-bottom">
        <p>PLAY: Drag a jelly to wobble it</p>
        <button type="button" className="reset" onClick={() => setResetToken((value) => value + 1)}>
          Reset
        </button>
      </footer>
    </main>
  )
}
