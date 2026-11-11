const STORAGE_KEY = 'dutch-vocab-a2:easy-words:v1'

export function loadEasyWordKeys(): Set<string> {
  if (typeof window === 'undefined') return new Set()

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return new Set()

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed) || !parsed.every((value) => typeof value === 'string')) return new Set()
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

export function saveEasyWordKeys(keys: Set<string>): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]))
  } catch {
    // Keep the session usable when browser storage is unavailable or full.
  }
}
