import { describe, expect, it } from 'vitest'
import { excludeKnownEntries, getSelectedEntries, getVocabularyEntryKey, toggleAll, toggleSelection } from './vocabulary'
import type { VocabularyDictionary, VocabularyEntry } from '../types/vocabulary'

const verb: VocabularyEntry = {
  type_en: 'verb',
  type_ru: 'глагол',
  dutch: 'lopen, gelopen',
  russian: 'идти',
  english: 'walk',
}

const noun: VocabularyEntry = {
  type_en: 'noun',
  type_ru: 'существительное',
  dutch: 'de tafel, tafels',
  russian: 'стол',
  english: 'table',
}

const duplicateNoun: VocabularyEntry = {
  ...noun,
  dutch: 'de TAFEL, tafelen',
  english: 'table (duplicate)',
}

const dictionaries: VocabularyDictionary[] = [
  { id: 'first.json', title: { en: 'First', ru: 'Первый' }, entries: [verb, noun] },
  { id: 'second.json', title: { en: 'Second', ru: 'Второй' }, entries: [duplicateNoun] },
]

describe('getSelectedEntries', () => {
  it('filters by dictionary and word type, then keeps the first duplicate', () => {
    const selected = getSelectedEntries(
      dictionaries,
      new Set(['first.json', 'second.json']),
      new Set(['noun']),
    )

    expect(selected).toEqual([noun])
  })

  it('uses the same key for duplicate headwords regardless of article capitalization', () => {
    expect(getVocabularyEntryKey(noun)).toBe(getVocabularyEntryKey(duplicateNoun))
  })
})

describe('excludeKnownEntries', () => {
  it('removes known headwords from a future candidate set', () => {
    expect(excludeKnownEntries([verb, noun], new Set([getVocabularyEntryKey(noun)]))).toEqual([verb])
  })
})

describe('selection toggles', () => {
  it('toggles one option without mutating the previous selection', () => {
    const current = new Set(['verb'])
    const next = toggleSelection(current, 'noun')

    expect([...current]).toEqual(['verb'])
    expect([...next]).toEqual(['verb', 'noun'])
  })

  it('selects all available options, then clears them', () => {
    const all = toggleAll(new Set(['verb']), ['verb', 'noun'])

    expect([...all]).toEqual(['verb', 'noun'])
    expect([...toggleAll(all, ['verb', 'noun'])]).toEqual([])
  })
})
