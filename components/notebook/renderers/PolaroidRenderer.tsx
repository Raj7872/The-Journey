'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import type { PolaroidMemory } from '@/types/memory'
import { COLORS } from '@/lib/constants/colors'
import { useAnimationManager } from '@/engine/AnimationManager/AnimationContext'

interface PolaroidRendererProps {
  memory: PolaroidMemory
}

/** Renders a PolaroidMemory — image develops from dark on mount. */
export function PolaroidRenderer({ memory }: PolaroidRendererProps) {
  const { animationState } = useAnimationManager()
  const [developed, setDeveloped] = useState(animationState.reducedMotion)

  useEffect(() => {
    if (animationState.reducedMotion) {
      setDeveloped(true)
      return
    }
    const t = setTimeout(() => setDeveloped(true), 200)
    return () => clearTimeout(t)
  }, [animationState.reducedMotion])

  const duration = animationState.reducedMotion ? 0 : memory.developDuration

  return (
    <div
      style={{
        background: COLORS.PAPER_CREAM,
        padding: '16px 16px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        transform: `rotate(${memory.rotation ?? 0}deg)`,
        // A real width, not just a cap — the image (absolutely positioned
        // via next/image `fill`) contributes zero intrinsic size to this
        // card, so without a concrete width it shrinks to fit nothing at
        // all in any flex/grid ancestor that doesn't otherwise force a
        // size on it — exactly what happened inside the notebook's own
        // page layout.
        width: 260,
        maxWidth: '90vw',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '5 / 6',
          background: '#0e0c0a',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Image
          src={memory.image}
          alt={memory.caption}
          fill
          style={{
            objectFit: 'cover',
            filter: developed ? 'brightness(1) saturate(1)' : 'brightness(0.05) saturate(0)',
            opacity: developed ? 1 : 0.4,
            transition: `filter ${duration}ms ease, opacity ${duration}ms ease`,
          }}
        />
        {memory.hasDamage && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 24,
              height: 24,
              background: COLORS.PAPER_CREAM,
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
              opacity: 0.7,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Normal flow, not absolutely positioned over the photo — a caption
          that wraps to two or three lines just grows the card downward
          instead of climbing up over the image. */}
      <div
        style={{
          marginTop: 12,
          textAlign: 'center',
          fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
          fontStyle: 'italic',
          fontSize: 13,
          color: COLORS.INK_MEDIUM,
          opacity: developed ? 1 : 0,
          transition: 'opacity 0.8s ease 0.3s',
        }}
      >
        {memory.caption}
      </div>
    </div>
  )
}
