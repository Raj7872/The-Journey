// ─────────────────────────────────────────────────────────────────────────────
// Array Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pick a random item from an array.
 * Returns undefined for empty arrays.
 */
export function randomFrom<T>(arr: readonly T[]): T | undefined {
  if (arr.length === 0) return undefined
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

/**
 * Pick a random item, excluding already-seen items.
 * Falls back to full pool when all items have been seen.
 */
export function randomExcluding<T>(
  arr: readonly T[],
  exclude: readonly T[]
): T | undefined {
  const available = arr.filter((item) => !exclude.includes(item))
  if (available.length === 0) return randomFrom(arr)
  return randomFrom(available)
}

/**
 * Shuffle an array (Fisher-Yates). Returns a new array.
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    const iItem = result[j]
    if (temp !== undefined && iItem !== undefined) {
      result[i] = iItem
      result[j] = temp
    }
  }
  return result
}

/**
 * Group an array of items by a key function.
 */
export function groupBy<T, K extends string>(
  arr: readonly T[],
  keyFn: (item: T) => K
): Partial<Record<K, T[]>> {
  return arr.reduce<Partial<Record<K, T[]>>>((acc, item) => {
    const key = keyFn(item)
    const group = acc[key] ?? []
    group.push(item)
    acc[key] = group
    return acc
  }, {})
}
