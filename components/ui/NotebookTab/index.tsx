'use client'

import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { Z_INDEX } from '@/lib/constants/zIndex'
import { COLORS } from '@/lib/constants/colors'

/**
 * NotebookTab
 *
 * A small persistent tab that appears once the notebook has been found.
 * The notebook is always available after that — this is its entry point.
 * Glows briefly whenever a new memory is collected.
 */
export function NotebookTab() {
  const { notebookState, openNotebook } = useNotebook()

  if (!notebookState.isUnlocked || notebookState.isOpen) return null

  return (
    <button
      onClick={openNotebook}
      aria-label={`Open notebook — ${notebookState.totalPagesUnlocked} memories collected`}
      style={{
        all: 'unset',
        cursor: 'none',
        position: 'fixed',
        right: 0,
        bottom: '18%',
        zIndex: Z_INDEX.OVERLAY,
        background: COLORS.WOOD_DARK,
        borderTop: `1px solid ${COLORS.BRASS_DIM}`,
        borderBottom: `1px solid ${COLORS.BRASS_DIM}`,
        borderLeft: `1px solid ${COLORS.BRASS_DIM}`,
        borderRadius: '6px 0 0 6px',
        padding: '14px 10px',
        boxShadow: notebookState.isGlowing
          ? `0 0 24px 6px rgba(212,132,58,0.4)`
          : '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.4s ease',
        writingMode: 'vertical-rl',
        fontFamily: 'var(--font-mono, "Special Elite", monospace)',
        fontSize: 10,
        letterSpacing: '2px',
        color: COLORS.AMBER_GLOW,
        textTransform: 'uppercase',
      }}
    >
      Notebook
    </button>
  )
}
