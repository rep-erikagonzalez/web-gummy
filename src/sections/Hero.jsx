import { Component, useState } from 'react'
import { FlatCluster } from '../components/flat-jellies/FlatFruits'
import Scene from '../scene/Scene'

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

export default function Hero({ theme }) {
  const [webgl] = useState(supportsWebGL)
  const [resetToken, setResetToken] = useState(0)
  const fallback = <FlatCluster />

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
          <Scene theme={theme} resetToken={resetToken} />
        </SceneBoundary>
      ) : (
        fallback
      )}

      {webgl ? (
        <div className="hero-play">
          <p>Arrastra una gominola</p>
          <button type="button" className="btn btn-secondary" onClick={() => setResetToken((value) => value + 1)}>
            Reset
          </button>
        </div>
      ) : null}
    </section>
  )
}
