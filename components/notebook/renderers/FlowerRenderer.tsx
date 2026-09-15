'use client'

import type { FlowerMemory } from '@/types/memory'
import { COLORS } from '@/lib/constants/colors'

interface FlowerRendererProps {
  memory: FlowerMemory
}

/** Renders a FlowerMemory — an illustrated pressed flower, never a photo. */
export function FlowerRenderer({ memory }: FlowerRendererProps) {
  const petalAngles = [0, 60, 120, 180, 240, 300]

  return (
    <div
      style={{
        background: COLORS.PAPER_AGED,
        padding: '24px 22px',
        maxWidth: 300,
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          margin: '0 auto 18px',
          position: 'relative',
        }}
        role="img"
        aria-label={`A pressed ${memory.species} flower`}
      >
        {petalAngles.map((angle) => (
          <div
            key={angle}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 30,
              height: 54,
              background: memory.color,
              opacity: 0.55,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              transformOrigin: '50% 100%',
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
              filter: 'saturate(0.7) brightness(0.95)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: COLORS.WILDFLOWER_YELLOW,
            opacity: 0.7,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
          fontSize: 18,
          color: COLORS.INK_DARK,
          marginBottom: 4,
        }}
      >
        {memory.species}
      </div>
      {memory.pressedDate && (
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 10,
            color: COLORS.INK_FADED,
            marginBottom: 14,
          }}
        >
          {memory.pressedDate}
        </div>
      )}
      <div
        style={{
          fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
          fontStyle: 'italic',
          fontSize: 14,
          lineHeight: 1.6,
          color: COLORS.INK_MEDIUM,
          textAlign: 'center',
        }}
      >
        {memory.memoryText}
      </div>
    </div>
  )
}
