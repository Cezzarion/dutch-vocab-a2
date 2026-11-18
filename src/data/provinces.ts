export const provinces = [
  { id: 'groningen', name: 'Groningen' },
  { id: 'friesland', name: 'Friesland' },
  { id: 'drenthe', name: 'Drenthe' },
  { id: 'overijssel', name: 'Overijssel' },
  { id: 'flevoland', name: 'Flevoland' },
  { id: 'gelderland', name: 'Gelderland' },
  { id: 'utrecht', name: 'Utrecht' },
  { id: 'noord-holland', name: 'Noord-Holland' },
  { id: 'zuid-holland', name: 'Zuid-Holland' },
  { id: 'zeeland', name: 'Zeeland' },
  { id: 'noord-brabant', name: 'Noord-Brabant' },
  { id: 'limburg', name: 'Limburg' },
] as const

export type ProvinceId = typeof provinces[number]['id']
