'use client'

import { type ReactNode } from 'react'

import { useAmbientFloat } from '@/hooks/useAmbientFloat'

interface AmbientContainerProps {
  children: ReactNode
  amplitude?: number
  period?: number
  style?: React.CSSProperties
}

/**
 * AmbientContainer
 *
 * Wraps any element with the subtle breathing float animation.
 * Used for the camera world container and any element that should
 * feel slightly alive even when the player isn't interacting.
 */
export function AmbientContainer({
  children,
  amplitude = 3,
  period = 8000,
  style,
}: AmbientContainerProps) {
  const floatY = useAmbientFloat({ amplitude, period })

  return (
    <div
      style={{
        transform: `translateY(${floatY}px)`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
