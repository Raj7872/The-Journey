// ─────────────────────────────────────────────────────────────────────────────
// Announcement Pools
// Context-aware. Never repeat within a session without full rotation.
// They never mention love directly — until the very end.
// ─────────────────────────────────────────────────────────────────────────────

import type { Announcement } from '@/engine/AnnouncementManager/AnnouncementManager'

export const ANNOUNCEMENT_POOLS: Record<string, Announcement[]> = {
  arrival: [
    {
      id: 'arr-01',
      pool: 'arrival',
      text: 'Attention passengers... the station is now open for this evening\'s final journey.',
    },
    {
      id: 'arr-02',
      pool: 'arrival',
      text: 'Good evening... Platform 11:59 is now receiving its last passenger of the night.',
    },
    {
      id: 'arr-03',
      pool: 'arrival',
      text: 'Welcome... Someone is very grateful you arrived tonight.',
    },
  ],

  exploration: [
    {
      id: 'exp-01',
      pool: 'exploration',
      text: 'Some journeys begin much earlier than we realize.',
    },
    {
      id: 'exp-02',
      pool: 'exploration',
      text: 'Please take your time. The last train will wait.',
    },
    {
      id: 'exp-03',
      pool: 'exploration',
      text: 'Attention... the best journeys are the ones we didn\'t plan.',
    },
    {
      id: 'exp-04',
      pool: 'exploration',
      text: 'A reminder... not all things worth finding are on the schedule.',
    },
  ],

  memories: [
    {
      id: 'mem-01',
      pool: 'memories',
      text: 'Please note... some things are not lost. They are simply waiting to be found.',
    },
    {
      id: 'mem-02',
      pool: 'memories',
      text: 'The station thanks you for your patience... and your curiosity.',
    },
    {
      id: 'mem-03',
      pool: 'memories',
      text: 'Final reminder for this evening... the best views are not always through the window.',
    },
  ],

  boarding: [
    {
      id: 'brd-01',
      pool: 'boarding',
      text: 'Platform 11:59 is now preparing for its final departure.',
    },
    {
      id: 'brd-02',
      pool: 'boarding',
      text: 'Final passenger... please proceed when ready.',
    },
    {
      id: 'brd-03',
      pool: 'boarding',
      text: 'The last train of the evening is arriving shortly.',
    },
  ],

  none: [],
}
