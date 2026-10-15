import Header from './components/Header'
import About from './sections/About'
import Contact from './sections/Contact'
import Ecosystem from './sections/Ecosystem'
import Footer from './sections/Footer'
import Hero from './sections/Hero'
import Projects from './sections/Projects'
import Services from './sections/Services'
import Tools from './sections/Tools'
import { useTheme } from './theme/useTheme'
import './App.css'
import './sections/sections.css'
import './sections/content.css'

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
        <About />
        <Services />
        <Projects />
        <Tools />
        <Ecosystem />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
