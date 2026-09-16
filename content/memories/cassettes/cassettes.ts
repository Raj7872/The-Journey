// ─────────────────────────────────────────────────────────────────────────────
// Cassette Content
// Display-only prop — tape art and label text, no audio playback.
// ─────────────────────────────────────────────────────────────────────────────

import type { CassetteMemory } from '@/types/memory'
import { ASSET_KEYS } from '@/content/assets/assetManifest'

export const CASSETTES: CassetteMemory[] = [
  {
    id: 'cassette-001',
    category: 'cassette',
    title: 'Side A, No Label',
    location: {
      scene: 'memory-tunnel',
      description: 'Left in the pocket of an old coat on the wall hook',
      visualHint: { x: 35, y: 64 },
    },
    animation: { type: 'click', duration: 700, reversible: true },
    audio: { sfx: 'cassette-insert' },
    unlockCondition: { type: 'free' },
    notebookSection: 9,
    notebookOrder: 1,
    tapeLabel: 'A recording I go back to more than I probably should.',
    audioSrc: ASSET_KEYS.AUD_VOICE_CASSETTE_A,
    displayDuration: '1:47',
    side: 'A',
  },
]
