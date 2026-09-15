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
    caption: 'Hehe Please dont laugh, I tried to draw you a Sunflower.🥰 ',
  },
]
