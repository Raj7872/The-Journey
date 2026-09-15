// ─────────────────────────────────────────────────────────────────────────────
// Memory Types
// Every collectible in the experience inherits from BaseMemory.
// The discriminated union on `category` drives renderer selection.
// ─────────────────────────────────────────────────────────────────────────────

import type { SceneId } from './scene'

export type MemoryCategory =
  | 'letter'
  | 'postcard'
  | 'ticket'
  | 'polaroid'
  | 'receipt'
  | 'flower'
  | 'doodle'
  | 'bookmark'
  | 'cassette'
  | 'final-letter'
  | 'hidden-letter'

/** Notebook sections map 1:1 to MemoryCategory */
export const MEMORY_CATEGORY_TO_SECTION: Record<MemoryCategory, number> = {
  letter: 1,
  postcard: 2,
  ticket: 3,
  polaroid: 4,
  receipt: 5,
  flower: 6,
  doodle: 7,
  bookmark: 8,
  cassette: 9,
  'final-letter': 10,
  'hidden-letter': 11,
}

export type AnimationType =
  | 'unfold'       // Letters — paper opens from fold
  | 'develop'      // Polaroids — chemical development
  | 'slide'        // Tickets — slides out of envelope
  | 'bloom'        // Flowers — petals open
  | 'turn'         // Books/bookmarks — page turns
  | 'click'        // Cassettes — inserts into player
  | 'write'        // Final letter — ink appears in real time
  | 'flip'         // Postcards — card flips to reveal back
  | 'lift'         // Generic — object gently lifts

export interface AnimationConfig {
  type: AnimationType
  /** Total duration in ms */
  duration: number
  /** Delay before animation starts in ms */
  delay?: number
  /** Whether the animation is reversible on close */
  reversible: boolean
}

export type UnlockCondition =
  | { type: 'free' }
  | { type: 'after-memory'; memoryId: string }
  | { type: 'after-category-count'; category: MemoryCategory; count: number }
  | { type: 'all-other-collected' }  // Final letter only
  | { type: 'act-reached'; actId: string }

export interface StationLocation {
  scene: SceneId
  /** Human-readable description for devs/designers */
  description: string
  /** Approximate visual position for placement (0–100 percentage of scene) */
  visualHint?: { x: number; y: number }
}

export interface MemoryAudioConfig {
  /** Sound effect played on open */
  sfx: string
  /** Optional looping ambient while memory is open */
  ambient?: string
  /** Sound effect played on close */
  closeSfx?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Base Memory
// ─────────────────────────────────────────────────────────────────────────────

export interface BaseMemory {
  id: string
  category: MemoryCategory
  title: string
  subtitle?: string
  location: StationLocation
  animation: AnimationConfig
  audio: MemoryAudioConfig
  unlockCondition: UnlockCondition
  /** Section number in notebook (1–10) */
  notebookSection: number
  /** Order within section */
  notebookOrder: number
  /** Runtime state — not stored in data files */
  isUnlocked?: boolean
  isCollected?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Specific Memory Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LetterMemory extends BaseMemory {
  category: 'letter'
  /** Displayed date — handwritten style */
  date: string
  /** Letter body — supports <em> and <br> */
  body: string
  signature: string
  /** Words that appear crossed out */
  crossedOutPhrases?: string[]
  /** Simulated ink pressure variation */
  inkVariation: 'light' | 'medium' | 'heavy'
  /** Slight rotation of the letter in degrees */
  paperRotation?: number
}

export interface PostcardMemory extends BaseMemory {
  category: 'postcard'
  destination: string
  /** Path to front illustration */
  frontImage: string
  /** The handwritten message on the back */
  backText: string
  /** Country/region for the stamp */
  stampRegion?: string
  /** Postmark date */
  postmarkDate?: string
}

export interface TicketMemory extends BaseMemory {
  category: 'ticket'
  from: string
  to: string
  date: string
  passenger: string
  platform?: string
  /** Handwritten note on the back of the ticket */
  noteOnBack: string
  ticketNumber: string
  ticketClass: 'FIRST' | 'SECOND' | 'PLATFORM'
}

export interface PolaroidMemory extends BaseMemory {
  category: 'polaroid'
  /** Path to image (starts dark, develops) */
  image: string
  /** Caption — only visible after development completes */
  caption: string
  /** Duration of development animation in ms */
  developDuration: number
  /** Slight rotation in degrees */
  rotation?: number
  /** Whether the photo has slight corner damage */
  hasDamage?: boolean
}

export interface ReceiptMemory extends BaseMemory {
  category: 'receipt'
  cafeName: string
  items: Array<{
    /** What appears to be an order */
    name: string
    /** What the "price" actually says */
    price: string
  }>
  /** The total line */
  total: string
  /** Optional note at bottom */
  footerNote?: string
}

export interface FlowerMemory extends BaseMemory {
  category: 'flower'
  species: string
  color: string
  /** 2–3 sentences only */
  memoryText: string
  pressedDate?: string
}

export interface DoodleMemory extends BaseMemory {
  category: 'doodle'
  /** SVG path data or image reference */
  svgPath?: string
  image?: string
  caption?: string
}

export interface BookmarkMemory extends BaseMemory {
  category: 'bookmark'
  /** Original thought — never a famous quote */
  quote: string
  /** Context hint — what book it was in */
  bookContext?: string
}

export interface CassetteMemory extends BaseMemory {
  category: 'cassette'
  tapeLabel: string
  /** Path to audio file (placeholder during development) */
  audioSrc: string
  /** Display duration e.g. "1:47" */
  displayDuration: string
  side: 'A' | 'B'
}

export interface FinalLetterMemory extends BaseMemory {
  category: 'final-letter'
  body: string
  /** The final letter is always locked until all others are collected */
  unlockCondition: { type: 'all-other-collected' }
}

/**
 * A short, un-scattered letter — never placed in a scene, never clicked to
 * find. A handful unlock quietly into the notebook each time one of the 20
 * real collectibles is found, so all of them are already there by the time
 * everything else has been. Same shape as LetterMemory, just shorter and
 * hidden by design.
 */
export interface HiddenLetterMemory extends BaseMemory {
  category: 'hidden-letter'
  date: string
  body: string
  signature: string
  inkVariation: 'light' | 'medium' | 'heavy'
  paperRotation?: number
  crossedOutPhrases?: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Discriminated Union
// ─────────────────────────────────────────────────────────────────────────────

export type Memory =
  | LetterMemory
  | PostcardMemory
  | TicketMemory
  | PolaroidMemory
  | ReceiptMemory
  | FlowerMemory
  | DoodleMemory
  | BookmarkMemory
  | CassetteMemory
  | FinalLetterMemory
  | HiddenLetterMemory

// ─────────────────────────────────────────────────────────────────────────────
// Collection State
// ─────────────────────────────────────────────────────────────────────────────

export interface CollectionState {
  collectedIds: Set<string>
  totalCollected: number
  totalAvailable: number
  byCategory: Record<MemoryCategory, number>
  isComplete: boolean
}

export interface NotebookSection {
  sectionNumber: number
  category: MemoryCategory
  title: string
  description: string
  memories: Memory[]
  collectedCount: number
  totalCount: number
}
