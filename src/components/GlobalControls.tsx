import type { Locale } from '../types/vocabulary'

export type Direction = 'dutch-to-translation' | 'translation-to-dutch'

interface GlobalControlsProps {
  locale: Locale
  direction: Direction
  languageLabel: string
  directionLabel: string
  onLocaleChange: (locale: Locale) => void
  onDirectionToggle: () => void
}

export default function GlobalControls({
  locale,
  direction,
  languageLabel,
  directionLabel,
  onLocaleChange,
  onDirectionToggle,
}: GlobalControlsProps) {
  const directionText = direction === 'dutch-to-translation'
    ? `NL → ${locale.toUpperCase()}`
    : `${locale.toUpperCase()} → NL`

  return (
    <div className="global-controls">
      <div className="locale-control">
        <span className="control-label">{languageLabel}</span>
        <div className="segmented-control" role="group" aria-label={languageLabel}>
          {(['ru', 'en'] as const).map((option) => (
            <button
              aria-pressed={locale === option}
              className={locale === option ? 'segment is-active' : 'segment'}
              key={option}
              onClick={() => onLocaleChange(option)}
              type="button"
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="direction-control">
        <span className="control-label">{directionLabel}</span>
        <button
          aria-label={`${directionLabel}: ${directionText}`}
          className="direction-button"
          onClick={onDirectionToggle}
          type="button"
        >
          {directionText}<span aria-hidden="true" className="direction-switch-icon">⇄</span>
        </button>
      </div>
    </div>
  )
}
