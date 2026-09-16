// ─────────────────────────────────────────────────────────────────────────────
// Polaroid Content
// Images develop from dark on collection — see PolaroidRenderer.
// ─────────────────────────────────────────────────────────────────────────────

import type { PolaroidMemory } from '@/types/memory'
import { ASSET_KEYS } from '@/content/assets/assetManifest'

export const POLAROIDS: PolaroidMemory[] = [
  {
    id: 'polaroid-001',
    category: 'polaroid',
    title: 'The Window Seat',
    location: {
      scene: 'platform-cafe',
      description: 'Tucked behind the napkin holder on the counter',
      visualHint: { x: 40, y: 58 },
    },
    animation: { type: 'develop', duration: 4000, reversible: false },
    audio: { sfx: 'polaroid-develop' },
    unlockCondition: { type: 'free' },
    notebookSection: 4,
    notebookOrder: 1,
    image: "/images/memories/polaroids/polaroid-001.jpg",
    caption: 'A slow morning, the kind we don\'t get enough of.',
    developDuration: 4000,
    rotation: -2.5,
    hasDamage: false,
  },
  {
    id: 'polaroid-002',
    category: 'polaroid',
    title: 'Rainy Platform',
    location: {
      scene: 'platform-one',
      description: 'Wedged into the frame of the departure sign',
      visualHint: { x: 62, y: 40 },
    },
    animation: { type: 'develop', duration: 4000, reversible: false },
    audio: { sfx: 'polaroid-develop' },
    unlockCondition: { type: 'free' },
    notebookSection: 4,
    notebookOrder: 2,
    image: "/images/memories/polaroids/polaroid-002.jpg",
    caption: 'Forgot an umbrella. Somehow still call it a good day.',
    developDuration: 4000,
    rotation: 1.8,
    hasDamage: true,
  },
]
