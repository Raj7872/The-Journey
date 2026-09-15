'use client'

import Image from 'next/image'

import type { DoodleMemory } from '@/types/memory'
import { COLORS } from '@/lib/constants/colors'

interface DoodleRendererProps {
  memory: DoodleMemory
}

/** Renders a DoodleMemory — a margin sketch, either an SVG path or an image. */
export function DoodleRenderer({ memory }: DoodleRendererProps) {
  return (
    <div
      style={{
        background: COLORS.PAPER_CREAM,
        padding: '20px',
        maxWidth: 260,
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        transform: 'rotate(-1deg)',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          background: 'rgba(45,31,14,0.03)',
          border: `1px dashed ${COLORS.BRASS_DIM}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {memory.image ? (
          <Image src={memory.image} alt={memory.caption ?? memory.title} fill style={{ objectFit: 'contain' }} />
        ) : memory.svgPath ? (
          <svg viewBox="0 0 100 75" style={{ width: '80%', height: '80%' }} aria-label={memory.caption ?? memory.title}>
            <path d={memory.svgPath} fill="none" stroke={COLORS.INK_MEDIUM} strokeWidth={1.5} strokeLinecap="round" />
          </svg>
        ) : (
          <span style={{ fontFamily: 'var(--font-mono, "Special Elite", monospace)', fontSize: 10, color: COLORS.INK_VERY_FADED }}>
            (sketch)
          </span>
        )}
      </div>
      {memory.caption && (
        <div
          style={{
            marginTop: 10,
            fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
            fontStyle: 'italic',
            fontSize: 13,
            color: COLORS.INK_MEDIUM,
            textAlign: 'center',
          }}
        >
          {memory.caption}
        </div>
      )}
    </div>
  )
}
