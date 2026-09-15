'use client'

import { useEffect, useRef, useState } from 'react'

import { useReducedMotion } from './useReducedMotion'

interface AmbientFloatOptions {
  amplitude?: number   // px — default 3
  period?: number      // ms — default 8000
  enabled?: boolean
}

/**
 * Returns a Y offset (in px) that gently oscillates.
 * Used for the camera float and other ambient movement.
 * Respects prefers-reduced-motion.
 */
export function useAmbientFloat({
  amplitude = 3,
  period = 8000,
  enabled = true,
}: AmbientFloatOptions = {}): number {
  const [offset, setOffset] = useState(0)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!enabled || reducedMotion) {
      setOffset(0)
      return
    }

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = (timestamp - startRef.current) / period
      const y = Math.sin(elapsed * Math.PI * 2) * amplitude
      setOffset(y)
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [amplitude, period, enabled, reducedMotion])

  return offset
}
