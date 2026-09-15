'use client'

import type { ReceiptMemory } from '@/types/memory'
import { COLORS } from '@/lib/constants/colors'

interface ReceiptRendererProps {
  memory: ReceiptMemory
}

/** Renders a ReceiptMemory as a thin roll-paper till receipt. */
export function ReceiptRenderer({ memory }: ReceiptRendererProps) {
  return (
    <div
      style={{
        background: COLORS.PAPER_CREAM,
        padding: '20px 18px',
        maxWidth: 240,
        fontFamily: 'var(--font-mono, "Special Elite", monospace)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        clipPath:
          'polygon(0 0, 100% 0, 100% 96%, 92% 100%, 84% 96%, 76% 100%, 68% 96%, 60% 100%, 52% 96%, 44% 100%, 36% 96%, 28% 100%, 20% 96%, 12% 100%, 4% 96%, 0 100%)',
      }}
    >
      <div style={{ textAlign: 'center', fontSize: 13, letterSpacing: '1px', color: COLORS.INK_DARK, marginBottom: 4 }}>
        {memory.cafeName}
      </div>
      <div style={{ textAlign: 'center', fontSize: 9, color: COLORS.INK_FADED, marginBottom: 12 }}>
        — — — — — — — — — —
      </div>

      {memory.items.map((item) => (
        <div key={item.name} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: COLORS.INK_MEDIUM, textTransform: 'uppercase' }}>{item.name}</div>
          <div style={{ fontSize: 12, fontStyle: 'italic', color: COLORS.INK_DARK, fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)' }}>
            {item.price}
          </div>
        </div>
      ))}

      <div style={{ fontSize: 9, color: COLORS.INK_FADED, margin: '10px 0' }}>— — — — — — — — — —</div>

      <div style={{ fontSize: 11, letterSpacing: '1px', color: COLORS.INK_DARK, textAlign: 'right', textTransform: 'uppercase' }}>
        {memory.total}
      </div>

      {memory.footerNote && (
        <div
          style={{
            marginTop: 14,
            fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
            fontStyle: 'italic',
            fontSize: 12,
            color: COLORS.INK_MEDIUM,
            textAlign: 'center',
          }}
        >
          {memory.footerNote}
        </div>
      )}
    </div>
  )
}
