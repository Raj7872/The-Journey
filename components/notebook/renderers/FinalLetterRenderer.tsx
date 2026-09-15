'use client'

import type { FinalLetterMemory } from '@/types/memory'
import { HandwrittenText } from '@/components/common/HandwrittenText'
import { COLORS } from '@/lib/constants/colors'
import { TIMING } from '@/lib/constants/timing'

interface FinalLetterRendererProps {
  memory: FinalLetterMemory
  /** Whether every other memory has been collected yet */
  isLocked: boolean
}

/** Renders the FinalLetterMemory — locked until every other memory is collected. */
export function FinalLetterRenderer({ memory, isLocked }: FinalLetterRendererProps) {
  if (isLocked) {
    return (
      <div
        style={{
          background: COLORS.PAPER_DIM,
          padding: '40px 26px',
          maxWidth: 440,
          textAlign: 'center',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
            fontSize: 18,
            color: COLORS.INK_FADED,
            fontStyle: 'italic',
            marginBottom: 10,
          }}
        >
          This page is still waiting.
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 10,
            letterSpacing: '1px',
            color: COLORS.INK_VERY_FADED,
            textTransform: 'uppercase',
          }}
        >
          Collect every other memory to unlock it
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: COLORS.PAPER_CREAM,
        padding: '32px 28px',
        maxWidth: 440,
        boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
          fontSize: 18,
          lineHeight: 1.8,
          color: COLORS.INK_DARK,
        }}
      >
        <HandwrittenText text={memory.body} msPerChar={TIMING.FINAL_LETTER_WRITE / Math.max(memory.body.length, 1)} />
      </div>
    </div>
  )
}
