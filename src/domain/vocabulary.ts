import type { LocalizedOption, VocabularyDictionary, VocabularyEntry } from '../types/vocabulary'

export function getWordTypeOptions(entries: VocabularyEntry[]): LocalizedOption[] {
  const options = new Map<string, LocalizedOption>()
  for (const entry of entries) {
    if (!options.has(entry.type_en)) options.set(entry.type_en, { id: entry.type_en, label: entry.type_ru })
  }
  return Array.from(options.values())
}

export function getSelectedEntries(
  dictionaries: VocabularyDictionary[],
  selectedDictionaryIds: Set<string>,
  selectedTypeIds: Set<string>,
): VocabularyEntry[] {
  const selected: VocabularyEntry[] = []
  const seen = new Set<string>()

  for (const dictionary of dictionaries) {
    if (!selectedDictionaryIds.has(dictionary.id)) continue

    for (const entry of dictionary.entries) {
      if (!selectedTypeIds.has(entry.type_en)) continue
      const key = `${entry.type_en}:${normalizeDutchHeadword(entry.dutch)}`
      if (seen.has(key)) continue
      seen.add(key)
      selected.push(entry)
    }
  }

  return selected
}

function normalizeDutchHeadword(dutch: string): string {
  return dutch
    .split(',')[0]
    .trim()
    .replace(/^(de|het)\s+/i, '')
    .normalize('NFKC')
    .toLocaleLowerCase('nl-NL')
    .replace(/\s+/g, ' ')
}

export function toggleSelection(current: Set<string>, id: string): Set<string> {
  const next = new Set(current)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

export function toggleAll(current: Set<string>, ids: string[]): Set<string> {
  return current.size === ids.length ? new Set() : new Set(ids)
}
