import { useEffect, useId, useState } from 'react'
import { nav } from '../data/content'
import ThemeToggle from './ThemeToggle'

function NavLinks({ current, onNavigate }) {
  return nav.map((item) => (
    <a
      key={item.href}
      className={`nav-pill${current === item.href ? ' is-current' : ''}`}
      href={item.href}
      aria-current={current === item.href ? 'true' : undefined}
      onClick={onNavigate}
    >
      <span className={`dot dot-${item.dot}`} />
      {item.label}
    </a>
  ))
}

function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  )
}

export default function Header({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [current, setCurrent] = useState('')
  const panelId = useId()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
      const line = window.innerHeight * 0.35
      let next = ''
      for (const item of nav) {
        const node = document.getElementById(item.href.slice(1))
        if (!node) continue
        if (node.getBoundingClientRect().top <= line) next = item.href
      }
      setCurrent((previous) => (previous === next ? previous : next))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      html.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1025px)')
    const close = () => {
      if (media.matches) setOpen(false)
    }
    media.addEventListener('change', close)
    return () => media.removeEventListener('change', close)
  }, [])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-menu' : ''}`}>
      <a className="brand-lockup" href="#inicio">
        <span className="logo-marks" aria-hidden="true">
          <i />
          <i />
        </span>
        <span>erika / gonzález</span>
      </a>

      <nav className="nav-desktop" aria-label="Secciones">
        <NavLinks current={current} />
      </nav>

      <div className="header-tools">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      <nav id={panelId} className={`nav-panel${open ? ' is-open' : ''}`} aria-label="Secciones">
        <NavLinks current={current} onNavigate={() => setOpen(false)} />
      </nav>
    </header>
  )
}
