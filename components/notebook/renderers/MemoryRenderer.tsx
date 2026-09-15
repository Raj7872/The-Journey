'use client'

import type { Memory } from '@/types/memory'
import { LetterRenderer } from './LetterRenderer'
import { TicketRenderer } from './TicketRenderer'
import { PolaroidRenderer } from './PolaroidRenderer'
import { PostcardRenderer } from './PostcardRenderer'
import { ReceiptRenderer } from './ReceiptRenderer'
import { FlowerRenderer } from './FlowerRenderer'
import { DoodleRenderer } from './DoodleRenderer'
import { BookmarkRenderer } from './BookmarkRenderer'
import { CassetteRenderer } from './CassetteRenderer'
import { FinalLetterRenderer } from './FinalLetterRenderer'

interface MemoryRendererProps {
  memory: Memory
  /** Only meaningful for the final-letter category */
  isFinalLetterLocked?: boolean
}

/**
 * MemoryRenderer
 *
 * Dispatches to the correct collectible renderer based on `memory.category`.
 * This is the only place in the app that needs to know the full category
 * list — everywhere else just renders a Memory through here.
 */
export function MemoryRenderer({ memory, isFinalLetterLocked = false }: MemoryRendererProps) {
  switch (memory.category) {
    case 'letter':
      return <LetterRenderer memory={memory} />
    case 'ticket':
      return <TicketRenderer memory={memory} />
    case 'polaroid':
      return <PolaroidRenderer memory={memory} />
    case 'postcard':
      return <PostcardRenderer memory={memory} />
    case 'receipt':
      return <ReceiptRenderer memory={memory} />
    case 'flower':
      return <FlowerRenderer memory={memory} />
    case 'doodle':
      return <DoodleRenderer memory={memory} />
    case 'bookmark':
      return <BookmarkRenderer memory={memory} />
    case 'cassette':
      return <CassetteRenderer memory={memory} />
    case 'final-letter':
      return <FinalLetterRenderer memory={memory} isLocked={isFinalLetterLocked} />
    case 'hidden-letter':
      return <LetterRenderer memory={memory} />
  }
}
