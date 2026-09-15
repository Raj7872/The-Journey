// ─────────────────────────────────────────────────────────────────────────────
// Hidden Letter Unlock Map
// Each of the 20 real, scattered collectibles quietly grants 5 hidden
// letters the moment it's found — fixed at authoring time, not re-rolled
// per playthrough, so every one of the 100 is guaranteed collected by the
// time all 20 real objects are. Which five arrive with which object is the
// only thing that's meant to feel random.
// ─────────────────────────────────────────────────────────────────────────────

import { HIDDEN_LETTERS } from './hiddenLetters'

const TRIGGER_ORDER = [
  'letter-001', 'letter-002', 'letter-003', 'letter-004', 'letter-005', 'letter-006',
  'postcard-001', 'postcard-002', 'postcard-003', 'postcard-004',
  'ticket-001', 'ticket-002', 'ticket-003',
  'polaroid-001', 'polaroid-002',
  'receipt-001',
  'flower-001',
  'doodle-001',
  'bookmark-001',
  'cassette-001',
] as const

const LETTERS_PER_TRIGGER = 5

/** Real collectible id → the hidden-letter ids it silently unlocks on collection. */
export const HIDDEN_LETTER_UNLOCK_MAP: Record<string, string[]> = Object.fromEntries(
  TRIGGER_ORDER.map((triggerId, i) => [
    triggerId,
    HIDDEN_LETTERS.slice(i * LETTERS_PER_TRIGGER, (i + 1) * LETTERS_PER_TRIGGER).map((m) => m.id),
  ])
)
