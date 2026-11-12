export type Locale = 'ru' | 'en'

export interface VocabularyEntry {
  type_en: string
  type_ru: string
  dutch: string
  russian: string
  english: string
}

export interface VocabularyDictionary {
  id: string
  title: string
  entries: VocabularyEntry[]
}

export interface LocalizedOption {
  id: string
  label: string
}
