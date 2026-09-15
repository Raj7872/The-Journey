'use client'

import type { TicketMemory } from '@/types/memory'
import { COLORS } from '@/lib/constants/colors'

interface TicketRendererProps {
  memory: TicketMemory
}

/** Renders a TicketMemory as a vintage train-ticket stub. */
export function TicketRenderer({ memory }: TicketRendererProps) {
  return (
    <div
      style={{
        position: 'relative',
        background: COLORS.PAPER_AGED,
        border: `1px dashed ${COLORS.BRASS_DIM}`,
        borderRadius: 4,
        padding: '18px 20px',
        maxWidth: 380,
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${COLORS.BRASS_DIM}`,
          paddingBottom: 10,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 10,
            letterSpacing: '2px',
            color: COLORS.INK_MEDIUM,
            textTransform: 'uppercase',
          }}
        >
          {memory.ticketClass} CLASS
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 10,
            color: COLORS.INK_FADED,
          }}
        >
          {memory.ticketNumber}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono, "Special Elite", monospace)', fontSize: 9, color: COLORS.INK_FADED, letterSpacing: '1px' }}>FROM</div>
          <div style={{ fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)', fontSize: 18, color: COLORS.INK_DARK }}>{memory.from}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono, "Special Elite", monospace)', fontSize: 14, color: COLORS.BRASS }}>→</div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono, "Special Elite", monospace)', fontSize: 9, color: COLORS.INK_FADED, letterSpacing: '1px' }}>TO</div>
          <div style={{ fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)', fontSize: 18, color: COLORS.INK_DARK }}>{memory.to}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4px 12px', fontSize: 11, fontFamily: 'var(--font-mono, "Special Elite", monospace)', color: COLORS.INK_FADED, marginBottom: 12 }}>
        <span>{memory.date}</span>
        <span>PASSENGER: {memory.passenger}</span>
        {memory.platform && <span>PLAT. {memory.platform}</span>}
      </div>

      <div
        style={{
          borderTop: `1px dashed ${COLORS.BRASS_DIM}`,
          paddingTop: 10,
          fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
          fontStyle: 'italic',
          fontSize: 13,
          color: COLORS.INK_MEDIUM,
        }}
      >
        {memory.noteOnBack}
      </div>
    </div>
  )
}
