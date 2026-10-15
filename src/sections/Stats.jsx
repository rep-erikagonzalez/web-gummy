import { useEffect, useRef, useState } from 'react'
import { stats } from '../data/content'
import SectionDecor from './Decor'
import { FRUITS } from './fruits'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Count({ to, prefix = '', active }) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? to : 0))

  useEffect(() => {
    if (!active) return undefined

    let frame = 0
    let stopped = false
    const timer = window.setTimeout(() => {
      if (stopped) return
      if (prefersReducedMotion()) {
        setValue(to)
        return
      }

      const start = performance.now()
      const duration = 900
      const tick = (now) => {
        if (stopped) return
        const progress = Math.min((now - start) / duration, 1)
        if (progress >= 1) {
          setValue(to)
          return
        }
        const eased = 1 - (1 - progress) ** 3
        setValue(Math.round(to * eased))
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, 0)

    return () => {
      stopped = true
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [active, to])

  return (
    <span className="stat-value">
      {prefix}
      {value}
    </span>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setActive(true)
        observer.disconnect()
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="band band-alt stat-band" id="cifras" aria-label="Cifras" ref={ref}>
      <SectionDecor
        items={[
          { fruit: 'bloom', place: 'tl' },
          { fruit: 'star', place: 'tr' },
          { fruit: 'pear', place: 'br' },
        ]}
      />
      <div className="band-inner">
        <ul className="stat-row">
          {stats.map(({ id, fruit, tone, mark, value, prefix, label }) => {
            const Fruit = FRUITS[fruit]
            return (
            <li key={id} className={`stat-chip tone-${tone}`}>
              <span aria-hidden="true">
                <Fruit className="stat-fruit" decorative />
              </span>
              {mark ? <span className="stat-value">{mark}</span> : <Count to={value} prefix={prefix} active={active} />}
              <p className="stat-label">{label}</p>
            </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
