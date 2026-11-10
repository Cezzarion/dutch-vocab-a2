import { useMemo, useState } from 'react'
import FilterPanel from '../../components/FilterPanel'
import GlobalControls, { type Direction } from '../../components/GlobalControls'
import ModeActions from '../../components/ModeActions'
import { getSelectedEntries, getWordTypeOptions, shuffleEntries, toggleAll, toggleSelection } from '../../domain/vocabulary'
import { vocabularyEntries, vocabularies } from '../../data/vocabularies'
import type { Locale } from '../../types/vocabulary'
import { startPageCopy } from './copy'
import FlashcardsSession from '../flashcards/FlashcardsSession'

export default function StartPage() {
  const [locale, setLocale] = useState<Locale>('ru')
  const [direction, setDirection] = useState<Direction>('dutch-to-translation')
  const [selectedDictionaryIds, setSelectedDictionaryIds] = useState(
    () => new Set(vocabularies.map(({ id }) => id)),
  )
  const [selectedTypeIds, setSelectedTypeIds] = useState(
    () => new Set(vocabularyEntries.map(({ type_en }) => type_en)),
  )
  const [flashcardEntries, setFlashcardEntries] = useState<typeof vocabularyEntries | null>(null)

  const copy = startPageCopy[locale]
  const typeOptions = useMemo(() => getWordTypeOptions(vocabularyEntries), []).map(({ id, label }) => ({
    id,
    label: locale === 'en' ? id : label,
  }))
  const dictionaryOptions = vocabularies.map(({ id, title }) => ({ id, label: title[locale] }))
  const dictionaryIds = dictionaryOptions.map(({ id }) => id)
  const typeIds = typeOptions.map(({ id }) => id)
  const selectedEntries = useMemo(
    () => getSelectedEntries(vocabularies, selectedDictionaryIds, selectedTypeIds),
    [selectedDictionaryIds, selectedTypeIds],
  )

  if (flashcardEntries) {
    return (
      <FlashcardsSession
        direction={direction}
        entries={flashcardEntries}
        locale={locale}
        onDirectionToggle={() => setDirection((current) =>
          current === 'dutch-to-translation' ? 'translation-to-dutch' : 'dutch-to-translation')}
        onExit={() => {
          setFlashcardEntries(null)
          setLocale('ru')
          setDirection('dutch-to-translation')
          setSelectedDictionaryIds(new Set(vocabularies.map(({ id }) => id)))
          setSelectedTypeIds(new Set(vocabularyEntries.map(({ type_en }) => type_en)))
        }}
        onLocaleChange={setLocale}
      />
    )
  }

  return (
    <main className="home-page">
      <div className="page-shell">
        <header className="topbar">
          <div className="brand-block">
            <span className="brand-mark" aria-hidden="true">NL</span>
            <div>
              <p className="brand-name">{copy.appName}</p>
              <p className="brand-subtitle">{copy.subtitle}</p>
            </div>
          </div>
          <GlobalControls
            direction={direction}
            directionLabel={copy.direction}
            languageLabel={copy.language}
            locale={locale}
            onDirectionToggle={() => setDirection((current) =>
              current === 'dutch-to-translation' ? 'translation-to-dutch' : 'dutch-to-translation')}
            onLocaleChange={setLocale}
          />
        </header>

        <section aria-label={copy.subtitle} className="start-layout">
          <FilterPanel
            allSelected={typeOptions.length > 0 && selectedTypeIds.size === typeOptions.length}
            items={typeOptions}
            onSelectAll={() => setSelectedTypeIds((current) => toggleAll(current, typeIds))}
            onToggle={(id) => setSelectedTypeIds((current) => toggleSelection(current, id))}
            selected={selectedTypeIds}
            title={copy.partsOfSpeech}
            selectAllLabel={selectedTypeIds.size === typeOptions.length ? copy.clearSelection : copy.selectAll}
          />
          <FilterPanel
            allSelected={dictionaryOptions.length > 0 && selectedDictionaryIds.size === dictionaryOptions.length}
            items={dictionaryOptions}
            onSelectAll={() => setSelectedDictionaryIds((current) => toggleAll(current, dictionaryIds))}
            onToggle={(id) => setSelectedDictionaryIds((current) => toggleSelection(current, id))}
            selected={selectedDictionaryIds}
            title={copy.dictionaries}
            selectAllLabel={selectedDictionaryIds.size === dictionaryOptions.length ? copy.clearSelection : copy.selectAll}
          />
          <ModeActions
            emptySelectionLabel={copy.emptySelection}
            flashcardsLabel={copy.flashcards}
            testLabel={copy.test}
            wordCount={selectedEntries.length}
            wordsInSetLabel={copy.wordsInSet}
            onStartFlashcards={() => setFlashcardEntries(shuffleEntries(selectedEntries))}
          />
        </section>
      </div>
    </main>
  )
}
