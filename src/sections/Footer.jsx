import { useLayoutEffect, useRef } from 'react'
import { config, footer } from '../data/content'
import { FRUITS } from './fruits'

const PEEKS = [
  { fruit: 'berry', left: '7%', spin: -16 },
  { fruit: 'pear', left: '23%', spin: 8 },
  { fruit: 'bloom', left: '39%', spin: -8 },
  { fruit: 'star', left: '55%', spin: 12 },
  { fruit: 'berry', left: '71%', spin: -12 },
  { fruit: 'pear', left: '87%', spin: 6 },
]

function FitName({ text }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const fit = () => {
      const parent = node.parentElement
      if (!parent || parent.clientWidth < 1) return
      const probe = document.createElement('span')
      probe.textContent = text
      probe.style.cssText =
        'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;white-space:nowrap;font-family:"Archivo Black","Arial Black",Impact,sans-serif;font-size:100px;letter-spacing:-0.045em;'
      parent.appendChild(probe)
      if (!probe.scrollWidth) {
        probe.remove()
        return
      }
      const next = Math.min((100 * parent.clientWidth) / probe.scrollWidth, 148)
      probe.remove()
      node.style.fontSize = `${next.toFixed(2)}px`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [text])

  return (
    <p className="footer-name" ref={ref}>
      {text}
    </p>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const TopFruit = FRUITS.berry

  return (
    <footer className="site-footer">
      <div className="footer-peeks" aria-hidden="true">
        {PEEKS.map((item) => {
          const Fruit = FRUITS[item.fruit]
          return (
            <span
              key={`${item.fruit}-${item.left}`}
              className="footer-peek"
              style={{ left: item.left, '--spin': `${item.spin}deg` }}
            >
              <Fruit decorative />
            </span>
          )
        })}
      </div>
      <div className="footer-inner">
        <FitName text={footer.name} />
        <div className="footer-cols">
          {footer.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-meta">
          <p>{footer.tagline}</p>
          <p>
            <a href={`mailto:${config.email}`}>{config.email}</a>
            <span aria-hidden="true"> · </span>
            {config.location}
          </p>
          <p>
            © {year} {footer.rightsName}
          </p>
          <p>{footer.credit}</p>
        </div>
        <a className="totop" href="#inicio">
          <TopFruit className="totop-fruit" decorative />
          {footer.toTop}
        </a>
      </div>
    </footer>
  )
}
