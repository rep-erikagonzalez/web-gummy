import { useState } from 'react'
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
            {ecosystem.favorites.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
