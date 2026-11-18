import { useMemo, useState, type DragEvent, type KeyboardEvent, type MouseEvent } from 'react'
import GlobalControls, { type Direction } from '../../components/GlobalControls'
import { provinces, type ProvinceId } from '../../data/provinces'
import { shuffleEntries } from '../../domain/vocabulary'
import type { Locale } from '../../types/vocabulary'
import provinceMapSvg from '../../assets/netherlands-provinces-map.svg?raw'

interface ProvincesMapSessionProps {
  locale: Locale
  direction: Direction
  onLocaleChange: (locale: Locale) => void
  onDirectionToggle: () => void
  onExit: () => void
}

const copy = {
  ru: {
    title: 'Карта провинций', subtitle: 'Перенеси названия на карту',
    language: 'Язык интерфейса', direction: 'Направление слов', exit: 'Выйти',
    progress: 'Найдено провинций', labels: 'Названия провинций',
    instruction: 'Перетащи название на нужную область. Или сначала выбери название либо область карты, а затем нажми на пару.',
    reset: 'Сбросить', correct: 'Верно!', incorrect: 'Не та провинция. Попробуй ещё раз.',
    complete: 'Все провинции найдены!', completeDescription: 'Отличная работа!',
    selectProvince: 'Выбрать провинцию',
  },
  en: {
    title: 'Provinces map', subtitle: 'Place the names on the map',
    language: 'Interface language', direction: 'Word direction', exit: 'Exit',
    progress: 'Provinces found', labels: 'Province names',
    instruction: 'Drag a name to the matching area, or select either a name or a map area and then click its match.',
    reset: 'Reset', correct: 'Correct!', incorrect: 'Wrong province. Try again.',
    complete: 'All provinces found!', completeDescription: 'Great work!',
    selectProvince: 'Select province',
  },
} satisfies Record<Locale, Record<string, string>>

function findProvinceId(target: EventTarget): ProvinceId | null {
  if (!(target instanceof Element)) return null
  const id = target.closest('[data-province]')?.getAttribute('data-province')
  return provinces.find((province) => province.id === id)?.id ?? null
}

