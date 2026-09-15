// ─────────────────────────────────────────────────────────────────────────────
// Proposal Content
// The emotional payoff. Edit RECIPIENT_NAME in .env.local.
// All text here is final — no UI changes needed to customize the proposal.
// ─────────────────────────────────────────────────────────────────────────────

export const PROPOSAL_CONFIG = {
  // ── The Final Letter ────────────────────────────────────────────────────
  finalLetterLines: [
    'If someone asked me when I fell in love with you...',
    'I don\'t think I could answer.',
    'It wasn\'t one moment.',
    'It wasn\'t one conversation.',
    'It wasn\'t one smile.',
    'It was hundreds of tiny moments.',
    'The kind people usually forget.',
    'But somehow...',
    'I remembered every one.',
  ] as const,

  finalLetterPause: [
    'I don\'t know where life will take us.',
    'I don\'t know how many stations we\'ll pass.',
    'I don\'t know how many sunsets we\'ll watch.',
    'But I know one thing.',
    'If you\'ll let me...',
    'I\'d love to keep choosing you. Forever ❤️',
    'I think I\'ve kept you waiting for long enough.',
  ] as const,

  // ── The Question ───────────────────────────────────────────────────────
  question: 'Will You Be My Girlfriend?',

  subtext: 'I\'ll choose you always...\nat every station of our life...\nin every lifetime. \nPalagi.',

  // ── The Button ─────────────────────────────────────────────────────────
  // One button. No "No." No pressure.
  yesLabel: '💕 Yes, Let\'s Begin Our Forever',

  // ── The Ticket (Gift Box) ──────────────────────────────────────────────
  giftTicket: {
    from: 'Tonight',
    to: 'Our Story',
    passenger: process.env['NEXT_PUBLIC_RECIPIENT_NAME'] ?? 'You',
    companion: 'I ❤️',
    noteOnBack: 'I\'ve been saving this seat for you.',
  },

  // ── Credits ────────────────────────────────────────────────────────────
  creditLines: [
    'Created with love.',
    'Thank you for taking this journey.',
    'Some stories begin with one conversation.',
    'Ours begins with one "Yes."',
  ] as const,

  // ── Secret Ending ──────────────────────────────────────────────────────
  secretEndingText: 'Reason 101',
  secretEndingBody:
    'This story isn\'t finished.\nIt\'s finally ready to begin.',

  // ── Return State Announcement ──────────────────────────────────────────
  // Shown when player returns after completing the journey
  returnAnnouncement:
    'Good morning. The station remembers you. Welcome back.',
} as const
