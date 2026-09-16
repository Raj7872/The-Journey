// ─────────────────────────────────────────────────────────────────────────────
// Receipt Content
// The "order" reads like a receipt but says something else entirely.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReceiptMemory } from '@/types/memory'

export const RECEIPTS: ReceiptMemory[] = [
  {
    id: 'receipt-001',
    category: 'receipt',
    title: 'Platform Café, Table 4',
    location: {
      scene: 'platform-cafe',
      description: 'Curled under the sugar dispenser',
      visualHint: { x: 55, y: 66 },
    },
    animation: { type: 'lift', duration: 400, reversible: true },
    audio: { sfx: 'paper-rustle' },
    unlockCondition: { type: 'free' },
    notebookSection: 5,
    notebookOrder: 1,
    cafeName: 'Platform Café',
    items: [
      { name: 'A corner table', price: 'apparently reserved for us' },
      { name: 'Something too sweet', price: 'you insisted on ordering it' },
      { name: 'One extra hour we didn\'t plan for', price: 'no charge' },
    ],
    total: 'Worth it.',
    footerNote: 'Come back again. I\'ll be here.',
  },
]
