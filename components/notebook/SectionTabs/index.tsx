'use client'

import { NOTEBOOK_SECTIONS } from '@/content/notebook/sections'
import type { CollectionState } from '@/types/memory'
import { COLORS } from '@/lib/constants/colors'

interface SectionTabsProps {
  currentSection: number
  collectionState: CollectionState
  onSelect: (section: number) => void
  /** Horizontal row on narrow viewports instead of a vertical spine */
  layout: 'vertical' | 'horizontal'
}

/** The notebook's category tabs — one per section, showing collected/total. */
export function SectionTabs({ currentSection, collectionState, onSelect, layout }: SectionTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Notebook sections"
      style={{
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap: layout === 'vertical' ? 6 : 4,
        overflowX: layout === 'horizontal' ? 'auto' : 'visible',
        padding: layout === 'horizontal' ? '0 4px' : 0,
      }}
    >
      {NOTEBOOK_SECTIONS.map((section) => {
        const isActive = section.sectionNumber === currentSection
        const count =
          section.category === 'final-letter'
            ? collectionState.isComplete
              ? 1
              : 0
            : collectionState.byCategory[section.category]

        return (
          <button
            key={section.sectionNumber}
            role="tab"
            aria-selected={isActive}
            aria-label={`${section.title} — ${count} of ${section.totalMemories} collected`}
            onClick={() => onSelect(section.sectionNumber)}
            style={{
              all: 'unset',
              cursor: 'none',
              flexShrink: 0,
              padding: layout === 'vertical' ? '8px 14px 8px 10px' : '6px 12px',
              borderLeft: layout === 'vertical' ? `3px solid ${isActive ? section.ribbonColor : 'transparent'}` : 'none',
              borderBottom: layout === 'horizontal' ? `2px solid ${isActive ? section.ribbonColor : 'transparent'}` : 'none',
              background: isActive ? 'rgba(212,132,58,0.08)' : 'transparent',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minWidth: layout === 'horizontal' ? 72 : undefined,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono, "Special Elite", monospace)',
                fontSize: 11,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? COLORS.AMBER_GLOW : 'rgba(242,232,213,0.65)',
                whiteSpace: 'nowrap',
              }}
            >
              {section.title}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono, "Special Elite", monospace)',
                fontSize: 9,
                color: isActive ? 'rgba(242,232,213,0.7)' : 'rgba(242,232,213,0.35)',
              }}
            >
              {count}/{section.totalMemories}
            </span>
          </button>
        )
      })}
    </div>
  )
}
