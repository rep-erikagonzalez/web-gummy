import { useId } from 'react'

function svgId() {
  return useId().replace(/[^a-zA-Z0-9]/g, '')
}

function FruitSvg({ className, children, label, decorative = false }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 140"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function FlatStrawberry({ className, decorative = false }) {
  const id = svgId()
  return (
    <FruitSvg className={className} label="Fresa" decorative={decorative}>
      <defs>
        <radialGradient id={`${id}-pulp`} cx="48%" cy="40%" r="62%">
          <stop offset="0%" stopColor="var(--fruit-core)" />
          <stop offset="42%" stopColor="var(--fruit-flesh)" />
          <stop offset="100%" stopColor="var(--fruit-berry)" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="68%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M38 46H82C98 46 108 58 106 74C103 94 88 114 72 126C64 132 56 132 48 126C32 114 17 94 14 74C12 58 22 46 38 46Z"
        fill="var(--fruit-berry)"
      />
      <path
        d="M46 56H74C86 56 94 66 92 78C90 94 78 110 66 118C60 122 54 122 48 118C36 110 26 94 24 78C22 66 30 56 46 56Z"
        fill={`url(#${id}-pulp)`}
      />
      <path
        d="M60 70C56 58 54 52 60 48C66 52 64 58 60 70C58 82 56 90 60 96C64 90 62 82 60 70Z"
        fill="var(--fruit-core)"
        opacity="0.9"
      />
      <g stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" strokeLinecap="round">
        <path d="M60 66L48 74" />
        <path d="M60 66L72 76" />
        <path d="M60 70L46 88" />
        <path d="M60 70L74 90" />
        <path d="M60 74L52 98" />
        <path d="M60 74L68 100" />
      </g>
      <g fill="var(--fruit-seed)">
        <ellipse cx="34" cy="68" rx="3.2" ry="1.8" transform="rotate(-28 34 68)" />
        <ellipse cx="86" cy="70" rx="3.2" ry="1.8" transform="rotate(26 86 70)" />
        <ellipse cx="28" cy="84" rx="3" ry="1.7" transform="rotate(-48 28 84)" />
        <ellipse cx="92" cy="86" rx="3" ry="1.7" transform="rotate(46 92 86)" />
        <ellipse cx="36" cy="100" rx="2.8" ry="1.6" transform="rotate(-70 36 100)" />
        <ellipse cx="84" cy="102" rx="2.8" ry="1.6" transform="rotate(68 84 102)" />
        <ellipse cx="50" cy="112" rx="2.6" ry="1.5" transform="rotate(-80 50 112)" />
        <ellipse cx="70" cy="112" rx="2.6" ry="1.5" transform="rotate(80 70 112)" />
      </g>
      <ellipse cx="48" cy="70" rx="16" ry="9" fill={`url(#${id}-shine)`} transform="rotate(-28 48 70)" />
      <g fill="var(--fruit-leaf)">
        <ellipse cx="60" cy="30" rx="7" ry="15" />
        <ellipse cx="44" cy="38" rx="6.5" ry="13" transform="rotate(-58 44 38)" />
        <ellipse cx="76" cy="38" rx="6.5" ry="13" transform="rotate(58 76 38)" />
        <ellipse cx="34" cy="50" rx="5.5" ry="11" transform="rotate(-105 34 50)" />
        <ellipse cx="86" cy="50" rx="5.5" ry="11" transform="rotate(105 86 50)" />
      </g>
    </FruitSvg>
  )
}

