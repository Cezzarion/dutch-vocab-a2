import { useState } from 'react'
import GlobalControls, { type Direction } from '../../components/GlobalControls'
import type { Locale, VocabularyEntry } from '../../types/vocabulary'
import { getVocabularyEntryKey } from '../../domain/vocabulary'

interface FlashcardsSessionProps {
  entries: VocabularyEntry[]
  locale: Locale
  direction: Direction
  onLocaleChange: (locale: Locale) => void
  onDirectionToggle: () => void
  onExit: () => void
  easyWordKeys: Set<string>
  onMarkEasy: (entry: VocabularyEntry) => void
}

const sessionCopy = {
  ru: {
    title: 'Флипкарты',
    language: 'Язык интерфейса',
    direction: 'Направление слов',
    exit: 'Выйти',
    flipHint: 'Нажмите на карточку, чтобы увидеть ответ',
    markEasy: 'Убрать',
    markedEasy: 'Убрано',
    back: 'Назад',
    next: 'Дальше',
    completed: 'Все слова пройдены!',
    completedDescription: 'Вы завершили этот набор слов.',
    finish: 'На главную',
    progress: 'Прогресс сессии',
    question: 'Слово',
    answer: 'Перевод',
  },
  en: {
    title: 'Flashcards',
    language: 'Interface language',
    direction: 'Word direction',
    exit: 'Exit',
    flipHint: 'Click the card to reveal the answer',
    markEasy: 'Remove',
    markedEasy: 'Removed',
    back: 'Back',
    next: 'Next',
    completed: 'All words completed!',
    completedDescription: 'You have finished this vocabulary set.',
    finish: 'Back to start',
    progress: 'Session progress',
    question: 'Word',
    answer: 'Translation',
  },
} satisfies Record<Locale, Record<string, string>>

interface FlashcardProps {
  front: string
  back: string
  frontLabel: string
  backLabel: string
  flipHint: string
}

function Flashcard({ front, back, frontLabel, backLabel, flipHint }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const fontSizeFor = (word: string) => `clamp(15px, ${(360 / Math.max(word.length, 1)).toFixed(2)}cqi, 68px)`

  return (
    <button
      aria-label={isFlipped ? `${backLabel}: ${back}` : `${frontLabel}: ${front}. ${flipHint}`}
      aria-pressed={isFlipped}
      className={`flashcard${isFlipped ? ' is-flipped' : ''}`}
      onClick={() => setIsFlipped((flipped) => !flipped)}
      type="button"
    >
      <span className="flashcard-inner">
        <span aria-hidden={isFlipped} className="flashcard-face flashcard-front">
          <span className="flashcard-side-label">{frontLabel}</span>
          <span className="flashcard-word" style={{ fontSize: fontSizeFor(front) }}>{front}</span>
          <span className="flashcard-hint">{flipHint}</span>
        </span>
        <span aria-hidden={!isFlipped} className="flashcard-face flashcard-back">
          <span className="flashcard-side-label">{backLabel}</span>
          <span className="flashcard-word" style={{ fontSize: fontSizeFor(back) }}>{back}</span>
          <span className="flashcard-hint">{flipHint}</span>
        </span>
      </span>
    </button>
  )
}

export default function FlashcardsSession({
  entries,
  locale,
  direction,
  onLocaleChange,
  onDirectionToggle,
  onExit,
  easyWordKeys,
  onMarkEasy,
}: FlashcardsSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [seenCount, setSeenCount] = useState(1)
  const copy = sessionCopy[locale]
  const isComplete = currentIndex >= entries.length
  const currentEntry = entries[currentIndex]

  const front = currentEntry && (direction === 'dutch-to-translation'
    ? currentEntry.dutch
    : locale === 'ru' ? currentEntry.russian : currentEntry.english)
  const back = currentEntry && (direction === 'dutch-to-translation'
    ? locale === 'ru' ? currentEntry.russian : currentEntry.english
    : currentEntry.dutch)
  const frontLabel = direction === 'dutch-to-translation' ? copy.question : copy.answer
  const backLabel = direction === 'dutch-to-translation' ? copy.answer : copy.question
  const isEasy = currentEntry ? easyWordKeys.has(getVocabularyEntryKey(currentEntry)) : false

  function advance() {
    const nextIndex = currentIndex + 1
    if (nextIndex < entries.length) setSeenCount((count) => Math.max(count, nextIndex + 1))
    setCurrentIndex(nextIndex)
  }

  function goBack() {
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  return (
    <main className="home-page session-page">
      <div className="page-shell">
        <header className="topbar session-topbar">
          <div className="brand-block">
            <span aria-hidden="true" className="brand-mark">NL</span>
            <div>
              <p className="brand-name">{copy.title}</p>
              <p className="brand-subtitle">{isComplete ? copy.completedDescription : `${currentIndex + 1} / ${entries.length}`}</p>
            </div>
          </div>
          <div className="session-controls">
            <GlobalControls
              direction={direction}
              directionLabel={copy.direction}
              languageLabel={copy.language}
              locale={locale}
              onDirectionToggle={onDirectionToggle}
              onLocaleChange={onLocaleChange}
            />
          </div>
        </header>

        <section className="flashcard-session" aria-label={copy.title}>
          <div className="progress-row">
            <span className="progress-label">{copy.progress}</span>
            <span className="progress-count">{seenCount} / {entries.length}</span>
            <div
              aria-label={copy.progress}
              aria-valuemax={entries.length}
              aria-valuemin={0}
              aria-valuenow={seenCount}
              className="progress-track"
              role="progressbar"
            >
              <span
                className="progress-fill"
                style={{ width: `${(seenCount / entries.length) * 100}%` }}
              />
            </div>
          </div>

          {isComplete ? (
            <div className="session-complete">
              <span aria-hidden="true" className="completion-mark">✓</span>
              <h1>{copy.completed}</h1>
              <p>{copy.completedDescription}</p>
              <div className="completion-actions">
                <button className="next-button" onClick={goBack} type="button">← {copy.back}</button>
                <button className="next-button" onClick={onExit} type="button">{copy.finish}</button>
              </div>
            </div>
          ) : (
            <div className="flashcard-stage">
              <Flashcard
                back={back ?? ''}
                backLabel={backLabel}
                flipHint={copy.flipHint}
                front={front ?? ''}
                frontLabel={frontLabel}
                key={currentIndex}
              />
              <div className="card-navigation">
                {currentEntry && (
                  <button
                    aria-pressed={isEasy}
                    className="easy-button"
                    disabled={isEasy}
                    onClick={() => {
                      onMarkEasy(currentEntry)
                      advance()
                    }}
                    type="button"
                  >
                    {isEasy ? copy.markedEasy : copy.markEasy}
                  </button>
                )}
                <button className="next-button" disabled={currentIndex === 0} onClick={goBack} type="button"><span aria-hidden="true">←</span>{copy.back}</button>
                <button className="next-button" onClick={advance} type="button">{copy.next}<span aria-hidden="true">→</span></button>
              </div>
              <button className="exit-button" onClick={onExit} type="button">{copy.exit}</button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
