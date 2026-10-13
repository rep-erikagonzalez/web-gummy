import { FlatPear, FlatStarfruit, FlatStrawberry } from '../components/flat-jellies/FlatFruits'
import SectionDecor from './Decor'
import SectionTitle from './SectionTitle'

const SERVICES = [
  {
    id: 'software',
    Fruit: FlatStrawberry,
    tone: 'berry',
    title: 'Software y sitios que alguien va a abrir',
    text: 'Desarrollo web, landings, de la idea a algo usable.',
  },
  {
    id: 'systems',
    Fruit: FlatPear,
    tone: 'pear',
    title: 'Sistemas que se hablan',
    text: 'APIs, integraciones, liderazgo técnico.',
  },
  {
    id: 'teach',
    Fruit: FlatStarfruit,
    tone: 'star',
    title: 'Aprendo y lo enseño',
    text: 'Formación digital, IA aplicada.',
  },
]

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
        <SectionTitle id="hago-title" fruit={FlatPear} tone="pear">
          Qué hago
        </SectionTitle>
        <ul className="service-row">
          {SERVICES.map(({ id, Fruit, tone, title, text }) => (
            <li key={id} className={`service-card tone-${tone}`}>
              <span aria-hidden="true">
                <Fruit className="service-fruit" decorative />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
