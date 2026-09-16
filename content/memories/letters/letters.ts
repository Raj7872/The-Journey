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
    body: `I don't know how to start this.<br><br>
I've been sitting here for twenty minutes trying out openings and crossing every one of them out, because nothing sounds right next to what I actually mean.<br><br>
You laughed at something small I said that day. It's not really a love letter — I'm just remembering the first time our paths crossed.<br><br>
I didn't know then how far that one moment would end up carrying us.`,
    signature: '— R',
    crossedOutPhrases: ['Dear', 'You', 'I wanted to say'],
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
    body: `I found you again.<br><br>
Maybe it was just chance, but I still remembered the small things we used to talk about — the ones that shouldn't have mattered after all this time, and somehow did.<br><br>
Some memories just don't fade the way they're supposed to.<br><br>
I think about that a lot more than I let on.`,
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
    body: `I started noticing you, and suddenly every nervous cliché turned out to be true.<br><br>
I didn't say what I was actually thinking, and I think that threw you off a little. That wasn't how I meant for it to go.<br><br>
<em>But we talked it through, and I'm glad we did — glad we decided this was worth trying.</em>`,
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
    body: `I was already in love with you. Completely.<br><br>
I still can't explain exactly how it happened, or when — it just did, quietly, somewhere between all the ordinary days.<br><br>
I only know that my life has you in it now, in a way that changes what "important" means.<br><br>
And I'm not planning on letting go of that.`,
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
    body: `I've been putting this trip together to ask you something.<br><br>
The question isn't here yet, though — not quite.<br><br>
I hope you're enjoying the ride. It won't be long now, just a little further to go.<br><br>
And I hope, somewhere along the way, you notice what's written on the window.<br><br>
It's the best view I could think to give you.`,
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
    body: `I feel nervous, if I'm honest.<br><br>
I've never said this out loud before — not directly, not like this. But I'm saying it now.<br><br>
I love you. More than I've known how to say.<br><br>
And there's something bigger waiting for you just ahead.<br><br>
<em>I don't know exactly what the future holds...</em>`,
    signature: '— R',
    inkVariation: 'medium',
    paperRotation: 0,
  },
]
