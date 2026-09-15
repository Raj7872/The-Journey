// ─────────────────────────────────────────────────────────────────────────────
// Pressed Flower Content
// Rendered illustratively (SVG petals), never a real photograph.
// ─────────────────────────────────────────────────────────────────────────────

import type { FlowerMemory } from '@/types/memory'

export const FLOWERS: FlowerMemory[] = [
  {
    id: 'flower-001',
    category: 'flower',
    title: 'From the Platform Garden',
    location: {
      scene: 'waiting-room',
      description: 'Pressed flat between two pages of a paperback',
      visualHint: { x: 48, y: 62 },
    },
    animation: { type: 'bloom', duration: 1200, reversible: false },
    audio: { sfx: 'flower-rustle' },
    unlockCondition: { type: 'free' },
    notebookSection: 6,
    notebookOrder: 1,
    species: 'Sunflower',
    color: '#f0c020',
    memoryText: 'It only knows how to face the light. That\'s all you\'ve ever done for me too.',
    pressedDate: 'A Tuesday, no particular reason',
  },
]
