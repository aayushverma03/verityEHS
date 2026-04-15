// Search history utilities using localStorage

const STORAGE_KEY = "verity_search_history"
const MAX_HISTORY = 5

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addToSearchHistory(query: string): void {
  if (typeof window === "undefined") return
  const trimmed = query.trim()
  if (!trimmed) return

  try {
    const history = getSearchHistory()
    const filtered = history.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())
    const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}
