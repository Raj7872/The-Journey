'use client'

import type { CassetteMemory } from '@/types/memory'
import { COLORS } from '@/lib/constants/colors'

interface CassetteRendererProps {
  memory: CassetteMemory
}

/**
 * Renders a CassetteMemory — tape shell and label art.
 * Playback wiring is out of scope for this milestone; this only displays
 * the object faithfully so AudioManager integration can be added later.
 */
export function CassetteRenderer({ memory }: CassetteRendererProps) {
  return (
    <div
      style={{
        background: COLORS.WOOD_DARK,
        borderRadius: 6,
        padding: 16,
        maxWidth: 260,
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
      }}
    >
      <div
        style={{
          background: '#1a1712',
          borderRadius: 4,
          padding: '14px 16px 20px',
          position: 'relative',
        }}
      >
        <div
          style={{
            background: COLORS.PAPER_AGED,
            borderRadius: 2,
            padding: '10px 12px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
              fontStyle: 'italic',
              fontSize: 14,
              color: COLORS.INK_DARK,
              textAlign: 'center',
            }}
          >
            {memory.tapeLabel}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: `2px solid ${COLORS.BRASS_DIM}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.BRASS_DIM }} />
              </div>
            ))}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, "Special Elite", monospace)',
              fontSize: 11,
              color: COLORS.BRASS,
              letterSpacing: '1px',
            }}
          >
            SIDE {memory.side} · {memory.displayDuration}
          </div>
        </div>
      </div>
    </div>
  )
}
