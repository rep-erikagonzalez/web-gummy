import { useId, useState } from 'react'
import { ecosystem } from '../data/content'
import SectionDecor from './Decor'
import { FRUITS } from './fruits'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

function Assistant({ item }) {
  const [open, setOpen] = useState(false)
  const Fruit = FRUITS[item.fruit]

  return (
    <button
      type="button"
      className={`ai-card${open ? ' is-flipped' : ''}`}
      aria-pressed={open}
      onClick={() => setOpen((value) => !value)}
    >
      <span className="ai-inner">
        <span className={`ai-face ai-front tone-${item.tone}`} aria-hidden={open}>
          <Fruit className="ai-fruit" decorative />
          <span className="ai-name">{item.name}</span>
          <span className="ai-verb">{item.verb}</span>
          <span className={`status-pill status-${item.statusTone}`}>
            <i aria-hidden="true" />
            {item.status}
          </span>
        </span>
        <span className={`ai-face ai-back tone-${item.tone}`} aria-hidden={!open}>
          <span className="ai-name">{item.name}</span>
          <span className="ai-copy">{item.description}</span>
          <ul className="example-row">
            {item.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </span>
      </span>
    </button>
  )
}

function FavoriteMark({ id }) {
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, '')

  if (id === 'cursor') {
    return (
      <svg className="fav-mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#111" />
        <path d="M9.2 7.4l14.2 6.2-6.1 2-2.1 6.3z" fill="#fff" />
      </svg>
    )
  }

  if (id === 'claude') {
    return (
      <svg className="fav-mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#f8ebe3" />
        <g fill="#d97757">
          <path d="M16 5.2c.7 3.2 1.4 4.6 3.4 6.2-2 .2-3.4-.4-3.4-2.2 0 1.8-1.4 2.4-3.4 2.2 2-1.6 2.7-3 3.4-6.2z" />
          <path d="M16 26.8c-.7-3.2-1.4-4.6-3.4-6.2 2-.2 3.4.4 3.4 2.2 0-1.8 1.4-2.4 3.4-2.2-2 1.6-2.7 3-3.4 6.2z" />
          <path d="M5.2 16c3.2-.7 4.6-1.4 6.2-3.4-.2 2 .4 3.4 2.2 3.4-1.8 0-2.4 1.4-2.2 3.4-1.6-2-3-2.7-6.2-3.4z" />
          <path d="M26.8 16c-3.2.7-4.6 1.4-6.2 3.4.2-2-.4-3.4-2.2-3.4 1.8 0 2.4-1.4 2.2-3.4 1.6 2 3 2.7 6.2 3.4z" />
        </g>
      </svg>
    )
  }

  if (id === 'gemini') {
    return (
      <svg className="fav-mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#fff" />
        <defs>
          <linearGradient id={gradientId} x1="6" y1="26" x2="26" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4b90ff" />
            <stop offset="0.45" stopColor="#e05a8a" />
            <stop offset="1" stopColor="#f2c14e" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gradientId})`}
          d="M16 4c1.1 5.2 2.6 7.4 6.4 9.2C18.6 14.6 17.1 16 16 21.2 14.9 16 13.4 14.6 9.6 13.2 13.4 11.4 14.9 9.2 16 4z"
        />
        <path fill="#4b90ff" d="M23.5 18.2c.4 1.7.9 2.4 2.1 3-1.2.4-1.7 1.1-2.1 2.8-.4-1.7-.9-2.4-2.1-3 1.2-.6 1.7-1.3 2.1-2.8z" />
      </svg>
    )
  }

  return (
    <svg className="fav-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#111" />
      <circle cx="16" cy="16.5" r="7" fill="none" stroke="#fff" strokeWidth="2.2" />
      <path d="M16 7.2c.4 2.4.9 3.3 2.4 4.2-1.5.5-2 1.3-2.4 3.5-.4-2.2-.9-3-2.4-3.5 1.5-.9 2-1.8 2.4-4.2z" fill="#fff" />
    </svg>
  )
}

function Favorite({ item }) {
  const [hearts, setHearts] = useState([])
  const [popping, setPopping] = useState(false)

  const showHeart = () => {
    const heart = { id: `${item.id}-${Date.now()}`, x: Math.round((Math.random() - 0.5) * 26) }
    setHearts((list) => [...list, heart])
    setPopping(true)
    window.setTimeout(() => setPopping(false), 460)
    window.setTimeout(() => {
      setHearts((list) => list.filter((entry) => entry.id !== heart.id))
    }, 1300)
  }

  return (
    <li>
      <button type="button" className={`fav-pill${popping ? ' is-pop' : ''}`} onClick={showHeart}>
        <FavoriteMark id={item.id} />
        <span>{item.name}</span>
        <span className="fav-hearts" aria-hidden="true">
          {hearts.map((heart) => (
            <svg key={heart.id} className="fav-heart" style={{ '--hx': `${heart.x}px` }} viewBox="0 0 24 22">
              <path d="M12 20.2C7.2 16.6 3.2 13.4 3.2 9.1 3.2 6.4 5.2 4.6 7.7 4.6c1.5 0 2.8.7 3.6 1.8.8-1.1 2.1-1.8 3.6-1.8 2.5 0 4.5 1.8 4.5 4.5 0 4.3-4 7.5-7.4 11.1z" />
            </svg>
          ))}
        </span>
      </button>
    </li>
  )
}

export default function Ecosystem() {
  const TitleFruit = FRUITS.star

  return (
    <section className="band" id="ecosistema" aria-labelledby="ecosistema-title">
      <SectionDecor
        items={[
          { fruit: 'bloom', place: 'tl' },
          { fruit: 'berry', place: 'tr' },
          { fruit: 'pear', place: 'bl' },
        ]}
      />
      <div className="band-inner">
        <Reveal>
          <p className="build-badge">{ecosystem.badge}</p>
          <SectionTitle id="ecosistema-title" fruit={TitleFruit} tone="star">
            {ecosystem.title}
          </SectionTitle>
          <p className="ecosystem-lead">{ecosystem.subtitle}</p>
          <div className="ai-stage">
            <div className="ai-flow" aria-hidden="true" />
            <div className="ai-grid">
              {ecosystem.assistants.map((item) => (
                <Assistant key={item.id} item={item} />
              ))}
            </div>
          </div>
          <h3 className="subsection-title log-title">{ecosystem.logTitle}</h3>
          <ol className="experiment-log">
            {ecosystem.log.map((item) => (
              <li key={item.id}>
                <h4>{item.when}</h4>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
          <h3 className="subsection-title">{ecosystem.favoritesTitle}</h3>
          <ul className="fav-row">
            {ecosystem.favorites.map((item) => (
              <Favorite key={item.id} item={item} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
