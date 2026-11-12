import { useState } from 'react'
import GlobalControls, { type Direction } from '../../components/GlobalControls'
import { getVocabularyEntryKey, shuffleEntries } from '../../domain/vocabulary'
import type { Locale, VocabularyEntry } from '../../types/vocabulary'

interface TestSessionProps {
  entries: VocabularyEntry[]
  locale: Locale
  direction: Direction
  onLocaleChange: (locale: Locale) => void
  onDirectionToggle: () => void
  onExit: () => void
  easyWordKeys: Set<string>
  onMarkEasy: (entry: VocabularyEntry) => void
}

const copy = {
  ru: {
    title: 'Тест', language: 'Язык интерфейса', direction: 'Направление слов',
    exit: 'Выйти', progress: 'Прогресс сессии', correct: 'Правильно', incorrect: 'Неправильно',
    markEasy: 'Убрать', markedEasy: 'Убрано', back: 'Назад', next: 'Дальше',
    completed: 'Все слова пройдены!', description: 'Вы завершили этот набор слов.',
    finish: 'На главную', question: 'Вопрос',
  },
  en: {
    title: 'Test', language: 'Interface language', direction: 'Word direction',
    exit: 'Exit', progress: 'Session progress', correct: 'Correct', incorrect: 'Incorrect',
    markEasy: 'Remove', markedEasy: 'Removed', back: 'Back', next: 'Next',
    completed: 'All words completed!', description: 'You have finished this vocabulary set.',
    finish: 'Back to start', question: 'Question',
  },
} satisfies Record<Locale, Record<string, string>>

function promptFor(entry: VocabularyEntry, locale: Locale, direction: Direction) {
  return direction === 'dutch-to-translation'
    ? entry.dutch
    : locale === 'ru' ? entry.russian : entry.english
}

function answerFor(entry: VocabularyEntry, locale: Locale, direction: Direction) {
  return direction === 'dutch-to-translation'
    ? locale === 'ru' ? entry.russian : entry.english
    : entry.dutch
}

