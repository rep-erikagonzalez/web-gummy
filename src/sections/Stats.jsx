import { useEffect, useRef, useState } from 'react'
import { FlatBlossom, FlatPear, FlatStarfruit, FlatStrawberry } from '../components/flat-jellies/FlatFruits'
import SectionDecor from './Decor'

const STATS = [
  {
    id: 'systems',
    Fruit: FlatStrawberry,
    tone: 'berry',
    mark: 'Ing.',
    label: 'Ingeniería de Sistemas',
  },
  {
    id: 'masters',
    Fruit: FlatPear,
    tone: 'pear',
    mark: 'MSc',
    label: 'Maestría en dirección de TI',
  },
  {
    id: 'people',
    Fruit: FlatBlossom,
    tone: 'bloom',
    value: 100,
    prefix: '+',
    label: 'personas certificadas',
  },
  {
    id: 'years',
    Fruit: FlatStarfruit,
    tone: 'star',
    value: 9,
    prefix: '+',
    label: 'años de experiencia',
  },
  {
    id: 'courses',
    Fruit: FlatStrawberry,
    tone: 'berry',
    value: 4,
    label: 'cursos de formación digital',
  },
]

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
          {STATS.map(({ id, Fruit, tone, mark, value, prefix, label }) => (
            <li key={id} className={`stat-chip tone-${tone}`}>
              <span aria-hidden="true">
                <Fruit className="stat-fruit" decorative />
              </span>
              {mark ? <span className="stat-value">{mark}</span> : <Count to={value} prefix={prefix} active={active} />}
              <p className="stat-label">{label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
