import type { DragEvent, KeyboardEvent, MouseEvent } from 'react'
import GlobalControls, { type Direction } from '../../components/GlobalControls'
import type { Locale } from '../../types/vocabulary'
import { useMatchingRound } from '../matching/useMatchingRound'
import EducationDiagram from './EducationDiagram'
import { educationLevels, type EducationLevel } from './educationLevels'

interface EducationSessionProps {
  locale: Locale
  direction: Direction
  onLocaleChange: (locale: Locale) => void
  onDirectionToggle: () => void
  onExit: () => void
}

const copy = {
  ru: {
    title: 'Образование', subtitle: 'Сопоставь уровни образования со схемой',
    language: 'Язык интерфейса', direction: 'Направление слов', exit: 'Выйти',
    progress: 'Найдено уровней', labels: 'Уровни образования',
    instruction: 'Перетащи название на соответствующее место или выбери сначала название, а затем область схемы.',
    reset: 'Сбросить', correct: 'Верно!', incorrect: 'Не то место. Попробуй ещё раз.',
    complete: 'Все уровни найдены!', completeDescription: 'Отличная работа!',
    target: 'Место для уровня',
  },
  en: {
    title: 'Education', subtitle: 'Match the education levels to the diagram',
    language: 'Interface language', direction: 'Word direction', exit: 'Exit',
    progress: 'Levels found', labels: 'Education levels',
    instruction: 'Drag a label to its place, or select a label first and then a region of the diagram.',
    reset: 'Reset', correct: 'Correct!', incorrect: 'That is not the right place. Try again.',
    complete: 'All levels found!', completeDescription: 'Great work!',
    target: 'Place for level',
  },
} satisfies Record<Locale, Record<string, string>>

function targetFromEvent(target: EventTarget): EducationLevel | null {
  if (!(target instanceof Element)) return null
  const id = target.closest('[data-education-target]')?.getAttribute('data-education-target')
  return educationLevels.find((level) => level === id) ?? null
}

export default function EducationSession({
  locale,
  direction,
  onLocaleChange,
  onDirectionToggle,
  onExit,
}: EducationSessionProps) {
  const strings = copy[locale]
  const round = useMatchingRound(educationLevels)

  function handleTargetClick(event: MouseEvent<SVGSVGElement>) {
    const target = targetFromEvent(event.target)
    if (target) round.selectTarget(target)
  }

  function handleTargetKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const target = targetFromEvent(event.target)
    if (!target) return
    event.preventDefault()
    round.selectTarget(target)
  }

  function handleDragOver(event: DragEvent<SVGSVGElement>) {
    const target = targetFromEvent(event.target)
    if (!target || round.completed.has(target)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    round.dragOver(target)
  }

  function handleDrop(event: DragEvent<SVGSVGElement>) {
    const target = targetFromEvent(event.target)
    const item = event.dataTransfer.getData('text/plain') as EducationLevel
    if (!target || !educationLevels.includes(item) || round.completed.has(target)) return
    event.preventDefault()
    round.drop(item, target)
  }

  function handleDragLeave(event: DragEvent<SVGSVGElement>) {
    const nextTarget = event.relatedTarget
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) round.setDragTarget(null)
  }

  return (
    <main className="home-page session-page education-page">
      <div className="page-shell">
        <header className="topbar session-topbar">
          <div className="brand-block">
            <span aria-hidden="true" className="brand-mark">NL</span>
            <div>
              <p className="brand-name">{strings.title}</p>
              <p className="brand-subtitle">{round.isComplete ? strings.completeDescription : strings.subtitle}</p>
            </div>
          </div>
          <div className="session-controls">
            <GlobalControls direction={direction} directionLabel={strings.direction}
              languageLabel={strings.language} locale={locale} onDirectionToggle={onDirectionToggle}
              onLocaleChange={onLocaleChange} />
          </div>
        </header>

        <section aria-label={strings.title} className="education-session">
          <div className="province-toolbar">
            <div className="province-progress">
              <span className="progress-label">{strings.progress}</span>
              <span className="progress-count">{round.completed.size} / {educationLevels.length}</span>
              <div aria-label={strings.progress} aria-valuemax={educationLevels.length} aria-valuemin={0}
                aria-valuenow={round.completed.size} className="progress-track" role="progressbar">
                <span className="progress-fill" style={{ width: `${(round.completed.size / educationLevels.length) * 100}%` }} />
              </div>
            </div>
            <button className="reset-easy-words-button province-reset-button" onClick={round.reset} type="button">
              {strings.reset}
            </button>
          </div>
          <p className="province-instruction">{strings.instruction}</p>
          {round.feedback && <p aria-live="polite" className={`province-feedback is-${round.feedback}`}>
            {round.feedback === 'correct' ? strings.correct : strings.incorrect}
          </p>}

          <div className="education-game-grid">
            <div className="education-diagram-wrap">
              <EducationDiagram ariaLabel={strings.title} completed={round.completed} getTargetState={round.targetState}
                targetLabel={(level) => `${strings.target}: ${level}`} onClick={handleTargetClick}
                onKeyDown={handleTargetKeyDown} onDragOver={handleDragOver} onDrop={handleDrop}
                onDragLeave={handleDragLeave} />
            </div>
            <div className="education-label-panel">
              <h2>{strings.labels}</h2>
              {round.isComplete ? (
                <div className="matching-complete">
                  <span aria-hidden="true" className="completion-mark">✓</span>
                  <p>{strings.complete}</p>
                </div>
              ) : (
                <div className="education-label-list">
                  {round.remaining.map((level) => {
                    const itemState = round.itemState(level)
                    const itemClass = itemState === 'selected' ? 'active' : itemState
                    return (
                    <button aria-pressed={round.activeItem === level}
                      className={`education-label${itemClass ? ` is-${itemClass}` : ''}`}
                      draggable key={level} onClick={() => round.selectItem(level)}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', level)
                        event.dataTransfer.effectAllowed = 'move'
                        round.beginDrag(level)
                      }} onDragEnd={() => round.setDragTarget(null)} type="button">{level}</button>
                    )
                  })}
                </div>
              )}
              <div className="matching-panel-footer">
                <button className="exit-button matching-exit-button" onClick={onExit} type="button">{strings.exit}</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
