// ─────────────────────────────────────────────────────────────────────────────
// Timeline Director Types
// The single source of truth for all narrative and atmospheric state.
// Every environment system subscribes to TimelineState — nothing else.
// ─────────────────────────────────────────────────────────────────────────────

import type { ActId, SceneId } from './scene'

// ── Emotional State ────────────────────────────────────────────────────────

export type EmotionalState =
  | 'LONELY'      // Opening — dark, cold, empty station
  | 'CURIOUS'     // Early exploration — player notices things
  | 'COMFORTABLE' // Café, warmth, shelter
  | 'NOSTALGIC'   // Memory tunnel, letters, the past
  | 'HOPEFUL'     // Platform 11, rain softening
  | 'LOVED'       // The field, the letter, the silence
  | 'BEGINNING'   // After YES — the world wakes up

// ── Time of Day ───────────────────────────────────────────────────────────

export type TimeOfDay =
  | 'LATE_NIGHT'   // 11:58 — opening, cold and dark
  | 'NEAR_MIDNIGHT'// 11:59 — tension building
  | 'MIDNIGHT'     // 12:00 — the moment after YES
  | 'EARLY_DAWN'   // First light — train journey
  | 'SUNRISE'      // The field — golden warmth

// ── Weather State ─────────────────────────────────────────────────────────

export interface WeatherState {
  rainIntensity: number    // 0–1
  fogDensity: number       // 0–1
  windStrength: number     // 0–1
  hasThunder: boolean
  rainDropCount: number    // Derived: rainIntensity * 300
  puddlesVisible: boolean  // Derived: rainIntensity > 0.2
}

// ── Ambience Profile ──────────────────────────────────────────────────────

export interface AmbienceProfile {
  musicTrack: string | null
  ambientLayers: string[]
  musicVolume: number          // 0–1 multiplier
  announcementPool: string
  announcementIntervalMs: number
}

// ── Lighting Profile ──────────────────────────────────────────────────────

export interface LightingProfile {
  warmth: number         // 0 (cold blue) → 1 (warm gold)
  brightness: number     // 0–1
  bloomIntensity: number // 0–1
  hasSunrays: boolean
  ambientColor: string   // CSS color
  lightSourceColor: string
  worldFilter: string    // CSS filter string
}

// ── Particle Profile ──────────────────────────────────────────────────────

export interface ParticleProfile {
  dustDensity: number      // 0–1
  steamDensity: number     // 0–1
  fireflyDensity: number   // 0–1 — only Act V
  petalDensity: number     // 0–1 — only ending
}

// ── Master Timeline State ─────────────────────────────────────────────────

export interface TimelineState {
  // Narrative position
  currentAct: ActId
  currentScene: SceneId
  progress: number           // 0–1 overall journey progress

  // Emotional layer
  emotionalState: EmotionalState

  // Time
  timeOfDay: TimeOfDay
  clockMinute: number        // 58.0 → 59.98 → frozen → 60.0

  // Environment layers — all derived from the above
  weatherState: WeatherState
  lightingProfile: LightingProfile
  ambienceProfile: AmbienceProfile
  particleProfile: ParticleProfile

  // Transition metadata
  isTransitioning: boolean
  transitionProgress: number  // 0–1
}

// ── Transition ────────────────────────────────────────────────────────────

export interface TimelineTransition {
  fromScene: SceneId
  toScene: SceneId
  durationMs: number
  interruptible: boolean
}
