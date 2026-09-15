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
      { name: 'One warm coffee', price: 'for the quiet mornings' },
      { name: 'One sweeter than usual', price: 'because you have had a sip of it' },
      { name: 'One reason to stay', price: 'you' },
    ],
    total: 'Priceless.',
    footerNote: 'Thank you for coming back. Every time.',
  },
]
