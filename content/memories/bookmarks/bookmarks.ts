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
    quote: 'I\'ve read this same paragraph four times now. I keep thinking about you instead.',
    bookContext: 'Always Thinking of You.',
  },
]
