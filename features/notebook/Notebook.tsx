'use client'

import { useEffect, useState } from 'react'

import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useAnimationManager } from '@/engine/AnimationManager/AnimationContext'
import { NOTEBOOK_SECTIONS } from '@/content/notebook/sections'
import { FINAL_LETTER } from '@/content/memories'
import { getSrc, ASSET_KEYS } from '@/content/assets/assetManifest'
import { MEDIA_QUERIES } from '@/lib/constants/breakpoints'
import { TIMING } from '@/lib/constants/timing'
import { Z_INDEX } from '@/lib/constants/zIndex'
import { COLORS } from '@/lib/constants/colors'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { SectionTabs } from '@/components/notebook/SectionTabs'
import { PageTurn } from '@/components/notebook/PageTurn'
import { PageBookmark } from '@/components/notebook/PageBookmark'
import { MemoryRenderer } from '@/components/notebook/renderers/MemoryRenderer'

type Phase = 'closed' | 'opening' | 'open' | 'closing'

/**
 * Notebook
 *
 * The full leather-notebook overlay. Mounted only while there's something
 * to show (open or mid-close-animation) — see the `phase` derivation below.
 * Layout switches from a two-column desktop spread (tabs + page) to a
 * stacked mobile layout at the TABLET breakpoint.
 */
export function Notebook() {
  const { notebookState, collectionState, closeNotebook, goToSection, nextPage, prevPage, getCollectedByCategory } =
    useNotebook()
  const { animationState } = useAnimationManager()
  const isMobile = useMediaQuery(MEDIA_QUERIES.TABLET)
  const [phase, setPhase] = useState<Phase>('closed')

  useEffect(() => {
    if (notebookState.isOpen && notebookState.isAnimating) {
      setPhase((prev) => (prev === 'open' || prev === 'closing' ? 'closing' : 'opening'))
    } else if (notebookState.isOpen) {
      setPhase('open')
    } else {
      setPhase('closed')
    }
  }, [notebookState.isOpen, notebookState.isAnimating])

  if (phase === 'closed') return null

  const section = NOTEBOOK_SECTIONS.find((s) => s.sectionNumber === notebookState.currentSection) ?? NOTEBOOK_SECTIONS[0]
  if (!section) return null

  const isFinalSection = section.category === 'final-letter'
  const collected = isFinalSection ? [] : getCollectedByCategory(section.category)
  const pageIndex = Math.min(notebookState.currentPage, Math.max(collected.length - 1, 0))
  const currentMemory = collected[pageIndex]

  const visible = phase === 'open' || phase === 'opening'
  const duration = animationState.reducedMotion
    ? 0
    : phase === 'closing'
      ? TIMING.NOTEBOOK_CLOSE
      : TIMING.NOTEBOOK_OPEN

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z_INDEX.NOTEBOOK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease`,
        pointerEvents: visible ? 'all' : 'none',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Notebook"
    >
      {/* Backdrop */}
      <div
        onClick={closeNotebook}
        style={{ position: 'absolute', inset: 0, background: 'rgba(2,2,4,0.75)', cursor: 'none' }}
        aria-hidden="true"
      />

      {/* Book frame */}
      <div
        style={{
          position: 'relative',
          width: 'min(920px, 94vw)',
          height: 'min(640px, 88vh)',
          background: `${COLORS.WOOD_DARK} url(${getSrc(ASSET_KEYS.TEX_LEATHER_DARK)})`,
          backgroundSize: 'cover',
          borderRadius: 10,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          padding: 14,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(12px)',
          transition: `transform ${duration}ms ease`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 10px 10px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
              fontSize: 18,
              color: COLORS.PAPER_CREAM,
              opacity: 0.9,
            }}
          >
            Notebook
          </span>
          <button
            onClick={closeNotebook}
            aria-label="Close notebook"
            style={{
              all: 'unset',
              cursor: 'none',
              fontFamily: 'var(--font-mono, "Special Elite", monospace)',
              fontSize: 11,
              letterSpacing: '2px',
              color: 'rgba(242,232,213,0.75)',
              padding: '10px 18px',
              border: '1px solid rgba(242,232,213,0.3)',
              borderRadius: 3,
              background: 'rgba(242,232,213,0.06)',
            }}
          >
            CLOSE ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 10,
            minHeight: 0,
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 6,
              padding: isMobile ? '6px 0' : '10px 0',
              overflowY: isMobile ? 'visible' : 'auto',
            }}
          >
            <SectionTabs
              currentSection={notebookState.currentSection}
              collectionState={collectionState}
              onSelect={goToSection}
              layout={isMobile ? 'horizontal' : 'vertical'}
            />
          </div>

          {/* Page area */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              background: COLORS.PAPER_DIM,
              borderRadius: 6,
              padding: '28px 24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 0,
            }}
          >
            <PageBookmark color={section.ribbonColor} label={section.title} />

            <div
              style={{
                fontFamily: 'var(--font-mono, "Special Elite", monospace)',
                fontSize: 10,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: COLORS.INK_FADED,
                marginBottom: 16,
                alignSelf: 'flex-start',
              }}
            >
              {section.title} — {section.description}
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <PageTurn pageKey={`${section.sectionNumber}-${pageIndex}`}>
                {isFinalSection ? (
                  <MemoryRenderer memory={FINAL_LETTER} isFinalLetterLocked={!collectionState.isComplete} />
                ) : currentMemory ? (
                  <MemoryRenderer memory={currentMemory} />
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
                      fontStyle: 'italic',
                      fontSize: 15,
                      color: COLORS.INK_VERY_FADED,
                      maxWidth: 300,
                    }}
                  >
                    Nothing here yet. This page is waiting to be filled.
                  </div>
                )}
              </PageTurn>
            </div>

            {!isFinalSection && collected.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                <button
                  onClick={prevPage}
                  disabled={pageIndex <= 0}
                  aria-label="Previous page"
                  style={{
                    all: 'unset',
                    cursor: pageIndex <= 0 ? 'default' : 'none',
                    opacity: pageIndex <= 0 ? 0.3 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(45,31,14,0.1)',
                    border: `1px solid ${COLORS.BRASS_DIM}`,
                    fontFamily: 'var(--font-mono, "Special Elite", monospace)',
                    fontSize: 18,
                    color: COLORS.INK_DARK,
                  }}
                >
                  ←
                </button>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, "Special Elite", monospace)',
                    fontSize: 11,
                    color: COLORS.INK_FADED,
                  }}
                >
                  {pageIndex + 1} / {collected.length}
                </span>
                <button
                  onClick={nextPage}
                  disabled={pageIndex >= collected.length - 1}
                  aria-label="Next page"
                  style={{
                    all: 'unset',
                    cursor: pageIndex >= collected.length - 1 ? 'default' : 'none',
                    opacity: pageIndex >= collected.length - 1 ? 0.3 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(45,31,14,0.1)',
                    border: `1px solid ${COLORS.BRASS_DIM}`,
                    fontFamily: 'var(--font-mono, "Special Elite", monospace)',
                    fontSize: 18,
                    color: COLORS.INK_DARK,
                  }}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
