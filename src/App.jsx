import Header from './components/Header'
import About from './sections/About'
import Hero from './sections/Hero'
import Projects from './sections/Projects'
import Services from './sections/Services'
import Stats from './sections/Stats'
import { useTheme } from './theme/useTheme'
import './App.css'
import './sections/sections.css'

export default function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main id="contenido">
        <Hero theme={theme} />
        <Stats />
        <About />
        <Services />
        <Projects />
      </main>
    </>
  )
}
