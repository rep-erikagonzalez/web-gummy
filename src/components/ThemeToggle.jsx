export default function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={dark ? 'Usar tema claro' : 'Usar tema oscuro'}
      aria-pressed={dark}
    >
      <span className="theme-icon" key={theme}>
        {dark ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M14.5 3.2a8.2 8.2 0 1 0 6.3 12.6A8.5 8.5 0 0 1 14.5 3.2z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
            </g>
          </svg>
        )}
      </span>
    </button>
  )
}
