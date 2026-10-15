import { useState } from 'react'
import { about } from '../data/content'
import { FlatPear, FlatStrawberry } from '../components/flat-jellies/FlatFruits'
import SectionDecor from './Decor'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

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
        <Reveal>
        <SectionTitle id="sobre-title" fruit={FlatStrawberry} tone="berry">
          {about.title}
        </SectionTitle>
        <div className="about-layout">
          <div className="about-side">
            <div className="portrait-wrap">
              <div className="portrait">
                {photoReady ? (
                  <img
                    src="/images/erika.png"
                    alt={about.photoAlt}
                    width="640"
                    height="640"
                    onError={() => setPhotoReady(false)}
                  />
                ) : (
                  <p className="portrait-fallback">{about.photoFallback}</p>
                )}
              </div>
              <span aria-hidden="true">
                <FlatStrawberry className="float-fruit float-berry" decorative />
                <FlatPear className="float-fruit float-pear" decorative />
              </span>
            </div>
            <p className="about-copy">{about.bio}</p>
          </div>

          <div className="about-studies" id="formacion">
            <h3 className="subsection-title">{about.studiesTitle}</h3>
            <ol className="timeline">
              {about.studies.map((item) => (
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

          <div className="belief" id="tecnologia">
            <h3 className="subsection-title">{about.beliefTitle}</h3>
            <p className="belief-line">{about.beliefLine}</p>
            <p className="belief-copy">{about.belief}</p>
            <ul className="principle-row">
              {about.principles.map((item) => (
                <li key={item.label} className="principle">
                  <span className={`dot dot-${item.tone}`} aria-hidden="true" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
