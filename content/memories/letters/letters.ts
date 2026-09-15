// ─────────────────────────────────────────────────────────────────────────────
// Letters Content
// 6 discoverable letters, each handwritten, personal, slightly imperfect.
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
I've been sitting here for about twenty minutes just writing your name and crossing it out because nothing sounds right when I put it next to words.<br><br>
You laughed at something I said that Day. It's not really like a Love Letter, I'm just remembering our first ever interaction in this lifetime.<br><br>
I didn't know then that we will have a strong connection in future.`,
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
    body: `I found you, Again.<br><br>
and this time, Maybe it was just a coincident, But I still had the memory of us talking about random things that would have barely mattered in those 3 years.<br><br>
As well your handle name engraved in my memory.<br><br>
I often remember those memories.`,
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
    body: `I started to notice you and suddenly Butterflies became a real thing in my stomach."<br><br>
I didn't say what I was thinking or feeling, directly to you and it kind of threw you off. That really wasn't how I wanted it to be<br><br>
<em>but, Gladly we talked things out and fixed it. I'm very glad we were wanting to try something together.</em>`,
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
    date: 'About Two Months ago',
    body: `I was already in love with you, completely.<br><br>
I really do not have any explanation for that ,How it happened, when exactly it happened.<br><br>
I just knew, that my life is all about you now, YOu became most important part of my life.<br><br>
And I will never let go of you, Ever.`,
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
    body: `I have been making this views to ask you something.<br><br>
but anyways question isn't here yet.<br><br>
I Hope you enjoy the Train ride, It'll be a couple of minute long, until you reach the destination.<br><br>
Hehe and I hope you notice our name Initials engraved on the window.<br><br>
I couldn't make it any better to show you the cute view.`,
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
    body: `I feel a bit nervous, well.<br><br>
I have never said it out loud or directly to you at all, But I'm saying it now.<br><br>
Mahal na Mahal Kita Baby.<br><br>
and there is going to be far bigger thing for you ahead.<br><br>
<em>I don't know the future yet...</em>`,
    signature: '— R',
    inkVariation: 'medium',
    paperRotation: 0,
  },
]
