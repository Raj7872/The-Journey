// ─────────────────────────────────────────────────────────────────────────────
// Notebook Types
// The notebook is the only persistent UI in the experience.
// It fills itself. The player never manages it. It is always available.
// ─────────────────────────────────────────────────────────────────────────────

import type { MemoryCategory } from './memory'

export interface NotebookPageConfig {
  /** Which section this page belongs to (1–10) */
  sectionNumber: number
  /** Position within section */
  pageOrder: number
  /** Whether a bookmark appears on this page */
  hasBookmark: boolean
  /** Bookmark color if present */
  bookmarkColor?: string
}

export interface NotebookSectionConfig {
  sectionNumber: number
  category: MemoryCategory
  title: string
  description: string
  /** Color of section divider ribbon */
  ribbonColor: string
  /** Total memories in this section */
  totalMemories: number
}

export interface NotebookState {
  /** Whether the notebook has been found and unlocked */
  isUnlocked: boolean
  /** Whether the notebook is currently open */
  isOpen: boolean
  /** Whether the notebook is animating open/close */
  isAnimating: boolean
  /** Current section being viewed (1–10) */
  currentSection: number
  /** Current page within section */
  currentPage: number
  /** Whether the final letter section is unlocked */
  isFinalLetterUnlocked: boolean
  /** Total pages across all sections */
  totalPagesUnlocked: number
  /** Is the notebook currently glowing (after new memory collected) */
  isGlowing: boolean
}

export interface NotebookPageTurn {
  direction: 'forward' | 'backward'
  fromPage: number
  toPage: number
  duration: number
}
