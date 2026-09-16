import type { BookmarkMemory } from '@/types/memory'

export const BOOKMARKS: BookmarkMemory[] = [
  {
    id: 'bookmark-001',
    category: 'bookmark',
    title: 'Page 114',
    location: {
      scene: 'train-interior',
      description: 'Tucked into a book left open on the seat',
      visualHint: { x: 30, y: 55 },
    },
    animation: { type: 'turn', duration: 350, reversible: true },
    audio: { sfx: 'page-turn' },
    unlockCondition: { type: 'free' },
    notebookSection: 8,
    notebookOrder: 1,
    quote: 'Page 114. Still don\'t know what it says — got distracted thinking about you around page 60.',
    bookContext: 'A novel I never actually finished.',
  },
]
