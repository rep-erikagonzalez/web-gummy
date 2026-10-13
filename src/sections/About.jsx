import { useState } from 'react'
import { FlatPear, FlatStrawberry } from '../components/flat-jellies/FlatFruits'
import SectionDecor from './Decor'
import SectionTitle from './SectionTitle'

const STUDIES = [
  {
    title: 'Maestría en Dirección y Gestión de Tecnologías de la Información (TI)',
    place: 'Universidad Internacional de La Rioja',
    when: 'En curso',
    tone: 'berry',
  },
  {
    title: 'Ingeniería de Sistemas',
    place: 'Universidad Nacional Abierta y a Distancia',
    when: '2017–2021',
    tone: 'pear',
  },
  {
    title: 'Tecnología en Análisis y Desarrollo de Sistemas de Información',
    place: 'SENA',
    when: '2014–2016',
    tone: 'bloom',
  },
  {
    title: 'Bachillerato Técnico en Programación Informática',
    place: 'Colegio Ciudad Cuba / SENA',
    when: '2013',
    tone: 'star',
  },
]

export default function About() {
  const [photoReady, setPhotoReady] = useState(true)

  return (
    <section className="band" id="sobre-mi" aria-labelledby="sobre-title">
      <SectionDecor
        items={[
          { fruit: 'star', place: 'tr' },
          { fruit: 'bloom', place: 'bl' },
          { fruit: 'pear', place: 'br' },
        ]}
      />
      <div className="band-inner">
        <SectionTitle id="sobre-title" fruit={FlatStrawberry} tone="berry">
          Sobre mí
        </SectionTitle>
        <div className="about-layout">
          <div className="about-side">
            <div className="portrait-wrap">
              <div className="portrait">
                {photoReady ? (
                  <img
                    src="/images/erika.png"
                    alt="Erika González"
                    width="640"
                    height="640"
                    onError={() => setPhotoReady(false)}
                  />
                ) : (
                  <p className="portrait-fallback">[Foto: /images/erika.png]</p>
                )}
              </div>
              <span aria-hidden="true">
                <FlatStrawberry className="float-fruit float-berry" decorative />
                <FlatPear className="float-fruit float-pear" decorative />
              </span>
            </div>
            <p className="about-copy">
              Llevo años entre código, bases de datos, webs y proyectos. Me gusta aprender, probar y dejar las cosas un
              poco más simples. No tengo una fórmula: pruebo, me equivoco y vuelvo a intentar.
            </p>
          </div>

          <div className="about-studies">
            <h3 className="subsection-title">Formación</h3>
            <ol className="timeline">
              {STUDIES.map((item) => (
                <li key={item.title}>
                  <span className={`timeline-dot dot-${item.tone}`} aria-hidden="true" />
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.place}</p>
                    <p className="timeline-when">{item.when}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="belief">
            <h3 className="subsection-title">Cómo veo la tecnología</h3>
            <p className="belief-line">No quiero hacer tecnología por hacer tecnología.</p>
            <p>[COMPLETAR: 2 o 3 frases sobre cómo ves la tecnología en el trabajo diario.]</p>
          </div>
        </div>
      </div>
    </section>
  )
}
