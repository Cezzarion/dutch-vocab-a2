interface ModeActionsProps {
  testLabel: string
  flashcardsLabel: string
  wordsInSetLabel: string
  emptySelectionLabel: string
  wordCount: number
  onStartFlashcards: () => void
}

export default function ModeActions({
  testLabel,
  flashcardsLabel,
  wordsInSetLabel,
  emptySelectionLabel,
  wordCount,
  onStartFlashcards,
}: ModeActionsProps) {
  return (
    <div className="mode-column">
      <button className="mode-button" type="button">{testLabel}</button>
      <button className="mode-button" disabled={wordCount === 0} onClick={onStartFlashcards} type="button">{flashcardsLabel}</button>
      <div aria-live="polite" className="selection-summary">
        <span className="selection-count">{wordCount}</span>
        <span>{wordsInSetLabel}</span>
        {wordCount === 0 && <span className="empty-selection">{emptySelectionLabel}</span>}
      </div>
    </div>
  )
}
