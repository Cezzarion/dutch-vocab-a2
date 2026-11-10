import type { Locale } from '../../types/vocabulary'

export const startPageCopy = {
  ru: {
    appName: 'Dutch Vocab A2',
    subtitle: 'Выберите слова для занятия',
    language: 'Язык интерфейса',
    direction: 'Направление слов',
    partsOfSpeech: 'Части речи',
    dictionaries: 'Словари',
    selectAll: 'Выбрать все',
    clearSelection: 'Снять выбор',
    test: 'Тест',
    flashcards: 'Флипкарты',
    wordsInSet: 'Слов в наборе',
    emptySelection: 'Нет слов по выбранным фильтрам',
  },
  en: {
    appName: 'Dutch Vocab A2',
    subtitle: 'Choose vocabulary for your session',
    language: 'Interface language',
    direction: 'Word direction',
    partsOfSpeech: 'Parts of speech',
    dictionaries: 'Dictionaries',
    selectAll: 'Select all',
    clearSelection: 'Clear selection',
    test: 'Test',
    flashcards: 'Flashcards',
    wordsInSet: 'Words in set',
    emptySelection: 'No words match these filters',
  },
} satisfies Record<Locale, Record<string, string>>
