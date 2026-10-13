import { useState } from 'react'
import { FlatBlossom, FlatPear, FlatStarfruit, FlatStrawberry } from '../components/flat-jellies/FlatFruits'
import SectionDecor from './Decor'
import SectionTitle from './SectionTitle'

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'publico', label: 'Sector público' },
  { id: 'integraciones', label: 'Integraciones' },
  { id: 'ia', label: 'IA' },
  { id: 'formacion', label: 'Formación' },
]

const PROJECTS = [
  {
    id: 'intraweb',
    name: 'Intraweb',
    Fruit: FlatStrawberry,
    tone: 'berry',
    tags: ['publico'],
    problem: '[COMPLETAR: problema que resolvía.]',
    did: 'Gestión documental usada en la alcaldía y entidades públicas del Quindío.',
    tech: ['[COMPLETAR: tecnologías.]'],
    result: '[COMPLETAR: resultado.]',
    link: '[COMPLETAR: enlace, si hay.]',
  },
  {
    id: 'epa',
    name: 'Mantenimientos EPA',
    Fruit: FlatPear,
    tone: 'pear',
    tags: [],
    problem: '[COMPLETAR: problema.]',
    did: '[COMPLETAR: qué hiciste en Mantenimientos EPA.]',
    tech: ['[COMPLETAR: tecnologías.]'],
    result: '[COMPLETAR: resultado.]',
    link: '[COMPLETAR: enlace, si hay.]',
    category: '[COMPLETAR: categoría.]',
  },
  {
    id: 'ia-dev',
    name: 'IA en el desarrollo',
    Fruit: FlatStarfruit,
    tone: 'star',
    tags: ['ia'],
    problem: '[COMPLETAR: problema.]',
    did: '[COMPLETAR: qué hiciste con IA en el desarrollo.]',
    tech: ['[COMPLETAR: tecnologías.]'],
    result: '[COMPLETAR: resultado.]',
    link: '[COMPLETAR: enlace, si hay.]',
  },
  {
    id: 'google',
    name: 'Integraciones con Google',
    Fruit: FlatBlossom,
    tone: 'bloom',
    tags: ['integraciones'],
    problem: '[COMPLETAR: problema.]',
    did: '[COMPLETAR: qué integraste con Google.]',
    tech: ['[COMPLETAR: tecnologías.]'],
    result: '[COMPLETAR: resultado.]',
    link: '[COMPLETAR: enlace, si hay.]',
  },
  {
    id: 'formacion',
    name: 'Formación digital',
    Fruit: FlatStrawberry,
    tone: 'berry',
    tags: ['formacion'],
    problem: '[COMPLETAR: a quién iba dirigida.]',
    did: '[COMPLETAR: qué cursos o talleres diste.]',
    tech: ['[COMPLETAR: tecnologías.]'],
    result: '+100 personas certificadas.',
    link: '[COMPLETAR: enlace, si hay.]',
  },
]

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Projects() {
  const [filter, setFilter] = useState('todos')
  const visible = PROJECTS.filter((project) => filter === 'todos' || project.tags.includes(filter))

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
        <SectionTitle id="proyectos-title" fruit={FlatStarfruit} tone="star">
          Proyectos
        </SectionTitle>
        <div className="filter-row" role="group" aria-label="Filtrar proyectos">
          {FILTERS.map((item) => (
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
            const Fruit = project.Fruit
            return (
              <li key={project.id} style={{ viewTransitionName: `project-${project.id}` }}>
                <article className={`project-card tone-${project.tone}`} onMouseMove={tilt} onMouseLeave={resetTilt}>
                  <span aria-hidden="true">
                    <Fruit className="project-fruit" decorative />
                  </span>
                  <h3>{project.name}</h3>
                  <p>
                    <span className="card-kicker">Problema. </span>
                    {project.problem}
                  </p>
                  <p>
                    <span className="card-kicker">Qué hice. </span>
                    {project.did}
                  </p>
                  <ul className="tech-row">
                    {project.tech.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p>
                    <span className="card-kicker">Resultado. </span>
                    {project.result}
                  </p>
                  {project.category ? <p>{project.category}</p> : null}
                  <p>{project.link}</p>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
