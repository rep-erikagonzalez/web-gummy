import { useEffect, useRef, useState } from 'react'
import { about, thoughts } from '../data/content'
import { FRUITS } from './fruits'
import Reveal from './Reveal'

const WORD_SHARE = 0.75

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function wordOpacity(local, index, total) {
  const span = WORD_SHARE / total
  const start = index * span
  const progress = clamp((local - start) / span, 0, 1)
  return 0.15 + 0.85 * progress
}

export default function Thoughts() {
  const trackRef = useRef(null)
  const previous = useRef(0)
  const [frame, setFrame] = useState({ index: 0, local: 0 })
  const [leaving, setLeaving] = useState(null)
  const items = thoughts.items
  const current = items[frame.index]
  const words = current.title.split(' ')
  const bodyOpacity = clamp((frame.local - WORD_SHARE) / (1 - WORD_SHARE), 0, 1)
  const Fruit = FRUITS[current.fruit]
  const LeavingFruit = leaving == null ? null : FRUITS[items[leaving].fruit]
  const total = String(items.length).padStart(2, '0')
  const filled = ((frame.index + frame.local) / items.length) * 100

  useEffect(() => {
    if (previous.current === frame.index) return undefined
    setLeaving(previous.current)
    previous.current = frame.index
    const timer = window.setTimeout(() => setLeaving(null), 640)
    return () => window.clearTimeout(timer)
  }, [frame.index])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    let frameId = 0

    const update = () => {
      frameId = 0
      if (getComputedStyle(track).display === 'none') return
      const sticky = track.querySelector('.think-sticky')
      const stickyHeight = sticky ? sticky.offsetHeight : window.innerHeight
      const scrollable = Math.max(1, track.offsetHeight - stickyHeight)
      const scrolled = clamp(-track.getBoundingClientRect().top, 0, scrollable)
      const raw = (scrolled / scrollable) * items.length
      const index = Math.min(items.length - 1, Math.floor(raw))
      const local = raw >= items.length - 1 ? clamp(raw - (items.length - 1), 0, 1) : raw - index
      setFrame((currentFrame) => {
        if (currentFrame.index === index && Math.abs(currentFrame.local - local) < 0.008) return currentFrame
        return { index, local }
      })
    }

    const onScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [items.length])

  return (
    <section className="think-section" id="lo-que-pienso" aria-labelledby="think-heading">
      <div className="think-track" ref={trackRef} style={{ '--steps': items.length }} aria-hidden="true">
        <div className="think-sticky">
          <div className="think-stage">
            <div className="think-copy">
              <p className="think-label">{thoughts.label}</p>
              <p className="think-intro">{thoughts.intro}</p>
              <p className={`think-index tone-${current.tone}`}>
                {current.number}
                <span> / {total}</span>
              </p>
              <p className="think-title">
                {words.map((word, index) => (
                  <span key={`${current.number}-${word}-${index}`} style={{ opacity: wordOpacity(frame.local, index, words.length) }}>
                    {word}{' '}
                  </span>
                ))}
              </p>
              <p className="think-body" style={{ opacity: bodyOpacity, transform: `translateY(${(1 - bodyOpacity) * 12}px)` }}>
                {current.text}
              </p>
            </div>
            <div className="think-visual">
              {LeavingFruit ? (
                <LeavingFruit key={`out-${items[leaving].number}`} className="think-fruit is-out" decorative />
              ) : null}
              <Fruit key={current.number} className="think-fruit is-in" decorative />
            </div>
          </div>
          <div className={`think-bar tone-${current.tone}`}>
            <span style={{ width: `${filled}%` }} />
          </div>
        </div>
      </div>

      <div className="think-stack">
        <h2 id="think-heading">{thoughts.label}</h2>
        <p className="think-intro">{thoughts.intro}</p>
        {items.map((item) => {
          const CardFruit = FRUITS[item.fruit]
          return (
            <article key={item.number} className={`think-card tone-${item.tone}`}>
              <Reveal>
                <CardFruit className="think-card-fruit" decorative />
                <p className="think-kicker">{item.number}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            </article>
          )
        })}
      </div>

      <div className="think-end">
        <ul className="principle-row">
          {about.principles.map((item) => (
            <li key={item.label} className="principle">
              <span className={`dot dot-${item.tone}`} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
