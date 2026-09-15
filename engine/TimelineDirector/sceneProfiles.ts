// ─────────────────────────────────────────────────────────────────────────────
// Scene Profiles
// Every scene has a complete, pre-defined narrative profile.
// The TimelineDirector interpolates between these as scenes change.
// Nothing is computed ad-hoc — all values come from here.
// ─────────────────────────────────────────────────────────────────────────────

import type { SceneId } from '@/types/scene'
import type {
  AmbienceProfile,
  EmotionalState,
  LightingProfile,
  ParticleProfile,
  TimeOfDay,
  WeatherState,
} from '@/types/timeline'

export interface SceneProfile {
  emotionalState: EmotionalState
  timeOfDay: TimeOfDay
  weather: WeatherState
  lighting: LightingProfile
  ambience: AmbienceProfile
  particles: ParticleProfile
  /** Transition duration INTO this scene in ms */
  transitionDurationMs: number
  /** Whether transitions into this scene can be interrupted */
  transitionInterruptible: boolean
}

const w = (
  rain: number,
  fog: number,
  wind: number,
  thunder = false
): WeatherState => ({
  rainIntensity: rain,
  fogDensity: fog,
  windStrength: wind,
  hasThunder: thunder,
  rainDropCount: Math.floor(rain * 300),
  puddlesVisible: rain > 0.2,
})

const l = (
  warmth: number,
  brightness: number,
  bloom: number,
  sunrays: boolean,
  ambient: string,
  source: string,
  filter: string
): LightingProfile => ({
  warmth,
  brightness,
  bloomIntensity: bloom,
  hasSunrays: sunrays,
  ambientColor: ambient,
  lightSourceColor: source,
  worldFilter: filter,
})

const a = (
  music: string | null,
  layers: string[],
  vol: number,
  pool: string,
  intervalMs: number
): AmbienceProfile => ({
  musicTrack: music,
  ambientLayers: layers,
  musicVolume: vol,
  announcementPool: pool,
  announcementIntervalMs: intervalMs,
})

const p = (
  dust: number,
  steam: number,
  firefly: number,
  petal: number
): ParticleProfile => ({
  dustDensity: dust,
  steamDensity: steam,
  fireflyDensity: firefly,
  petalDensity: petal,
})