export default function TestSession({
  entries,
  locale,
  direction,
  onLocaleChange,
  onDirectionToggle,
  onExit,
  easyWordKeys,
  onMarkEasy,
}: TestSessionProps) {
  const [questions] = useState(() => shuffleEntries(entries).map((entry) => {
    const entryKey = getVocabularyEntryKey(entry)
    const distractors = shuffleEntries(entries.filter((candidate) =>
      candidate.type_en === entry.type_en && getVocabularyEntryKey(candidate) !== entryKey,
    )).slice(0, 5)
    return { entry, options: shuffleEntries([entry, ...distractors]) }
  }))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [seenCount, setSeenCount] = useState(0)
  const [results, setResults] = useState<Record<number, { selectedKey: string; isCorrect: boolean }>>({})
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)

  const currentQuestion = questions[questionIndex]
  const currentEntry = currentQuestion?.entry
  const isComplete = questionIndex >= questions.length
  const strings = copy[locale]
  const currentResult = results[questionIndex]
  const isEasy = currentEntry ? easyWordKeys.has(getVocabularyEntryKey(currentEntry)) : false
  const options = currentQuestion?.options ?? []

  function choose(entry: VocabularyEntry) {
    if (!currentEntry || currentResult) return
    const optionKey = getVocabularyEntryKey(entry)
    const isCorrect = optionKey === getVocabularyEntryKey(currentEntry)
    setResults((current) => ({ ...current, [questionIndex]: { selectedKey: optionKey, isCorrect } }))
    if (isCorrect) setCorrectCount((count) => count + 1)
    else setIncorrectCount((count) => count + 1)
  }

  function advance() {
    if (!currentResult) return
    setSeenCount((count) => Math.max(count, questionIndex + 1))
    setQuestionIndex((index) => index + 1)
  }

  function goBack() {
    setQuestionIndex((index) => Math.max(0, index - 1))
  }

  function markEasy() {
    if (!currentEntry || isEasy) return
    onMarkEasy(currentEntry)
    if (!currentResult) {
      const currentKey = getVocabularyEntryKey(currentEntry)
      setResults((current) => ({ ...current, [questionIndex]: { selectedKey: currentKey, isCorrect: true } }))
      setCorrectCount((count) => count + 1)
    }
    setSeenCount((count) => Math.max(count, questionIndex + 1))
    setQuestionIndex((index) => index + 1)
  }

  return (
    <main className="home-page session-page">
      <div className="page-shell">
        <header className="topbar session-topbar">
          <div className="brand-block">
            <span aria-hidden="true" className="brand-mark">NL</span>
            <div>
              <p className="brand-name">{strings.title}</p>
              <p className="brand-subtitle">{isComplete ? strings.description : `${questionIndex + 1} / ${questions.length}`}</p>
            </div>
          </div>
          <div className="session-controls">
            <GlobalControls
              direction={direction}
              directionLabel={strings.direction}
              languageLabel={strings.language}
              locale={locale}
              onDirectionToggle={onDirectionToggle}
              onLocaleChange={onLocaleChange}
            />
          </div>
        </header>

        <section aria-label={strings.title} className="test-session">
          <div className="progress-row">
            <span className="progress-label">{strings.progress}</span>
            <span className="progress-count">{seenCount} / {questions.length}</span>
            <div aria-label={strings.progress} aria-valuemax={questions.length} aria-valuemin={0}
              aria-valuenow={seenCount} className="progress-track" role="progressbar">
              <span className="progress-fill" style={{ width: `${(seenCount / questions.length) * 100}%` }} />
            </div>
          </div>

          <div aria-live="polite" className="test-score">
            <span className="test-score-correct">{strings.correct}: <strong>{correctCount}</strong></span>
            <span className="test-score-incorrect">{strings.incorrect}: <strong>{incorrectCount}</strong></span>
          </div>

          {isComplete ? (
            <div className="session-complete">
              <span aria-hidden="true" className="completion-mark">✓</span>
              <h1>{strings.completed}</h1>
              <p>{strings.description}</p>
              <p className="test-final-score">{strings.correct}: {correctCount} · {strings.incorrect}: {incorrectCount}</p>
              <button className="next-button" onClick={onExit} type="button">{strings.finish}</button>
            </div>
          ) : currentEntry ? (
            <div className="test-stage">
             <div className="test-question">
              <div className="test-prompt">
                <span className="flashcard-side-label">{strings.question}</span>
                <h1>{promptFor(currentEntry, locale, direction)}</h1>
              </div>
              <div aria-label={strings.title} className="answer-options">
                {options.map((option) => {
                  const optionKey = getVocabularyEntryKey(option)
                  const isCorrect = optionKey === getVocabularyEntryKey(currentEntry)
                  const isSelected = currentResult?.selectedKey === optionKey
                  const revealedCorrect = currentResult?.isCorrect === false && isCorrect
                  const stateClass = isSelected && !isCorrect ? ' is-incorrect' :
                    (isSelected && isCorrect) || revealedCorrect ? ' is-correct' : ''
                  return (
                    <button
                      aria-pressed={isSelected}
                      className={`answer-option${stateClass}`}
                      disabled={Boolean(currentResult)}
                      key={optionKey}
                      onClick={() => choose(option)}
                      type="button"
                    >
                      {answerFor(option, locale, direction)}
                    </button>
                  )
                })}
              </div>
              <div className="card-navigation test-navigation">
                <button aria-pressed={isEasy} className="easy-button" disabled={isEasy}
                  onClick={markEasy} type="button">{isEasy ? strings.markedEasy : strings.markEasy}</button>
                <button className="next-button" disabled={questionIndex === 0} onClick={goBack}
                  type="button"><span aria-hidden="true">←</span>{strings.back}</button>
                <button className="next-button" disabled={!currentResult} onClick={advance}
                  type="button">{strings.next}<span aria-hidden="true">→</span></button>
              </div>
             </div>
              <button className="exit-button test-exit-button" onClick={onExit} type="button">{strings.exit}</button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
