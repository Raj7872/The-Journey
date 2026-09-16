// ─────────────────────────────────────────────────────────────────────────────
// Memory Registry
// All memories aggregated in one place.
// Engine imports from here — never from individual category files.
// Add new memories by adding to the appropriate category file.
// ─────────────────────────────────────────────────────────────────────────────

import type { FinalLetterMemory, Memory } from '@/types/memory'

import { LETTERS } from './letters/letters'
import { POSTCARDS } from './postcards/postcards'
import { TICKETS } from './tickets/tickets'
import { POLAROIDS } from './polaroids/polaroids'
import { RECEIPTS } from './receipts/receipts'
import { FLOWERS } from './flowers/flowers'
import { CASSETTES } from './cassettes/cassettes'
import { DOODLES } from './doodles/doodles'
import { BOOKMARKS } from './bookmarks/bookmarks'
import { HIDDEN_LETTERS } from './hidden/hiddenLetters'

const FINAL_LETTER: FinalLetterMemory = {
  id: 'final-letter-001',
  category: 'final-letter',
  title: 'The Last Page',
  location: {
    scene: 'the-silence',
    description: 'The locked page in the notebook — always visible, always waiting',
  },
  animation: { type: 'write', duration: 8000, reversible: false },
  audio: { sfx: 'paper-unfold', ambient: 'field-ambient' },
  unlockCondition: { type: 'all-other-collected' },
  notebookSection: 10,
  notebookOrder: 1,
  body: `It was never really about counting to a hundred.<br><br>
It was a hundred ordinary mornings, a hundred small moments I never bothered to number.<br><br>
Turns out...<br><br>
<em>they were all you.</em>`,
}

/** All memories in discovery order */
export const ALL_MEMORIES: Memory[] = [
  ...LETTERS,
  ...POSTCARDS,
  ...TICKETS,
  ...POLAROIDS,
  ...RECEIPTS,
  ...FLOWERS,
  ...DOODLES,
  ...BOOKMARKS,
  ...CASSETTES,
  FINAL_LETTER,
  ...HIDDEN_LETTERS,
]

export { LETTERS, POSTCARDS, TICKETS, POLAROIDS, RECEIPTS, FLOWERS, CASSETTES, FINAL_LETTER, HIDDEN_LETTERS }
