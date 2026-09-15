'use client'

import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { MemoryRenderer } from '@/components/notebook/renderers/MemoryRenderer'
import { Z_INDEX } from '@/lib/constants/zIndex'
import { COLORS } from '@/lib/constants/colors'

/** The "you found something" overlay shown after collecting a memory in the world. */
export function MemoryReveal() {
  const { revealedMemory, dismiss } = useMemoryReveal()

  if (!revealedMemory) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z_INDEX.OVERLAY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="A memory was found"
    >
      <div
        onClick={dismiss}
        style={{ position: 'absolute', inset: 0, background: 'rgba(2,2,4,0.8)', cursor: 'none' }}
        aria-hidden="true"
      />

      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto' }}>
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: COLORS.AMBER_GLOW,
            marginBottom: 14,
            opacity: 0.85,
          }}
        >
          A memory, kept
        </div>

        <MemoryRenderer memory={revealedMemory} />

        <button
          onClick={dismiss}
          aria-label="Close"
          style={{
            all: 'unset',
            cursor: 'none',
            display: 'block',
            margin: '18px auto 0',
            padding: '12px 28px',
            border: '1px solid rgba(242,232,213,0.3)',
            borderRadius: 3,
            background: 'rgba(242,232,213,0.06)',
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 11,
            letterSpacing: '2px',
            textAlign: 'center',
            color: 'rgba(242,232,213,0.75)',
          }}
        >
          CLOSE ✕
        </button>
      </div>
    </div>
  )
}
