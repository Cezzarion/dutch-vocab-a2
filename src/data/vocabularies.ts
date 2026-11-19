import type { VocabularyDictionary, VocabularyEntry } from '../types/vocabulary'

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
  for (const optional of ['example', 'example_ru', 'example_en'] as const) {
    if (value[optional] !== undefined && typeof value[optional] !== 'string') {
      throw new Error(`Invalid vocabulary entry in ${file}: ${optional} must be a string when provided`)
    }
  }

  return {
    type_en: value.type_en as string,
    type_ru: value.type_ru as string,
    dutch: value.dutch as string,
    russian: value.russian as string,
    english: value.english as string,
    ...(isNonEmptyString(value.example) ? { example: value.example } : {}),
    ...(isNonEmptyString(value.example_ru) ? { example_ru: value.example_ru } : {}),
    ...(isNonEmptyString(value.example_en) ? { example_en: value.example_en } : {}),
  }
}

function parseDictionary(file: string, value: unknown): VocabularyDictionary {
  if (!isObject(value) || value.schemaVersion !== 2 || !isNonEmptyString(value.title) || !Array.isArray(value.entries)) {
    throw new Error(`Invalid vocabulary dictionary ${file}: expected schemaVersion 2, string title, and entries`)
  }

  return {
    id: file,
    title: value.title,
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