export default function ProvincesMapSession({
  locale,
  direction,
  onLocaleChange,
  onDirectionToggle,
  onExit,
}: ProvincesMapSessionProps) {
  const strings = copy[locale]
  const [completedIds, setCompletedIds] = useState<Set<ProvinceId>>(() => new Set())
  const [wrongTargetId, setWrongTargetId] = useState<ProvinceId | null>(null)
  const [wrongLabelId, setWrongLabelId] = useState<ProvinceId | null>(null)
  const [activeProvinceId, setActiveProvinceId] = useState<ProvinceId | null>(null)
  const [activeTargetId, setActiveTargetId] = useState<ProvinceId | null>(null)
  const [dragTargetId, setDragTargetId] = useState<ProvinceId | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [provinceOrder, setProvinceOrder] = useState(() => shuffleEntries([...provinces]))
  const isComplete = completedIds.size === provinces.length
  const remainingProvinces = provinceOrder.filter(({ id }) => !completedIds.has(id))

  const mapMarkup = useMemo(() => provinces.reduce((markup, province) => {
    const stateClass = completedIds.has(province.id)
      ? ' is-correct'
      : wrongTargetId === province.id ? ' is-incorrect'
        : activeTargetId === province.id ? ' is-target-selected'
          : dragTargetId === province.id ? ' is-drop-target' : ''
    const targetMarkup = `class="province-region" data-province="${province.id}"`
    const accessibleTargetMarkup = `class="province-region${stateClass}" data-province="${province.id}"`
    const withClass = markup.replace(targetMarkup, accessibleTargetMarkup)
    return withClass.replace(
      `data-name="${province.name}"`,
      `data-name="${province.name}" tabindex="0" role="button" aria-pressed="${activeTargetId === province.id}" aria-label="${strings.selectProvince}: ${province.name}"`,
    )
  }, provinceMapSvg), [activeTargetId, completedIds, dragTargetId, strings.selectProvince, wrongTargetId])

  function clearIncorrectFeedback() {
    setWrongTargetId(null)
    setWrongLabelId(null)
    setFeedback(null)
  }

  function placeProvince(labelId: ProvinceId, targetId: ProvinceId) {
    if (completedIds.has(labelId)) return
    if (labelId !== targetId) {
      setWrongTargetId(targetId)
      setWrongLabelId(labelId)
      setActiveProvinceId(labelId)
      setActiveTargetId(null)
      setFeedback('incorrect')
      return
    }

    setCompletedIds((current) => new Set(current).add(labelId))
    setWrongTargetId(null)
    setWrongLabelId(null)
    setActiveProvinceId(null)
    setActiveTargetId(null)
    setFeedback('correct')
  }

  function resetRound() {
    setCompletedIds(new Set())
    setWrongTargetId(null)
    setWrongLabelId(null)
    setActiveProvinceId(null)
    setActiveTargetId(null)
    setFeedback(null)
    setProvinceOrder(shuffleEntries([...provinces]))
  }

  function handleMapClick(event: MouseEvent<HTMLDivElement>) {
    const targetId = findProvinceId(event.target)
    if (!targetId) return
    if (activeProvinceId) {
      placeProvince(activeProvinceId, targetId)
      return
    }
    clearIncorrectFeedback()
    setActiveTargetId((current) => current === targetId ? null : targetId)
  }

  function handleMapKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const targetId = findProvinceId(event.target)
    if (!targetId) return
    event.preventDefault()
    if (activeProvinceId) {
      placeProvince(activeProvinceId, targetId)
    } else {
      clearIncorrectFeedback()
      setActiveTargetId(targetId)
    }
  }

  function handleMapDragOver(event: DragEvent<HTMLDivElement>) {
    const targetId = findProvinceId(event.target)
    if (!targetId) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragTargetId((current) => current === targetId ? current : targetId)
  }

  function handleMapDrop(event: DragEvent<HTMLDivElement>) {
    const targetId = findProvinceId(event.target)
    const labelId = event.dataTransfer.getData('text/plain') as ProvinceId
    setDragTargetId(null)
    if (!targetId || !provinces.some((province) => province.id === labelId)) return
    event.preventDefault()
    placeProvince(labelId, targetId)
  }

  function handleMapDragLeave(event: DragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setDragTargetId(null)
    }
  }

  return (
    <main className="home-page session-page province-map-page">
      <div className="page-shell">
        <header className="topbar session-topbar">
          <div className="brand-block">
            <span aria-hidden="true" className="brand-mark">NL</span>
            <div>
              <p className="brand-name">{strings.title}</p>
              <p className="brand-subtitle">{isComplete ? strings.completeDescription : strings.subtitle}</p>
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

        <section aria-label={strings.title} className="province-session">
          <div className="province-toolbar">
            <div className="province-progress">
              <span className="progress-label">{strings.progress}</span>
              <span className="progress-count">{completedIds.size} / {provinces.length}</span>
              <div aria-label={strings.progress} aria-valuemax={provinces.length} aria-valuemin={0}
                aria-valuenow={completedIds.size} className="progress-track" role="progressbar">
                <span className="progress-fill" style={{ width: `${(completedIds.size / provinces.length) * 100}%` }} />
              </div>
            </div>
            <button className="reset-easy-words-button province-reset-button" onClick={resetRound} type="button">
              {strings.reset}
            </button>
          </div>

          <p className="province-instruction">{strings.instruction}</p>
          {feedback && (
            <p aria-live="polite" className={`province-feedback is-${feedback}`}>
              {feedback === 'correct' ? strings.correct : strings.incorrect}
            </p>
          )}

          {isComplete ? (
            <div className="province-complete">
              <span aria-hidden="true" className="completion-mark">✓</span>
              <h1>{strings.complete}</h1>
            </div>
          ) : (
            <div className="province-game-grid">
              <div
                className="province-map"
                dangerouslySetInnerHTML={{ __html: mapMarkup }}
                onClick={handleMapClick}
                onDragOver={handleMapDragOver}
                onDragLeave={handleMapDragLeave}
                onDrop={handleMapDrop}
                onKeyDown={handleMapKeyDown}
              />
              <div className="province-label-panel">
                <h2>{strings.labels}</h2>
                <div className="province-label-list">
                  {remainingProvinces.map((province) => (
                    <button
                      aria-pressed={activeProvinceId === province.id}
                      className={`province-label${activeProvinceId === province.id ? ' is-active' : ''}${wrongLabelId === province.id ? ' is-incorrect' : ''}`}
                      draggable
                      key={province.id}
                      onClick={() => {
                        clearIncorrectFeedback()
                        if (activeTargetId) {
                          const targetId = activeTargetId
                          setActiveTargetId(null)
                          placeProvince(province.id, targetId)
                        } else {
                          setActiveProvinceId(province.id)
                        }
                      }}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', province.id)
                        event.dataTransfer.effectAllowed = 'move'
                        clearIncorrectFeedback()
                        setActiveTargetId(null)
                        setActiveProvinceId(province.id)
                      }}
                      onDragEnd={() => setDragTargetId(null)}
                      type="button"
                    >
                      {province.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button className="exit-button province-exit-button" onClick={onExit} type="button">{strings.exit}</button>
        </section>
      </div>
    </main>
  )
}
