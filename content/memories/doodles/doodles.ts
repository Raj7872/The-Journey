import type { DoodleMemory } from '@/types/memory'

export const DOODLES: DoodleMemory[] = [
  {
    id: 'doodle-001',
    category: 'doodle',
    title: 'Somewhere Around Hour Three',
    location: {
      scene: 'train-interior',
      description: 'A napkin, sketched on and left on the fold-down table',
      visualHint: { x: 48, y: 58 },
    },
    animation: { type: 'lift', duration: 400, reversible: true },
    audio: { sfx: 'paper-rustle' },
    unlockCondition: { type: 'free' },
    notebookSection: 7,
    notebookOrder: 1,
    caption: 'Don\'t laugh — I tried to draw you a sunflower. 🥰',
    svgPath:
      'M50 30 Q46 18 50 10 Q54 18 50 30 M50 30 Q58 20 68 16 Q62 26 50 30 M50 30 Q62 28 70 32 Q62 34 50 30 M50 30 Q58 40 64 48 Q52 40 50 30 M50 30 Q42 40 36 48 Q48 40 50 30 M50 30 Q38 28 30 32 Q38 34 50 30 M50 30 Q42 20 32 16 Q38 26 50 30 M56 30 A6 6 0 1 1 44 30 A6 6 0 1 1 56 30 M50 36 Q48 55 50 74 M49 55 Q38 58 32 50 Q42 52 49 55 M51 62 Q62 64 68 58 Q58 60 51 62',
  },
]
