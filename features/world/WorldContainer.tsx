'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { Z_INDEX } from '@/lib/constants/zIndex'

interface WorldContainerProps {
  children: ReactNode
}

/**
 * WorldContainer
 *
 * The root of the HTML world. Both the camera transform and the world filter
 * (brightness/saturation) come from CSS variables written directly to :root
 * by CameraManager/LightingManager — no JS state reads here, which avoids
 * both hydration mismatches and 60fps React re-renders of the whole tree.
 */
export function WorldContainer({ children }: WorldContainerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div
      suppressHydrationWarning
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z_INDEX.WORLD,
        // Only apply transforms after mount — eliminates hydration mismatch
        transform: isMounted ? 'var(--camera-transform, none)' : 'none',
        willChange: 'transform',
        filter: isMounted ? 'var(--world-filter, none)' : 'none',
        transition: 'filter 3s ease',
        transformOrigin: 'center center',
      }}
    >
      {children}
    </div>
  )
}
