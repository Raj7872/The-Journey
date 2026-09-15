// ─────────────────────────────────────────────────────────────────────────────
// Color Constants
// Single source of truth for all colors used in CSS-in-JS, Three.js,
// and dynamic style generation. Tailwind classes are preferred for
// static styles — these are for programmatic use.
// ─────────────────────────────────────────────────────────────────────────────

export const COLORS = {
  // ── Backgrounds ───────────────────────────────────────────────
  STATION_VOID: '#050608',
  STATION_DEEP: '#0a0b0f',
  STATION_WALL: '#0d1117',
  STATION_SURFACE: '#111520',

  // ── Amber / Warmth ────────────────────────────────────────────
  AMBER_GLOW: '#d4843a',
  AMBER_DIM: '#8a5220',
  AMBER_TRACE: '#b8922a',
  AMBER_GHOST: 'rgba(212,132,58,0.08)',
  AMBER_LAMP: 'rgba(212,132,58,0.6)',

  // ── Paper / Cream ─────────────────────────────────────────────
  PAPER_CREAM: '#f2e8d5',
  PAPER_AGED: '#f5eed8',
  PAPER_WARM: '#f0e8d0',
  PAPER_DIM: '#c9b99a',

  // ── Ink ───────────────────────────────────────────────────────
  INK_DARK: '#2d1f0e',
  INK_MEDIUM: '#3d2810',
  INK_FADED: 'rgba(60,45,20,0.5)',
  INK_VERY_FADED: 'rgba(60,45,20,0.3)',

  // ── Wood / Brass ──────────────────────────────────────────────
  WOOD_DARK: '#2a1f14',
  WOOD_MEDIUM: '#3d2d1a',
  BRASS: '#b8922a',
  BRASS_DIM: 'rgba(184,146,42,0.3)',

  // ── Nature (Act V) ────────────────────────────────────────────
  FIELD_GREEN: '#3d5a47',
  SUNRISE_GOLD: '#e8a45a',
  MORNING_WHITE: '#f5f0e8',
  WILDFLOWER_PURPLE: '#8b7aa8',
  WILDFLOWER_YELLOW: '#d4b854',

  // ── Atmospheric ───────────────────────────────────────────────
  FOG: 'rgba(180,200,220,0.06)',
  MIST: 'rgba(220,230,240,0.15)',
  RAIN_DROP: 'rgba(160,185,220,0.3)',

  // ── Three.js (hex numbers) ────────────────────────────────────
  THREE: {
    AMBIENT_NIGHT: 0x050608,
    AMBIENT_STATION: 0x0d1117,
    AMBIENT_SUNRISE: 0xf5f0e8,
    LAMP_WARM: 0xd4843a,
    RAIN: 0xa0b9dc,
    FOG_NIGHT: 0x0a0d16,
    FOG_MORNING: 0xe8e0d0,
    FIREFLY: 0xd4e88a,
  },
} as const

// ── Emotion → Atmosphere Color Mapping ────────────────────────────────────────
// Used by LightingManager — driven by TimelineDirector
export const EMOTION_COLORS: Record<
  string,
  { ambient: string; lightSource: string; worldFilter: string }
> = {
  LONELY: {
    ambient: 'rgba(10,13,22,1)',
    lightSource: 'rgba(212,132,58,0.4)',
    worldFilter: 'brightness(0.7) saturate(0.6)',
  },
  CURIOUS: {
    ambient: 'rgba(13,17,23,1)',
    lightSource: 'rgba(212,132,58,0.6)',
    worldFilter: 'brightness(0.8) saturate(0.7)',
  },
  COMFORTABLE: {
    ambient: 'rgba(20,18,12,1)',
    lightSource: 'rgba(212,132,58,0.85)',
    worldFilter: 'brightness(0.95) saturate(0.9)',
  },
  NOSTALGIC: {
    ambient: 'rgba(16,14,10,1)',
    lightSource: 'rgba(184,146,42,0.75)',
    worldFilter: 'brightness(0.88) saturate(0.8) sepia(0.1)',
  },
  HOPEFUL: {
    ambient: 'rgba(18,16,10,1)',
    lightSource: 'rgba(212,160,80,0.9)',
    worldFilter: 'brightness(1) saturate(0.95)',
  },
  LOVED: {
    ambient: 'rgba(232,200,140,0.15)',
    lightSource: 'rgba(232,164,90,1)',
    worldFilter: 'brightness(1.05) saturate(1)',
  },
  BEGINNING: {
    ambient: 'rgba(245,240,232,0.2)',
    lightSource: 'rgba(255,220,150,1)',
    worldFilter: 'brightness(1.1) saturate(1.1)',
  },
}
