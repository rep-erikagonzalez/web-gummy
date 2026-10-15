import { useEffect, useRef } from 'react'
import { FlatBlossom, FlatPear, FlatStarfruit, FlatStrawberry } from '../components/flat-jellies/FlatFruits'

const FRUITS = {
  berry: FlatStrawberry,
  pear: FlatPear,
  bloom: FlatBlossom,
  star: FlatStarfruit,
}

export default function SectionDecor({ items }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let frame = 0
    const update = () => {
      const rect = node.getBoundingClientRect()
      const delta = rect.top + rect.height * 0.5 - window.innerHeight * 0.5
      const shift = Math.max(-12, Math.min(12, -delta * 0.035))
      node.style.setProperty('--parallax', `${shift.toFixed(2)}px`)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="section-decor" ref={ref} aria-hidden="true">
      {items.map((item) => {
        const Fruit = FRUITS[item.fruit]
        return <Fruit key={`${item.fruit}-${item.place}`} className={`decor-piece decor-${item.place}`} decorative />
      })}
    </div>
  )
}
