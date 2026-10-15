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

          <div className="about-courses" id="cursos">
            <div className="course-head">
              <h3 className="subsection-title">{about.coursesTitle}</h3>
              <span className="course-count">{about.courses.length}</span>
            </div>
            <ul className="course-list">
              {about.courses.map((item) => {
                const [year, ...detail] = item.meta.split(' · ')
                return (
                  <li key={item.title} className={`course-card tone-${item.tone}`}>
                    <span className="course-year">{year}</span>
                    <h4>{item.title}</h4>
                    <p>{detail.join(' · ')}</p>
                  </li>
                )
              })}
            </ul>
            <p className="course-note">{about.coursesNote}</p>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
