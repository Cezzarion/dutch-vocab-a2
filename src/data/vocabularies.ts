import type { Locale, VocabularyDictionary, VocabularyEntry } from '../types/vocabulary'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function parseEntry(value: unknown, file: string): VocabularyEntry {
  const fields = ['type_en', 'type_ru', 'dutch', 'russian', 'english'] as const
  if (!isObject(value) || !fields.every((field) => isNonEmptyString(value[field]))) {
    throw new Error(`Invalid vocabulary entry in ${file}: expected non-empty string fields ${fields.join(', ')}`)
  }

  return {
    type_en: value.type_en as string,
    type_ru: value.type_ru as string,
    dutch: value.dutch as string,
    russian: value.russian as string,
    english: value.english as string,
  }
}

function parseDictionary(file: string, value: unknown): VocabularyDictionary {
  if (!isObject(value) || value.schemaVersion !== 1 || !isObject(value.title) || !Array.isArray(value.entries)) {
    throw new Error(`Invalid vocabulary dictionary ${file}: expected schemaVersion 1, localized title, and entries`)
  }

  const title = value.title
  const locales: Locale[] = ['en', 'ru']
  if (!locales.every((locale) => isNonEmptyString(title[locale]))) {
    throw new Error(`Invalid vocabulary dictionary ${file}: title must include non-empty en and ru strings`)
  }

  return {
    id: file,
    title: { en: title.en as string, ru: title.ru as string },
    entries: value.entries.map((entry) => parseEntry(entry, file)),
  }
}

// Load and validate the small static vocabulary collection once at startup.
const dictionaryModules = import.meta.glob<unknown>('./vocabs/*.json', {
  eager: true,
  import: 'default',
})

export const vocabularies = Object.entries(dictionaryModules).map(([file, value]) =>
  parseDictionary(file, value),
)

export const vocabularyEntries = vocabularies.flatMap(({ entries }) => entries)
