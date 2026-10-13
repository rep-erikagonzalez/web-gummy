import { useEffect, useId, useState } from 'react'
import ThemeToggle from './ThemeToggle'

export const NAV = [
  { href: '#sobre-mi', label: 'Sobre mí', dot: 'berry' },
  { href: '#que-hago', label: 'Qué hago', dot: 'pear' },
  { href: '#proyectos', label: 'Proyectos', dot: 'bloom' },
  { href: '#ecosistema', label: 'Ecosistema IA', dot: 'star' },
  { href: '#contacto', label: 'Contacto', dot: 'ink' },
]

function NavLinks({ onNavigate }) {
  return NAV.map((item) => (
    <a key={item.href} className="nav-pill" href={item.href} onClick={onNavigate}>
      <span className={`dot dot-${item.dot}`} />
      {item.label}
    </a>
  ))
}

export default function Header({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const panelId = useId()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <a className="brand-lockup" href="#inicio">
        <span className="logo-marks" aria-hidden="true">
          <i />
          <i />
        </span>
        <span>erika / gonzález</span>
      </a>

      <nav className="nav-desktop" aria-label="Secciones">
        <NavLinks />
      </nav>

      <div className="header-tools">
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Cerrar' : 'Menú'}
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <nav id={panelId} className={`nav-panel${open ? ' is-open' : ''}`} aria-label="Secciones">
        <NavLinks onNavigate={() => setOpen(false)} />
      </nav>
    </header>
  )
}
