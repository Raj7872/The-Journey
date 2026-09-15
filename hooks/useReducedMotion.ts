'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true if the user prefers reduced motion.
 * Safe for SSR — returns false during server render.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(query.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}