export const SCENE_PROFILES: Record<SceneId, SceneProfile> = {
  preloader: {
    emotionalState: 'LONELY',
    timeOfDay: 'LATE_NIGHT',
    weather: w(0.85, 0.65, 0.3),
    lighting: l(0.08, 0.48, 0.05, false,
      'rgba(8,9,16,1)', 'rgba(160,100,40,0.25)',
      'brightness(0.76) saturate(0.56)'),
    ambience: a(null, ['rain-exterior'], 0.5, 'none', 0),
    particles: p(0.1, 0.05, 0, 0),
    transitionDurationMs: 2000,
    transitionInterruptible: false,
  },

  'outside-station': {
    emotionalState: 'LONELY',
    timeOfDay: 'LATE_NIGHT',
    weather: w(0.85, 0.6, 0.3),
    lighting: l(0.1, 0.51, 0.08, false,
      'rgba(10,11,20,1)', 'rgba(180,120,50,0.35)',
      'brightness(0.83) saturate(0.64)'),
    ambience: a(null, ['rain-exterior', 'wind-platform'], 0.7, 'none', 0),
    particles: p(0.15, 0.1, 0, 0),
    transitionDurationMs: 2500,
    transitionInterruptible: true,
  },

  'entrance-hall': {
    emotionalState: 'CURIOUS',
    timeOfDay: 'LATE_NIGHT',
    weather: w(0.75, 0.45, 0.25),
    lighting: l(0.22, 0.6, 0.12, false,
      'rgba(13,14,22,1)', 'rgba(196,130,55,0.48)',
      'brightness(0.87) saturate(0.73)'),
    ambience: a('piano-entrance',
      ['rain-interior', 'station-atmosphere'], 0.75, 'arrival', 90_000),
    particles: p(0.3, 0.25, 0, 0),
    transitionDurationMs: 2000,
    transitionInterruptible: true,
  },

  'main-hall': {
    emotionalState: 'CURIOUS',
    timeOfDay: 'LATE_NIGHT',
    weather: w(0.7, 0.4, 0.22),
    lighting: l(0.28, 0.64, 0.14, false,
      'rgba(13,15,22,1)', 'rgba(202,134,58,0.52)',
      'brightness(0.9) saturate(0.75)'),
    ambience: a('piano-entrance',
      ['rain-interior', 'station-atmosphere'], 0.8, 'arrival', 90_000),
    particles: p(0.38, 0.3, 0, 0),
    transitionDurationMs: 2000,
    transitionInterruptible: true,
  },

  'platform-one': {
    emotionalState: 'CURIOUS',
    timeOfDay: 'LATE_NIGHT',
    weather: w(0.72, 0.42, 0.28),
    lighting: l(0.25, 0.61, 0.13, false,
      'rgba(12,14,21,1)', 'rgba(198,128,52,0.48)',
      'brightness(0.88) saturate(0.74)'),
    ambience: a('strings-main-hall',
      ['rain-exterior', 'wind-platform', 'station-atmosphere'], 0.8, 'exploration', 110_000),
    particles: p(0.35, 0.35, 0, 0),
    transitionDurationMs: 2200,
    transitionInterruptible: true,
  },

  'platform-cafe': {
    emotionalState: 'COMFORTABLE',
    timeOfDay: 'LATE_NIGHT',
    weather: w(0.55, 0.3, 0.2),
    lighting: l(0.58, 0.79, 0.26, false,
      'rgba(20,17,12,1)', 'rgba(212,132,58,0.78)',
      'brightness(0.99) saturate(0.89)'),
    ambience: a('jazz-cafe',
      ['rain-interior', 'cafe-background', 'vinyl-crackle'], 0.9, 'exploration', 120_000),
    particles: p(0.52, 0.62, 0, 0),
    transitionDurationMs: 2500,
    transitionInterruptible: true,
  },

  'memory-tunnel': {
    emotionalState: 'NOSTALGIC',
    timeOfDay: 'LATE_NIGHT',
    weather: w(0.45, 0.38, 0.2),
    lighting: l(0.44, 0.73, 0.19, false,
      'rgba(16,14,10,1)', 'rgba(184,146,42,0.68)',
      'brightness(0.95) saturate(0.82) sepia(0.12)'),
    ambience: a('ambient-tunnel',
      ['rain-interior', 'station-atmosphere'], 0.85, 'memories', 150_000),
    particles: p(0.62, 0.4, 0, 0),
    transitionDurationMs: 3000,
    transitionInterruptible: true,
  },

  'waiting-room': {
    emotionalState: 'NOSTALGIC',
    timeOfDay: 'LATE_NIGHT',
    weather: w(0.42, 0.35, 0.18),
    lighting: l(0.48, 0.75, 0.22, false,
      'rgba(16,14,11,1)', 'rgba(188,142,45,0.72)',
      'brightness(0.96) saturate(0.83) sepia(0.1)'),
    ambience: a('silence-waiting-room',
      ['rain-interior', 'fireplace', 'vinyl-crackle'], 0.6, 'memories', 150_000),
    particles: p(0.58, 0.44, 0, 0),
    transitionDurationMs: 2500,
    transitionInterruptible: true,
  },

  'platform-eleven': {
    emotionalState: 'HOPEFUL',
    timeOfDay: 'NEAR_MIDNIGHT',
    weather: w(0.22, 0.18, 0.35),
    lighting: l(0.72, 0.87, 0.38, false,
      'rgba(18,16,11,1)', 'rgba(210,155,72,0.88)',
      'brightness(1.03) saturate(0.94)'),
    ambience: a('strings-main-hall',
      ['wind-platform', 'rain-interior'], 0.85, 'boarding', 200_000),
    particles: p(0.4, 0.7, 0, 0),
    transitionDurationMs: 3000,
    transitionInterruptible: true,
  },

  'train-arrival': {
    emotionalState: 'HOPEFUL',
    timeOfDay: 'NEAR_MIDNIGHT',
    weather: w(0.18, 0.15, 0.4),
    lighting: l(0.75, 0.88, 0.4, false,
      'rgba(18,16,11,1)', 'rgba(212,158,75,0.9)',
      'brightness(1.04) saturate(0.95)'),
    ambience: a('strings-main-hall',
      ['wind-platform', 'train-moving'], 0.6, 'boarding', 0),
    particles: p(0.35, 0.85, 0, 0),
    transitionDurationMs: 1500,
    transitionInterruptible: false,
  },

  'train-interior': {
    emotionalState: 'HOPEFUL',
    timeOfDay: 'NEAR_MIDNIGHT',
    weather: w(0.15, 0.12, 0.38),
    lighting: l(0.78, 0.9, 0.42, false,
      'rgba(20,17,12,1)', 'rgba(215,162,80,0.92)',
      'brightness(1.05) saturate(0.97)'),
    ambience: a('piano-train',
      ['train-moving', 'rain-window'], 1.0, 'boarding', 200_000),
    particles: p(0.3, 0.5, 0, 0),
    transitionDurationMs: 2000,
    transitionInterruptible: true,
  },

  'final-carriage': {
    emotionalState: 'HOPEFUL',
    timeOfDay: 'EARLY_DAWN',
    weather: w(0.05, 0.08, 0.42),
    lighting: l(0.88, 0.95, 0.52, false,
      'rgba(22,19,13,1)', 'rgba(225,172,90,0.95)',
      'brightness(1.07) saturate(0.99)'),
    ambience: a('piano-train',
      ['train-moving', 'birds-morning'], 0.85, 'none', 0),
    particles: p(0.2, 0.3, 0, 0),
    transitionDurationMs: 3000,
    transitionInterruptible: false,
  },

  'the-field': {
    // The sun hasn't fully cleared the horizon yet here — dimmer and
    // cooler than the scenes that follow it, which get to brighten as
    // the walk continues.
    emotionalState: 'LOVED',
    timeOfDay: 'SUNRISE',
    weather: w(0.0, 0.08, 0.45),
    lighting: l(0.72, 0.6, 0.45, true,
      'rgba(205,195,205,0.14)', 'rgba(220,175,140,0.85)',
      'brightness(0.82) saturate(0.86)'),
    ambience: a('piano-sunrise',
      ['birds-morning', 'field-ambient'], 0.7, 'none', 0),
    particles: p(0.18, 0, 0.15, 0),
    transitionDurationMs: 5000,
    transitionInterruptible: false,
  },

  'the-bench': {
    // Same dim, not-fully-risen light as the-field — still early.
    emotionalState: 'LOVED',
    timeOfDay: 'SUNRISE',
    weather: w(0.0, 0.06, 0.4),
    lighting: l(0.72, 0.6, 0.45, true,
      'rgba(205,195,205,0.14)', 'rgba(220,175,140,0.85)',
      'brightness(0.82) saturate(0.86)'),
    ambience: a('piano-sunrise',
      ['birds-morning', 'field-ambient'], 0.65, 'none', 0),
    particles: p(0.14, 0, 0.12, 0),
    transitionDurationMs: 3000,
    transitionInterruptible: false,
  },

  'the-gift': {
    emotionalState: 'LOVED',
    timeOfDay: 'SUNRISE',
    weather: w(0.0, 0.05, 0.38),
    lighting: l(1.0, 1.01, 0.64, true,
      'rgba(240,212,152,0.16)', 'rgba(236,170,96,1.0)',
      'brightness(1.1) saturate(1.03)'),
    ambience: a('piano-sunrise',
      ['birds-morning', 'field-ambient'], 0.5, 'none', 0),
    particles: p(0.12, 0, 0.1, 0),
    transitionDurationMs: 2000,
    transitionInterruptible: false,
  },

  'the-silence': {
    emotionalState: 'LOVED',
    timeOfDay: 'SUNRISE',
    weather: w(0.0, 0.04, 0.35),
    lighting: l(1.0, 1.02, 0.65, true,
      'rgba(242,215,155,0.18)', 'rgba(238,172,98,1.0)',
      'brightness(1.1) saturate(1.03)'),
    // No music during the silence — only ambient
    ambience: a(null, ['birds-morning', 'field-ambient'], 0.4, 'none', 0),
    particles: p(0.1, 0, 0.08, 0),
    transitionDurationMs: 2000,
    transitionInterruptible: false,
  },

  'the-question': {
    // The quietest scene, not a silent one — the piano keeps playing, just
    // very low, so the moment doesn't go dead right when it matters most.
    emotionalState: 'LOVED',
    timeOfDay: 'SUNRISE',
    weather: w(0.0, 0.03, 0.3),
    lighting: l(1.0, 1.03, 0.66, true,
      'rgba(244,218,158,0.2)', 'rgba(240,175,100,1.0)',
      'brightness(1.1) saturate(1.04)'),
    ambience: a('piano-sunrise', ['field-ambient'], 0.16, 'none', 0),
    particles: p(0.14, 0, 0.16, 0),
    transitionDurationMs: 1500,
    transitionInterruptible: false,
  },

  'world-changes': {
    emotionalState: 'BEGINNING',
    timeOfDay: 'SUNRISE',
    weather: w(0.0, 0.04, 0.6),
    lighting: l(1.0, 1.07, 0.8, true,
      'rgba(248,225,165,0.22)', 'rgba(255,220,150,1.0)',
      'brightness(1.12) saturate(1.1)'),
    ambience: a('ending-uplifting',
      ['birds-morning', 'field-ambient'], 0.9, 'none', 0),
    particles: p(0.08, 0, 0, 0.3),
    transitionDurationMs: 3000,
    transitionInterruptible: false,
  },

  credits: {
    emotionalState: 'BEGINNING',
    timeOfDay: 'SUNRISE',
    weather: w(0.0, 0.03, 0.55),
    lighting: l(1.0, 1.07, 0.78, true,
      'rgba(250,228,170,0.24)', 'rgba(255,222,155,1.0)',
      'brightness(1.12) saturate(1.08)'),
    ambience: a('ending-uplifting',
      ['birds-morning', 'field-ambient'], 0.75, 'none', 0),
    particles: p(0.06, 0, 0, 0.2),
    transitionDurationMs: 2000,
    transitionInterruptible: false,
  },

  'secret-ending': {
    emotionalState: 'BEGINNING',
    timeOfDay: 'SUNRISE',
    weather: w(0.0, 0.02, 0.5),
    lighting: l(1.0, 1.05, 0.75, true,
      'rgba(250,230,172,0.26)', 'rgba(255,224,158,1.0)',
      'brightness(1.12) saturate(1.06)'),
    ambience: a(null, ['birds-morning', 'field-ambient'], 0.5, 'none', 0),
    particles: p(0.04, 0, 0, 0.1),
    transitionDurationMs: 2000,
    transitionInterruptible: false,
  },
}
