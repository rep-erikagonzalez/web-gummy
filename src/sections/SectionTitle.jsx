export default function SectionTitle({ id, fruit: Fruit, tone, children }) {
  return (
    <h2 id={id} className={`section-title tone-${tone}`}>
      <Fruit className="title-fruit" decorative />
      <span className="title-words">
        {children}
        <svg className="title-wave" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path
            d="M0 8C10 2 20 2 30 8S50 14 60 8 80 2 90 8 110 14 120 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </h2>
  )
}
