import { services } from '../data/content'
import { FlatPear } from '../components/flat-jellies/FlatFruits'
import SectionDecor from './Decor'
import { FRUITS } from './fruits'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

export default function Services() {
  return (
    <section className="band band-alt" id="que-hago" aria-labelledby="hago-title">
      <SectionDecor
        items={[
          { fruit: 'bloom', place: 'tl' },
          { fruit: 'berry', place: 'br' },
          { fruit: 'pear', place: 'bl' },
        ]}
      />
      <div className="band-inner">
        <Reveal>
        <SectionTitle id="hago-title" fruit={FlatPear} tone="pear">
          {services.title}
        </SectionTitle>
        <ul className="service-row">
          {services.items.map(({ id, fruit, tone, title, text }) => {
            const Fruit = FRUITS[fruit]
            return (
            <li key={id} className={`service-card tone-${tone}`}>
              <span aria-hidden="true">
                <Fruit className="service-fruit" decorative />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
            )
          })}
        </ul>
        </Reveal>
      </div>
    </section>
  )
}
