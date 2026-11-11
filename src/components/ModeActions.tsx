interface ModeActionsProps {
  testLabel: string
  flashcardsLabel: string
  wordsInSetLabel: string
  emptySelectionLabel: string
  wordCount: number
  onStartFlashcards: () => void
  removedWordCount: number
  removedWordsLabel: string
  resetRemovedWordsLabel: string
  onResetRemovedWords: () => void
}

export default function ModeActions({
  testLabel,
  flashcardsLabel,
  wordsInSetLabel,
  emptySelectionLabel,
  wordCount,
  onStartFlashcards,
  removedWordCount,
  removedWordsLabel,
  resetRemovedWordsLabel,
  onResetRemovedWords,
}: ModeActionsProps) {
  return (
    <div className="mode-column">
      <div className="easy-words-toolbar">
        <span aria-live="polite" className="easy-words-count">
          {removedWordsLabel}: <strong>{removedWordCount}</strong>
        </span>
        <button
          className="reset-easy-words-button"
          disabled={removedWordCount === 0}
          onClick={onResetRemovedWords}
          type="button"
        >
          {resetRemovedWordsLabel}
        </button>
      </div>
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
