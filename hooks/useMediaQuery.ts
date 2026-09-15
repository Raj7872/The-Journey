'use client'

import { useEffect, useState } from 'react'

/**
 * Returns whether a CSS media query currently matches.
 * Safe for SSR — returns false during server render, same pattern as useReducedMotion.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
