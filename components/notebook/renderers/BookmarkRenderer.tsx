'use client'

import type { BookmarkMemory } from '@/types/memory'
import { COLORS } from '@/lib/constants/colors'

interface BookmarkRendererProps {
  memory: BookmarkMemory
}

/** Renders a BookmarkMemory — a strip of card with a hand-noted original thought. */
export function BookmarkRenderer({ memory }: BookmarkRendererProps) {
  return (
    <div
      style={{
        background: COLORS.PAPER_AGED,
        borderLeft: `4px solid ${COLORS.BRASS}`,
        padding: '22px 20px',
        maxWidth: 320,
        minHeight: 260,
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
          fontSize: 20,
          fontStyle: 'italic',
          lineHeight: 1.5,
          color: COLORS.INK_DARK,
          marginBottom: 16,
        }}
      >
        &ldquo;{memory.quote}&rdquo;
      </div>
      {memory.bookContext && (
        <div
          style={{
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 10,
            letterSpacing: '1px',
            color: COLORS.INK_FADED,
            textTransform: 'uppercase',
          }}
        >
          — found in {memory.bookContext}
        </div>
      )}
    </div>
  )
}
