import { useLayoutEffect, useRef, useState } from 'react'

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Reveal({ children, className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return undefined
    if (reducedMotion()) {
      setShown(true)
      return undefined
    }

    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      setShown(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { threshold: 0.12 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal${shown ? ' is-in' : ''}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
