// ─────────────────────────────────────────────────────────────────────────────
// Letters Content
// 6 discoverable letters, each handwritten, warm, slightly imperfect.
// ─────────────────────────────────────────────────────────────────────────────

import type { LetterMemory } from '@/types/memory'

export const LETTERS: LetterMemory[] = [
  {
    id: 'letter-001',
    category: 'letter',
    title: 'The First One',
    location: {
      scene: 'platform-one',
      description: 'Tucked under the left bench near the window',
      visualHint: { x: 22, y: 72 },
    },
    animation: { type: 'unfold', duration: 800, reversible: true },
    audio: { sfx: 'paper-unfold', closeSfx: 'paper-rustle' },
    unlockCondition: { type: 'free' },
    notebookSection: 1,
    notebookOrder: 1,
    date: 'Three years ago',
    body: `I keep replaying that first afternoon — the one neither of us planned.<br><br>
A missed train, an empty platform, and suddenly forty extra minutes with nothing to do but talk.<br><br>
I don't even remember most of what we said. Nothing important, probably.<br><br>
I just remember not wanting the next train to actually show up.`,
    signature: '— R',
    crossedOutPhrases: ['So,', 'Okay, um', 'where do I even start'],
    inkVariation: 'medium',
    paperRotation: -1.2,
  },
  {
    id: 'letter-002',
    category: 'letter',
    title: 'The Train',
    location: {
      scene: 'platform-one',
      description: 'Inside a paperback on the platform bench',
      visualHint: { x: 58, y: 68 },
    },
    animation: { type: 'unfold', duration: 800, reversible: true },
    audio: { sfx: 'paper-unfold', closeSfx: 'paper-rustle' },
    unlockCondition: { type: 'free' },
    notebookSection: 1,
    notebookOrder: 2,
    date: 'Four months ago',
    body: `Running into you again felt a little too on-the-nose, honestly.<br><br>
Same platform, different season — and the conversation just picked back up, like no time had passed at all.<br><br>
I didn't say anything about it then.<br><br>
But I noticed. I noticed all of it.`,
    signature: '— R',
    inkVariation: 'light',
    paperRotation: 0.8,
  },
  {
    id: 'letter-003',
    category: 'letter',
    title: 'The Coffee',
    location: {
      scene: 'platform-cafe',
      description: 'Folded beneath a coffee cup on the far table',
      visualHint: { x: 70, y: 60 },
    },
    animation: { type: 'unfold', duration: 800, reversible: true },
    audio: { sfx: 'paper-unfold', closeSfx: 'paper-rustle' },
    unlockCondition: { type: 'free' },
    notebookSection: 1,
    notebookOrder: 3,
    date: 'Three months ago',
    body: `There's a version of that afternoon where I said the right thing at the right moment. This isn't that version.<br><br>
I talked around what I actually meant instead of just saying it, and it clearly threw you off.<br><br>
<em>Lucky for me, you stuck around long enough for me to get there eventually.</em>`,
    signature: '— R',
    inkVariation: 'medium',
    paperRotation: 1.5,
  },
  {
    id: 'letter-004',
    category: 'letter',
    title: 'The Station',
    location: {
      scene: 'waiting-room',
      description: 'Inside the leather notebook on the reading chair',
      visualHint: { x: 40, y: 55 },
    },
    animation: { type: 'unfold', duration: 800, reversible: true },
    audio: { sfx: 'paper-unfold', closeSfx: 'paper-rustle' },
    unlockCondition: { type: 'free' },
    notebookSection: 1,
    notebookOrder: 4,
    date: 'About two months ago',
    body: `I noticed it on a completely unremarkable Tuesday, of all days.<br><br>
Nothing happened. We just sat there, not saying much, and somehow that was the moment it became obvious.<br><br>
Some things don't announce themselves.<br><br>
They just quietly turn out to be true.`,
    signature: '— R',
    inkVariation: 'heavy',
    paperRotation: -0.5,
  },
  {
    id: 'letter-006',
    category: 'letter',
    title: 'The Luggage Rack',
    location: {
      scene: 'train-interior',
      description: 'Folded into the pocket of a coat left on the luggage rack',
      visualHint: { x: 20, y: 25 },
    },
    animation: { type: 'unfold', duration: 800, reversible: true },
    audio: { sfx: 'paper-unfold', closeSfx: 'paper-rustle' },
    unlockCondition: { type: 'free' },
    notebookSection: 1,
    notebookOrder: 6,
    date: 'Past weeks',
    body: `I keep rehearsing what I want to say, and none of it sounds right out loud yet.<br><br>
So consider this a placeholder — not the real thing.<br><br>
Enjoy the ride for now.<br><br>
And take a look at the window when you get a chance. I left something there for you.`,
    signature: '— R',
    inkVariation: 'light',
    paperRotation: -0.9,
  },
  {
    id: 'letter-005',
    category: 'letter',
    title: 'Tonight',
    location: {
      scene: 'final-carriage',
      description: 'The envelope on the train table marked "Open when ready"',
      visualHint: { x: 50, y: 45 },
    },
    animation: { type: 'unfold', duration: 800, reversible: true },
    audio: { sfx: 'paper-unfold', closeSfx: 'paper-rustle' },
    unlockCondition: { type: 'act-reached', actId: 'act-journey' },
    notebookSection: 1,
    notebookOrder: 5,
    date: 'Tonight',
    body: `My hands won't stop finding something to do. This is the third time I've folded this paper.<br><br>
I've rehearsed this more than I'd like to admit, and somehow I still don't know how to start.<br><br>
So here it is, plainly: I love you.<br><br>
<em>Everything after this part is still unwritten.</em>`,
    signature: '— R',
    inkVariation: 'medium',
    paperRotation: 0,
  },
]
