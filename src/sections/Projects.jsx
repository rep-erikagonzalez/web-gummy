import { useState } from 'react'
import { projects } from '../data/content'
import { FlatStarfruit } from '../components/flat-jellies/FlatFruits'
import SectionDecor from './Decor'
import { FRUITS } from './fruits'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Projects() {
  const [filter, setFilter] = useState('todos')
  const visible = projects.items.filter((project) => filter === 'todos' || project.tags.includes(filter))

  const choose = (id) => {
    const apply = () => setFilter(id)
    if (document.startViewTransition && !reducedMotion()) document.startViewTransition(apply)
    else apply()
  }

  const tilt = (event) => {
    if (reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    card.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`)
    card.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`)
  }

  const resetTilt = (event) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <section className="band" id="proyectos" aria-labelledby="proyectos-title">
      <SectionDecor
        items={[
          { fruit: 'star', place: 'tl' },
          { fruit: 'bloom', place: 'tr' },
          { fruit: 'pear', place: 'bl' },
        ]}
      />
      <div className="band-inner">
        <Reveal>
        <SectionTitle id="proyectos-title" fruit={FlatStarfruit} tone="star">
          {projects.title}
        </SectionTitle>
        <div className="filter-row" role="group" aria-label={projects.filterLabel}>
          {projects.filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className="filter-pill"
              aria-pressed={filter === item.id}
              onClick={() => choose(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <ul className="project-grid">
          {visible.map((project) => {
            const Fruit = FRUITS[project.fruit]
            return (
              <li key={project.id} style={{ viewTransitionName: `project-${project.id}` }}>
                <article className={`project-card tone-${project.tone}`} onMouseMove={tilt} onMouseLeave={resetTilt}>
                  <span aria-hidden="true">
                    <Fruit className="project-fruit" decorative />
                  </span>
                  <h3>{project.name}</h3>
                  <p className="project-cat">{project.category}</p>
                  <p>
                    <span className="card-kicker">{projects.labels.problem}. </span>
                    {project.problem}
                  </p>
                  <p>
                    <span className="card-kicker">{projects.labels.did}. </span>
                    {project.did}
                  </p>
                  <ul className="tech-row">
                    {project.tech.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p>
                    <span className="card-kicker">{projects.labels.result}. </span>
                    {project.result}
                  </p>
                  {project.link ? (
                    <p className="project-link">
                      <a href={project.link}>{project.link}</a>
                    </p>
                  ) : null}
                </article>
              </li>
            )
          })}
        </ul>
        </Reveal>
      </div>
    </section>
  )
}
