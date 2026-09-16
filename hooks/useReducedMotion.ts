'use client'

import { useEffect, useState } from 'react'
import { animationManager } from '@/engine/AnimationManager/AnimationManager'

/**
 * Returns true if the user prefers reduced motion.
 * Safe for SSR — returns false during server render.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches || animationManager.getState().reducedMotion)
    update()
    const unsubscribe = animationManager.subscribe(update)

    const handler = () => update()
    query.addEventListener('change', handler)
    return () => { query.removeEventListener('change', handler); unsubscribe() }
  }, [])

  return reducedMotion
}