export function FlatPear({ className, decorative = false }) {
  const id = svgId()
  return (
    <FruitSvg className={className} label="Pera" decorative={decorative}>
      <defs>
        <radialGradient id={`${id}-pulp`} cx="46%" cy="42%" r="64%">
          <stop offset="0%" stopColor="#fffdf4" />
          <stop offset="48%" stopColor="var(--fruit-cream)" />
          <stop offset="100%" stopColor="var(--fruit-pear)" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M60 20C72 20 80 32 82 46C86 62 106 76 108 96C110 118 88 132 60 132C32 132 10 118 12 96C14 76 34 62 38 46C40 32 48 20 60 20Z"
        fill="var(--fruit-pear)"
      />
      <path
        d="M60 32C70 32 76 42 78 54C80 66 96 78 98 96C100 112 84 122 60 122C36 122 20 112 22 96C24 78 40 66 42 54C44 42 50 32 60 32Z"
        fill={`url(#${id}-pulp)`}
      />
      <g fill="var(--fruit-pit)">
        <path d="M52 86c5-8 10-8 10 0c-2 6-8 8-10 0z" />
        <path d="M56 100c5-8 10-8 10 0c-2 6-8 8-10 0z" />
      </g>
      <ellipse cx="50" cy="78" rx="14" ry="8" fill={`url(#${id}-shine)`} transform="rotate(-32 50 78)" />
      <path d="M60 20c2-12 10-16 10-16" fill="none" stroke="var(--fruit-pit)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M68 10c10 2 16 12 12 18c-8-2-14-8-12-18z" fill="var(--fruit-leaf)" />
    </FruitSvg>
  )
}

export function FlatBlossom({ className, decorative = false }) {
  const id = svgId()
  return (
    <FruitSvg className={className} label="Flor" decorative={decorative}>
      <defs>
        <radialGradient id={`${id}-petal`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff6f8" />
          <stop offset="55%" stopColor="var(--fruit-bloom)" />
          <stop offset="100%" stopColor="var(--fruit-berry)" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="72%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill={`url(#${id}-petal)`} stroke="var(--fruit-berry)" strokeWidth="5" strokeLinejoin="round">
        <ellipse cx="60" cy="36" rx="15" ry="22" />
        <ellipse cx="94" cy="62" rx="15" ry="22" transform="rotate(72 94 62)" />
        <ellipse cx="82" cy="102" rx="15" ry="22" transform="rotate(144 82 102)" />
        <ellipse cx="38" cy="102" rx="15" ry="22" transform="rotate(216 38 102)" />
        <ellipse cx="26" cy="62" rx="15" ry="22" transform="rotate(288 26 62)" />
      </g>
      <circle cx="60" cy="74" r="12" fill="var(--fruit-star)" stroke="color-mix(in srgb, var(--fruit-star) 55%, #8a5a10)" strokeWidth="3" />
      <ellipse cx="50" cy="46" rx="10" ry="6" fill={`url(#${id}-shine)`} transform="rotate(-20 50 46)" />
    </FruitSvg>
  )
}

export function FlatStarfruit({ className, decorative = false }) {
  const id = svgId()
  return (
    <FruitSvg className={className} label="Carambola" decorative={decorative}>
      <defs>
        <radialGradient id={`${id}-pulp`} cx="42%" cy="40%" r="68%">
          <stop offset="0%" stopColor="#fffbe8" />
          <stop offset="46%" stopColor="var(--fruit-star)" />
          <stop offset="100%" stopColor="var(--fruit-pear)" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M60 14L76 48L114 52L84 78L94 116L60 98L26 116L36 78L6 52L44 48Z"
        fill="var(--fruit-pear)"
      />
      <path
        d="M60 32L72 56L100 59L80 78L88 106L60 92L32 106L40 78L20 59L48 56Z"
        fill={`url(#${id}-pulp)`}
      />
      <ellipse cx="52" cy="62" rx="12" ry="7" fill={`url(#${id}-shine)`} transform="rotate(-24 52 62)" />
    </FruitSvg>
  )
}

export function FlatCluster() {
  return (
    <div className="flat-cluster" aria-hidden="true">
      <FlatBlossom className="flat-piece flat-bloom" decorative />
      <FlatStrawberry className="flat-piece flat-berry" decorative />
      <FlatPear className="flat-piece flat-pear" decorative />
      <FlatStarfruit className="flat-piece flat-star" decorative />
    </div>
  )
}
