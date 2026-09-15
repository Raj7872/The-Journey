// ─────────────────────────────────────────────────────────────────────────────
// Timing Constants
// Every duration in the application must come from here.
// No magic numbers in components or systems.
// All values in milliseconds unless noted.
// ─────────────────────────────────────────────────────────────────────────────

export const TIMING = {
  // ── Scene Transitions ─────────────────────────────────────────
  SCENE_FADE: 1200,
  SCENE_CROSSFADE: 2000,
  CAMERA_TRANSITION: 3000,
  DOOR_OPEN: 1800,
  CAMERA_SETTLE: 800,

  // ── Memory Interactions ───────────────────────────────────────
  LETTER_UNFOLD: 800,
  WAX_SEAL_BREAK: 600,
  POLAROID_DEVELOP: 4000,
  TICKET_SLIDE: 500,
  FLOWER_BLOOM: 1200,
  POSTCARD_FLIP: 600,
  CASSETTE_INSERT: 700,
  DOODLE_REVEAL: 400,
  BOOKMARK_REVEAL: 350,

  // ── Notebook ─────────────────────────────────────────────────
  NOTEBOOK_OPEN: 600,
  NOTEBOOK_CLOSE: 500,
  NOTEBOOK_PAGE_TURN: 400,
  NOTEBOOK_GLOW: 1500,
  INK_WRITE_PER_CHAR: 40,    // ms per character for handwriting animation
  FINAL_LETTER_WRITE: 8000,  // Total ink animation for final letter

  // ── Ambient ──────────────────────────────────────────────────
  LAMP_FLICKER_PERIOD: 4000,
  CAMERA_FLOAT_PERIOD: 8000,
  CAMERA_FLOAT_AMPLITUDE: 3,  // px
  STEAM_CYCLE: 3000,
  RAIN_DROPLET: 800,
  DUST_FLOAT_PERIOD: 6000,

  // ── Cinematic Sequences ───────────────────────────────────────
  PRELOADER_MIN: 3000,
  TRAIN_ARRIVAL_TOTAL: 55_000,
  TRAIN_ARRIVAL_LIGHT: 5_000,
  TRAIN_ARRIVAL_WHISTLE: 10_000,
  TRAIN_ARRIVAL_RAILS: 15_000,
  TRAIN_ARRIVAL_VISIBLE: 25_000,
  TRAIN_ARRIVAL_SWING: 35_000,
  TRAIN_ARRIVAL_STOP: 45_000,
  TRAIN_ARRIVAL_DOOR: 50_000,
  TRAIN_ARRIVAL_NOD: 53_000,

  // ── Journey / Arrival ──────────────────────────────────────────
  JOURNEY_RIDE_DURATION: 240_000,  // 4 min riding before the train begins to slow
  JOURNEY_ANNOUNCE_SOON: 60_000,   // 1:00 — "Arriving to Destination Soon"
  JOURNEY_ANNOUNCE_VERY_SOON: 120_000, // 2:00 — "Arriving Very Soon"
  JOURNEY_ANNOUNCE_ALMOST: 180_000,    // 3:00 — "Almost there"
  JOURNEY_ANNOUNCE_HERE: 210_000,      // 3:30 — "Your destination is here" + the wall message
  ARRIVAL_SLOWING: 0,              // slowing begins the instant final-carriage starts
  ARRIVAL_STOP: 12_000,            // train comes to rest
  ARRIVAL_DOORS: 15_000,           // doors open automatically — no click required

  // ── Proposal ─────────────────────────────────────────────────
  PROPOSAL_SILENCE_MIN: 10_000,  // PROTECTED — never interrupt
  READY_PROMPT_DELAY: 1500,      // beat after the letter finishes, before "Are you ready?" fades in
  YES_PAUSE: 2000,               // Pause after YES before world changes
  WORLD_CHANGES_BIRDS: 2200,
  WORLD_CHANGES_FLOWERS: 3000,
  WORLD_CHANGES_LIGHT: 4000,
  WORLD_CHANGES_WHISTLE: 8000,
  WORLD_CHANGES_CAMERA: 12_000,

  // ── Ending ────────────────────────────────────────────────────
  SECRET_ENDING_DELAY: 20_000,
  SECRET_ENDING_BREEZE: 21_000,
  SECRET_ENDING_PAGE: 22_000,
  SECRET_ENDING_INK: 24_000,
  SECRET_ENDING_CLOSE: 38_000,
  SECRET_ENDING_FADE: 40_000,
  FINAL_FADE_HOLD: 5000,

  // ── Credits ───────────────────────────────────────────────────
  CREDITS_PAGE_PAUSE: 3000,   // a held beat after page one, before it turns
  CREDITS_PAGE_TURN: 1400,    // the turn itself — slow and deliberate, not the interactive 400ms flip
  CREDITS_CLOSE_DELAY: 2800,  // a held beat after page two, before the cover shuts

  // ── Announcements ─────────────────────────────────────────────
  ANNOUNCEMENT_MIN_GAP: 45_000,
  ANNOUNCEMENT_IDLE_TRIGGER: 120_000,
  ANNOUNCEMENT_STATIC_DURATION: 800,

  // ── Ambient Events ─────────────────────────────────────────────
  AMBIENT_EVENT_MIN_GAP: 20_000,
  AMBIENT_EVENT_MAX_GAP: 50_000,
  AMBIENT_EVENT_DURATION: 6000,

  // ── Audio ─────────────────────────────────────────────────────
  MUSIC_FADE_OUT: 2000,
  MUSIC_FADE_IN: 2000,
  MUSIC_CROSSFADE_OVERLAP: 1000,
  AMBIENT_FADE: 1500,

  // ── UI ────────────────────────────────────────────────────────
  INTERACTION_COOLDOWN: 500,
  CURSOR_TRANSITION: 200,
  HOVER_REVEAL: 300,
} as const

export type TimingKey = keyof typeof TIMING
