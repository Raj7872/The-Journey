'use client'

import { useState } from 'react'
import Image from 'next/image'

import type { PostcardMemory } from '@/types/memory'
import { COLORS } from '@/lib/constants/colors'
import { TIMING } from '@/lib/constants/timing'

interface PostcardRendererProps {
  memory: PostcardMemory
}

/** Renders a PostcardMemory — click to flip between front illustration and back text. */
export function PostcardRenderer({ memory }: PostcardRendererProps) {
  const [showBack, setShowBack] = useState(true)

  return (
    <div style={{ width: 340, maxWidth: '90vw' }}>
      <button
        onClick={() => setShowBack((v) => !v)}
        aria-label={showBack ? 'Show postcard front' : 'Show postcard back'}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          cursor: 'none',
          display: 'block',
          width: '100%',
          background: COLORS.PAPER_AGED,
          borderRadius: 3,
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          padding: showBack ? '20px 22px' : 0,
          transition: `padding ${TIMING.POSTCARD_FLIP}ms ease`,
          overflow: 'hidden',
        }}
      >
        {showBack ? (
          <>
            <div
              style={{
                fontFamily: 'var(--font-mono, "Special Elite", monospace)',
                fontSize: 10,
                letterSpacing: '2px',
                color: COLORS.INK_FADED,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              {memory.destination}
              {memory.postmarkDate ? ` — ${memory.postmarkDate}` : ''}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
                fontStyle: 'italic',
                fontSize: 16,
                lineHeight: 1.6,
                color: COLORS.INK_DARK,
              }}
            >
              {memory.backText}
            </div>
            {memory.stampRegion && (
              <div
                style={{
                  marginTop: 16,
                  marginLeft: 'auto',
                  width: 44,
                  height: 56,
                  border: `1px solid ${COLORS.BRASS_DIM}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono, "Special Elite", monospace)',
                  fontSize: 8,
                  color: COLORS.INK_FADED,
                  textAlign: 'center',
                }}
              >
                {memory.stampRegion}
              </div>
            )}
          </>
        ) : (
          <Image
            src={memory.frontImage}
            alt={`${memory.destination} illustration`}
            width={800}
            height={560}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        )}
      </button>
      <div
        style={{
          textAlign: 'center',
          marginTop: 8,
          fontFamily: 'var(--font-mono, "Special Elite", monospace)',
          fontSize: 9,
          letterSpacing: '1px',
          color: COLORS.INK_VERY_FADED,
        }}
      >
        Click to flip
      </div>
    </div>
  )
}
