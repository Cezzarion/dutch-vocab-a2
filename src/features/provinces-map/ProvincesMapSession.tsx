import { useMemo, type DragEvent, type KeyboardEvent, type MouseEvent } from 'react'
import GlobalControls, { type Direction } from '../../components/GlobalControls'
import { provinces, type ProvinceId } from '../../data/provinces'
import type { Locale } from '../../types/vocabulary'
import { useMatchingRound } from '../matching/useMatchingRound'
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

const provinceIds = provinces.map(({ id }) => id)

export default function ProvincesMapSession({
  locale,
  direction,
  onLocaleChange,
  onDirectionToggle,
  onExit,
}: ProvincesMapSessionProps) {
  const strings = copy[locale]
  const round = useMatchingRound(provinceIds)
  const remainingProvinces = round.remaining.map((id) => provinces.find((province) => province.id === id)!)

  const mapMarkup = useMemo(() => provinces.reduce((markup, province) => {
    const targetState = round.targetState(province.id)
    const stateClass = targetState === 'selected' ? ' is-target-selected'
      : targetState ? ` is-${targetState}` : ''
    const targetMarkup = `class="province-region" data-province="${province.id}"`
    const accessibleTargetMarkup = `class="province-region${stateClass}" data-province="${province.id}"`
    const withClass = markup.replace(targetMarkup, accessibleTargetMarkup)
    return withClass.replace(
      `data-name="${province.name}"`,
      `data-name="${province.name}" tabindex="${round.completed.has(province.id) ? -1 : 0}" role="button" aria-pressed="${round.activeTarget === province.id}" aria-disabled="${round.completed.has(province.id)}" aria-label="${strings.selectProvince}: ${province.name}"`,
    )
  }, provinceMapSvg), [round.activeTarget, round.completed, round.dragTarget, round.wrongTarget, strings.selectProvince])

  function handleMapClick(event: MouseEvent<HTMLDivElement>) {
    const targetId = findProvinceId(event.target)
    if (!targetId) return
    round.selectTarget(targetId)
  }

  function handleMapKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const targetId = findProvinceId(event.target)
    if (!targetId) return
    event.preventDefault()
    round.selectTarget(targetId)
  }

  function handleMapDragOver(event: DragEvent<HTMLDivElement>) {
    const targetId = findProvinceId(event.target)
    if (!targetId || round.completed.has(targetId)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    round.dragOver(targetId)
  }

  function handleMapDrop(event: DragEvent<HTMLDivElement>) {
    const targetId = findProvinceId(event.target)
    const labelId = event.dataTransfer.getData('text/plain') as ProvinceId
    if (!targetId || !provinceIds.includes(labelId)) return
    event.preventDefault()
    round.drop(labelId, targetId)
  }

  function handleMapDragLeave(event: DragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      round.setDragTarget(null)
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
              <p className="brand-subtitle">{round.isComplete ? strings.completeDescription : strings.subtitle}</p>
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
              <span className="progress-count">{round.completed.size} / {provinces.length}</span>
              <div aria-label={strings.progress} aria-valuemax={provinces.length} aria-valuemin={0}
                aria-valuenow={round.completed.size} className="progress-track" role="progressbar">
                <span className="progress-fill" style={{ width: `${(round.completed.size / provinces.length) * 100}%` }} />
              </div>
            </div>
            <button className="reset-easy-words-button province-reset-button" onClick={round.reset} type="button">
              {strings.reset}
            </button>
          </div>

          <p className="province-instruction">{strings.instruction}</p>
          {round.feedback && (
            <p aria-live="polite" className={`province-feedback is-${round.feedback}`}>
              {round.feedback === 'correct' ? strings.correct : strings.incorrect}
            </p>
          )}

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
              {round.isComplete ? (
                <div className="matching-complete">
                  <span aria-hidden="true" className="completion-mark">✓</span>
                  <p>{strings.complete}</p>
                </div>
              ) : (
                <div className="province-label-list">
                  {remainingProvinces.map((province) => {
                    const itemState = round.itemState(province.id)
                    const itemClass = itemState === 'selected' ? 'active' : itemState
                    return (
                    <button
                      aria-pressed={round.activeItem === province.id}
                      className={`province-label${itemClass ? ` is-${itemClass}` : ''}`}
                      draggable
                      key={province.id}
                      onClick={() => {
                        round.selectItem(province.id)
                      }}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', province.id)
                        event.dataTransfer.effectAllowed = 'move'
                        round.beginDrag(province.id)
                      }}
                      onDragEnd={() => round.setDragTarget(null)}
                      type="button"
                    >
                      {province.name}
                    </button>
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
