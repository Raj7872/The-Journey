'use client'

import { useState } from 'react'

import type { HiddenLetterMemory, LetterMemory } from '@/types/memory'
import { HandwrittenText } from '@/components/common/HandwrittenText'
import { COLORS } from '@/lib/constants/colors'

interface LetterRendererProps {
  memory: LetterMemory | HiddenLetterMemory
}

const INK_OPACITY: Record<LetterMemory['inkVariation'], number> = {
  light: 0.55,
  medium: 0.75,
  heavy: 0.92,
}

/** Renders a LetterMemory — handwritten body via the ink writing system. */
export function LetterRenderer({ memory }: LetterRendererProps) {
  const [written, setWritten] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        background: COLORS.PAPER_CREAM,
        padding: '28px 26px',
        borderRadius: 2,
        boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
        transform: `rotate(${memory.paperRotation ?? 0}deg)`,
        maxWidth: 440,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono, "Special Elite", monospace)',
          fontSize: 11,
          letterSpacing: '1px',
          color: COLORS.INK_FADED,
          marginBottom: 14,
        }}
      >
        {memory.date}
      </div>

      {memory.crossedOutPhrases && memory.crossedOutPhrases.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {memory.crossedOutPhrases.map((phrase) => (
            <span
              key={phrase}
              style={{
                fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
                fontStyle: 'italic',
                fontSize: 14,
                color: COLORS.INK_VERY_FADED,
                textDecoration: 'line-through',
                marginRight: 10,
              }}
            >
              {phrase}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
          fontSize: 17,
          lineHeight: 1.7,
          opacity: INK_OPACITY[memory.inkVariation],
          minHeight: 120,
        }}
      >
        <HandwrittenText text={memory.body} onComplete={() => setWritten(true)} />
      </div>

      <div
        style={{
          marginTop: 20,
          fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
          fontSize: 20,
          color: COLORS.INK_DARK,
          textAlign: 'right',
          opacity: written ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        {memory.signature}
      </div>
    </div>
  )
}
