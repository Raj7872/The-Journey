// ─────────────────────────────────────────────────────────────────────────────
// Emotion Director Types
// The central emotional state that drives all atmosphere systems.
// Weather, lighting, audio, particles, and announcements all subscribe to this.
// Systems never set their own state — they derive it from EmotionState.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The seven emotional states the experience moves through.
 * Each state maps to a complete atmosphere configuration.
 */
export type EmotionState =
  | 'LONELY'      // Opening — dark, cold rain, silence, empty station
  | 'CURIOUS'     // Early exploration — player notices things
  | 'COMFORTABLE' // Café, warmth, the station feeling like shelter
  | 'NOSTALGIC'   // Memory tunnel, letters, tickets — the past
  | 'HOPEFUL'     // Platform 11, rain softening, lights warming
  | 'LOVED'       // The field, the letter, the silence
  | 'BEGINNING'   // After YES — the world wakes up

/**
 * Atmosphere configuration derived from an EmotionState.
 * Every atmosphere-affecting system reads from this, not from scene config.
 */
export interface AtmosphereConfig {
  // ── Weather ──────────────────────────────────────────────────
  rainIntensity: number     // 0–1
  fogDensity: number        // 0–1
  windStrength: number      // 0–1
  hasThunder: boolean

  // ── Lighting ─────────────────────────────────────────────────
  lightWarmth: number       // 0 = cold blue, 1 = warm gold
  lightBrightness: number   // 0–1
  bloomIntensity: number    // 0–1
  hasSunrays: boolean

  // ── Color ────────────────────────────────────────────────────
  /** CSS color for the ambient background radiation */
  ambientColor: string
  /** CSS color for lamp/light sources */
  lightSourceColor: string
  /** CSS filter applied to the world container */
  worldFilter: string

  // ── Audio ────────────────────────────────────────────────────
  /** Music track key */
  musicTrack: string | null
  /** Ambient layers to activate */
  ambientLayers: string[]
  /** Master music volume multiplier */
  musicVolumeMultiplier: number

  // ── Particles ────────────────────────────────────────────────
  dustDensity: number       // 0–1
  steamDensity: number      // 0–1
  fireflyDensity: number    // 0–1, active in Act V
  petalDensity: number      // 0–1, active in ending

  // ── Announcements ────────────────────────────────────────────
  announcementFrequency: number   // Seconds between announcements
  announcementPool: string        // Key into announcement pools
}

/**
 * Transition between two emotion states.
 * All transitions are gradual — never instant.
 */
export interface EmotionTransition {
  from: EmotionState
  to: EmotionState
  /** Duration of the atmospheric crossfade in ms */
  duration: number
  /** Whether this transition can be interrupted */
  interruptible: boolean
}

export interface EmotionDirectorState {
  current: EmotionState
  previous: EmotionState | null
  isTransitioning: boolean
  transitionProgress: number   // 0–1
  atmosphereConfig: AtmosphereConfig
}
