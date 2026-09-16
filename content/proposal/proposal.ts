// ─────────────────────────────────────────────────────────────────────────────
// Proposal Content
// The emotional payoff. Edit RECIPIENT_NAME in .env.local.
// All text here is final — no UI changes needed to customize the proposal.
// ─────────────────────────────────────────────────────────────────────────────

export const PROPOSAL_CONFIG = {
  // ── The Final Letter ────────────────────────────────────────────────────
  finalLetterLines: [
    'People ask when it started, like there\'s one clear moment to point to.',
    'Honestly, I don\'t think there was just one.',
    'It wasn\'t a single conversation.',
    'It wasn\'t a single day.',
    'It was hundreds of ordinary ones, quietly stacked on top of each other.',
    'The kind you barely notice while they\'re happening.',
    'And somehow...',
    'I kept every one of them anyway.',
  ] as const,

  finalLetterPause: [
    'I can\'t promise I know what\'s ahead.',
    'I don\'t know how many more sunrises we\'ll watch.',
    'Or how many more ordinary days we\'ll get.',
    'But I know this much.',
    'If you\'ll have me...',
    'I want to keep choosing you, again and again. ❤️',
    'I think it\'s about time I finally asked.',
  ] as const,

  // ── The Question ───────────────────────────────────────────────────────
  question: 'Will You Be My Girlfriend?',

  subtext: 'Not just today, or this year...\nbut every stop still ahead of us...\nin this life, and any other.\nEvery time.',

  // ── The Button ─────────────────────────────────────────────────────────
  // One button. No "No." No pressure.
  yesLabel: '💕 Yes — Let\'s Keep Going',

  // ── The Ticket (Gift Box) ──────────────────────────────────────────────
  giftTicket: {
    from: 'Tonight',
    to: 'Our Story',
    passenger: process.env['NEXT_PUBLIC_RECIPIENT_NAME'] ?? 'You',
    companion: 'I ❤️',
    noteOnBack: 'This seat\'s been open for you the whole time.',
  },

  // ── Credits ────────────────────────────────────────────────────────────
  creditLines: [
    'Made with care.',
    'Thank you for coming this far.',
    'Every story starts somewhere small.',
    'This one starts with a "Yes."',
  ] as const,

  // ── Secret Ending ──────────────────────────────────────────────────────
  secretEndingText: 'One More Reason',
  secretEndingBody:
    'This isn\'t the end of the story.\nIt\'s just the first page of the next one.',

  // ── Return State Announcement ──────────────────────────────────────────
  // Shown when player returns after completing the journey
  returnAnnouncement:
    'Morning again. The station never really forgets a familiar face. Welcome back.',
} as const
