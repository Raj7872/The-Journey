// ─────────────────────────────────────────────────────────────────────────────
// Storage Utilities
// Type-safe wrappers around localStorage.
// Always handles SSR safely (no window access during server render).
// ─────────────────────────────────────────────────────────────────────────────

function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Safely read a JSON value from localStorage.
 * Returns null if not found, not on client, or parse fails.
 */
export function readStorage<T>(key: string): T | null {
  if (!isClient()) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    console.warn(`[Storage] Failed to read key "${key}"`)
    return null
  }
}

/**
 * Safely write a JSON value to localStorage.
 * Returns false if write fails (e.g. storage quota exceeded).
 */
export function writeStorage<T>(key: string, value: T): boolean {
  if (!isClient()) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    console.warn(`[Storage] Failed to write key "${key}"`)
    return false
  }
}

/**
 * Remove a key from localStorage.
 */
export function removeStorage(key: string): void {
  if (!isClient()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    console.warn(`[Storage] Failed to remove key "${key}"`)
  }
}

/**
 * Check if a key exists in localStorage.
 */
export function hasStorage(key: string): boolean {
  if (!isClient()) return false
  return window.localStorage.getItem(key) !== null
}
