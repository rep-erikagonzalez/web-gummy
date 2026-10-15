import { tools } from '../data/content'
import { FRUIT_CYCLE, FRUITS } from './fruits'
import SectionDecor from './Decor'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

function Group({ items, pill, hidden }) {
  return (
    <ul className="marquee-group" aria-hidden={hidden ? true : undefined}>
      {items.map((item, index) => {
        const Fruit = FRUITS[FRUIT_CYCLE[index % FRUIT_CYCLE.length]]
        return (
          <li className="marquee-item" key={`${hidden ? 'b' : 'a'}-${item}`}>
            <span>{item}</span>
            <Fruit className="tool-fruit" decorative />
          </li>
        )
      })}
      {pill ? <li className="tool-pill">{pill}</li> : null}
    </ul>
  )
}

function Marquee({ items, pill, reverse, label }) {
  return (
    <div className={`marquee${reverse ? ' is-reverse' : ''}`} aria-label={label}>
      <div className="marquee-track">
        <Group items={items} pill={pill} />
        <Group items={items} pill={pill} hidden />
      </div>
    </div>
  )
}

export default function Tools() {
  const TitleFruit = FRUITS.pear

  return (
    <section className="band band-alt" id="herramientas" aria-labelledby="herramientas-title">
      <SectionDecor
        items={[
          { fruit: 'berry', place: 'tl' },
          { fruit: 'star', place: 'tr' },
          { fruit: 'bloom', place: 'br' },
        ]}
      />
      <div className="band-inner">
        <Reveal>
          <SectionTitle id="herramientas-title" fruit={TitleFruit} tone="pear">
            {tools.title}
          </SectionTitle>
          <div className="marquee-stack">
            <Marquee items={tools.code} label={tools.code.join(', ')} />
            <Marquee items={tools.practice} pill={tools.more} reverse label={tools.practice.join(', ')} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
