// ─────────────────────────────────────────────────────────────────────────────
// Notebook Section Config
// One entry per MemoryCategory (1:1 with MEMORY_CATEGORY_TO_SECTION).
// Drives the section tabs and page headers — never hardcoded in components.
// ─────────────────────────────────────────────────────────────────────────────

import type { NotebookSectionConfig } from '@/types/notebook'
import { COLORS } from '@/lib/constants/colors'
import { LETTERS } from '@/content/memories/letters/letters'
import { POSTCARDS } from '@/content/memories/postcards/postcards'
import { TICKETS } from '@/content/memories/tickets/tickets'
import { POLAROIDS } from '@/content/memories/polaroids/polaroids'
import { RECEIPTS } from '@/content/memories/receipts/receipts'
import { FLOWERS } from '@/content/memories/flowers/flowers'
import { DOODLES } from '@/content/memories/doodles/doodles'
import { BOOKMARKS } from '@/content/memories/bookmarks/bookmarks'
import { CASSETTES } from '@/content/memories/cassettes/cassettes'
import { HIDDEN_LETTERS } from '@/content/memories/hidden/hiddenLetters'

// Totals are read from the content arrays themselves — never hand-counted —
// so adding or removing a memory anywhere never leaves a tab's count stale.
export const NOTEBOOK_SECTIONS: NotebookSectionConfig[] = [
  {
    sectionNumber: 1,
    category: 'letter',
    title: 'Letters',
    description: 'Words that were never sent — until now.',
    ribbonColor: COLORS.AMBER_GLOW,
    totalMemories: LETTERS.length,
  },
  {
    sectionNumber: 2,
    category: 'postcard',
    title: 'Postcards',
    description: 'Places that felt like home because you were there.',
    ribbonColor: COLORS.WILDFLOWER_PURPLE,
    totalMemories: POSTCARDS.length,
  },
  {
    sectionNumber: 3,
    category: 'ticket',
    title: 'Tickets',
    description: 'Every journey that led here.',
    ribbonColor: COLORS.BRASS,
    totalMemories: TICKETS.length,
  },
  {
    sectionNumber: 4,
    category: 'polaroid',
    title: 'Polaroids',
    description: 'Moments that developed slowly, the way the best ones do.',
    ribbonColor: COLORS.SUNRISE_GOLD,
    totalMemories: POLAROIDS.length,
  },
  {
    sectionNumber: 5,
    category: 'receipt',
    title: 'Receipts',
    description: 'Ordinary paper, keeping track of something extraordinary.',
    ribbonColor: COLORS.AMBER_DIM,
    totalMemories: RECEIPTS.length,
  },
  {
    sectionNumber: 6,
    category: 'flower',
    title: 'Pressed Flowers',
    description: 'Small, stubborn, kept.',
    ribbonColor: COLORS.WILDFLOWER_PURPLE,
    totalMemories: FLOWERS.length,
  },
  {
    sectionNumber: 7,
    category: 'doodle',
    title: 'Sketches',
    description: 'Margin thoughts, drawn without thinking too hard.',
    ribbonColor: COLORS.FIELD_GREEN,
    totalMemories: DOODLES.length,
  },
  {
    sectionNumber: 8,
    category: 'bookmark',
    title: 'Bookmarks',
    description: 'Original thoughts, never borrowed from anyone else.',
    ribbonColor: COLORS.BRASS,
    totalMemories: BOOKMARKS.length,
  },
  {
    sectionNumber: 9,
    category: 'cassette',
    title: 'Cassettes',
    description: 'Voices worth keeping, side A and B.',
    ribbonColor: COLORS.WOOD_MEDIUM,
    totalMemories: CASSETTES.length,
  },
  {
    sectionNumber: 10,
    category: 'final-letter',
    title: 'The Last Page',
    description: 'Waiting for everything else to be found first.',
    ribbonColor: COLORS.AMBER_GLOW,
    totalMemories: 1,
  },
  {
    sectionNumber: 11,
    category: 'hidden-letter',
    title: 'Hidden',
    description: 'Never scattered, never a hint — these arrive quietly, five at a time, with everything else you find.',
    ribbonColor: COLORS.AMBER_TRACE,
    totalMemories: HIDDEN_LETTERS.length,
  },
]
