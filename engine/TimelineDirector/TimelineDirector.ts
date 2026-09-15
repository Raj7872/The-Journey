// ─────────────────────────────────────────────────────────────────────────────
// TimelineDirector
// The single source of truth for the entire experience state.
// Replaces EmotionDirector as the central orchestrator.
//
// All atmosphere systems subscribe here — they never compute their own state.
// Scene changes drive narrative state, which drives everything else.
//
// What it owns:
//   currentAct       — which act of the story we are in
//   currentScene     — the specific scene within that act
//   emotionalState   — the current emotional register
//   progress         — 0–1 overall journey progress
//   timeOfDay        — narrative time (LATE_NIGHT → SUNRISE)
//   weatherState     — rain, fog, wind
//   lightingProfile  — warmth, brightness, bloom, filters
//   ambienceProfile  — music, ambient layers, announcements
//   particleProfile  — dust, steam, fireflies, petals
//   clockMinute      — the station clock value (58.0 → 60.0)
// ─────────────────────────────────────────────────────────────────────────────

import type { ActId, SceneId } from '@/types/scene'
import type {
  AmbienceProfile,
  EmotionalState,
  LightingProfile,
  ParticleProfile,
  TimelineState,
  TimelineTransition,
  TimeOfDay,
  WeatherState,
} from '@/types/timeline'
import { TIMING } from '@/lib/constants/timing'
import { lerp, easeInOutCubic } from '@/lib/utils/math'
import { SCENE_PROFILES, type SceneProfile } from './sceneProfiles'

// Scene → Act mapping
const SCENE_ACT: Record<SceneId, ActId> = {
  preloader:          'preloader',
  'outside-station':  'act-arrival',
  'entrance-hall':    'act-arrival',
  'main-hall':        'act-exploration',
  'platform-one':     'act-exploration',
  'platform-cafe':    'act-exploration',
  'memory-tunnel':    'act-exploration',
  'waiting-room':     'act-exploration',
  'platform-eleven':  'act-boarding',
  'train-arrival':    'act-boarding',
  'train-interior':   'act-journey',
  'final-carriage':   'act-journey',
  'the-field':        'act-sunrise',
  'the-bench':        'act-sunrise',
  'the-gift':         'proposal',
  'the-silence':      'proposal',
  'the-question':     'proposal',
  'world-changes':    'ending',
  credits:            'ending',
  'secret-ending':    'ending',
}

// Progress milestones per scene (used to calculate overall progress 0–1)
const SCENE_PROGRESS: Record<SceneId, number> = {
  preloader:          0.0,
  'outside-station':  0.02,
  'entrance-hall':    0.05,
  'main-hall':        0.1,
  'platform-one':     0.18,
  'platform-cafe':    0.26,
  'memory-tunnel':    0.36,
  'waiting-room':     0.44,
  'platform-eleven':  0.52,
  'train-arrival':    0.58,
  'train-interior':   0.65,
  'final-carriage':   0.72,
  'the-field':        0.78,
  'the-bench':        0.82,
  'the-gift':         0.86,
  'the-silence':      0.90,
  'the-question':     0.93,
  'world-changes':    0.96,
  credits:            0.98,
  'secret-ending':    1.0,
}

type TimelineListener = (state: TimelineState) => void

function buildTimelineState(
  scene: SceneId,
  profile: SceneProfile,
  isTransitioning: boolean,
  transitionProgress: number
): TimelineState {
  return {
    currentAct: SCENE_ACT[scene],
    currentScene: scene,
    progress: SCENE_PROGRESS[scene],
    emotionalState: profile.emotionalState,
    timeOfDay: profile.timeOfDay,
    clockMinute: progressToClockMinute(SCENE_PROGRESS[scene]),
    weatherState: profile.weather,
    lightingProfile: profile.lighting,
    ambienceProfile: profile.ambience,
    particleProfile: profile.particles,
    isTransitioning,
    transitionProgress,
  }
}

function progressToClockMinute(progress: number): number {
  // 0.0 → 58.0 (11:58)
  // 0.93 → 59.98 (11:59:58) — freezes at proposal
  // After YES → 60.0 (12:00)
  if (progress >= 1.0) return 60.0
  return 58.0 + (progress / 0.93) * 1.98
}

function lerpWeather(from: WeatherState, to: WeatherState, t: number): WeatherState {
  const rain = lerp(from.rainIntensity, to.rainIntensity, t)
  return {
    rainIntensity: rain,
    fogDensity: lerp(from.fogDensity, to.fogDensity, t),
    windStrength: lerp(from.windStrength, to.windStrength, t),
    hasThunder: t > 0.5 ? to.hasThunder : from.hasThunder,
    rainDropCount: Math.floor(rain * 300),
    puddlesVisible: rain > 0.2,
  }
}

function lerpLighting(from: LightingProfile, to: LightingProfile, t: number): LightingProfile {
  return {
    warmth: lerp(from.warmth, to.warmth, t),
    brightness: lerp(from.brightness, to.brightness, t),
    bloomIntensity: lerp(from.bloomIntensity, to.bloomIntensity, t),
    hasSunrays: t > 0.5 ? to.hasSunrays : from.hasSunrays,
    ambientColor: t > 0.5 ? to.ambientColor : from.ambientColor,
    lightSourceColor: t > 0.5 ? to.lightSourceColor : from.lightSourceColor,
    worldFilter: t > 0.5 ? to.worldFilter : from.worldFilter,
  }
}

function lerpParticles(from: ParticleProfile, to: ParticleProfile, t: number): ParticleProfile {
  return {
    dustDensity: lerp(from.dustDensity, to.dustDensity, t),
    steamDensity: lerp(from.steamDensity, to.steamDensity, t),
    fireflyDensity: lerp(from.fireflyDensity, to.fireflyDensity, t),
    petalDensity: lerp(from.petalDensity, to.petalDensity, t),
  }
}

function lerpAmbience(from: AmbienceProfile, to: AmbienceProfile, t: number): AmbienceProfile {
  // Discrete switches at midpoint — audio crossfade is handled by AudioManager
  return t > 0.5 ? to : from
}

function lerpEmotionalState(from: EmotionalState, to: EmotionalState, t: number): EmotionalState {
  return t > 0.5 ? to : from
}

function lerpTimeOfDay(from: TimeOfDay, to: TimeOfDay, t: number): TimeOfDay {
  return t > 0.5 ? to : from
}

export class TimelineDirector {
  private state: TimelineState
  private listeners: Set<TimelineListener> = new Set()
  private animFrame: number | null = null
  private transitionStart: number | null = null
  private transitionDuration: number = TIMING.SCENE_CROSSFADE
  private fromProfile: SceneProfile | null = null
  private toProfile: SceneProfile | null = null
  private toScene: SceneId | null = null
  private clockFrozen = false

  constructor() {
    const initialProfile = SCENE_PROFILES['preloader']
    this.state = buildTimelineState('preloader', initialProfile, false, 1)
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  getState(): Readonly<TimelineState> {
    return this.state
  }

  /** Transition to a new scene — drives all atmosphere changes */
  transitionTo(scene: SceneId, durationOverrideMs?: number): void {
    if (this.state.isTransitioning && !this.getCurrentProfile().transitionInterruptible) return
    if (scene === this.state.currentScene) return

    const targetProfile = SCENE_PROFILES[scene]
    const duration = durationOverrideMs ?? targetProfile.transitionDurationMs

    this.fromProfile = { ...this.getCurrentProfile() }
    this.toProfile = targetProfile
    this.toScene = scene
    this.transitionDuration = duration
    this.transitionStart = null

    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame)
    }

    this.state = { ...this.state, isTransitioning: true, transitionProgress: 0 }
    this.notify()
    this.animateTransition()
  }

  /** Snap immediately to a scene — used for save restore, no animation */
  snapTo(scene: SceneId): void {
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame)
      this.animFrame = null
    }
    const profile = SCENE_PROFILES[scene]
    this.state = buildTimelineState(scene, profile, false, 1)
    this.notify()
  }

  /** Freeze the clock — called when proposal question appears */
  freezeClock(): void {
    this.clockFrozen = true
    this.notify()
  }

  /** Advance clock to midnight — called when YES is pressed. Stays frozen
   *  here (at 60.0 instead of the proposal's 59.98) through every scene
   *  that follows — the clock never moves again. */
  advanceToMidnight(): void {
    this.clockFrozen = true
    this.state = { ...this.state, clockMinute: 60.0 }
    this.notify()
  }

  /**
   * Debug-only: directly patch weather/lighting/time-of-day without going
   * through a scene transition. The override holds until the next real
   * scene transition recomputes state from the scene profile.
   */
  debugSetWeather(overrides: Partial<WeatherState>): void {
    this.state = { ...this.state, weatherState: { ...this.state.weatherState, ...overrides } }
    this.notify()
  }

  debugSetTimeOfDay(timeOfDay: TimeOfDay, lightingOverrides?: Partial<LightingProfile>): void {
    this.state = {
      ...this.state,
      timeOfDay,
      lightingProfile: lightingOverrides
        ? { ...this.state.lightingProfile, ...lightingOverrides }
        : this.state.lightingProfile,
    }
    this.notify()
  }

  subscribe(fn: TimelineListener): () => void {
    this.listeners.add(fn)
    fn(this.state)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    if (this.animFrame !== null) cancelAnimationFrame(this.animFrame)
    this.listeners.clear()
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private getCurrentProfile(): SceneProfile {
    return SCENE_PROFILES[this.state.currentScene]
  }

  private animateTransition(): void {
    const tick = (timestamp: number): void => {
      if (this.transitionStart === null) this.transitionStart = timestamp

      const elapsed = timestamp - this.transitionStart
      const rawT = Math.min(elapsed / this.transitionDuration, 1)
      const t = easeInOutCubic(rawT)

      const from = this.fromProfile!
      const to = this.toProfile!
      const scene = this.toScene!

      // Interpolate all profile values
      const interpolatedProfile: SceneProfile = {
        emotionalState: lerpEmotionalState(from.emotionalState, to.emotionalState, t),
        timeOfDay: lerpTimeOfDay(from.timeOfDay, to.timeOfDay, t),
        weather: lerpWeather(from.weather, to.weather, t),
        lighting: lerpLighting(from.lighting, to.lighting, t),
        ambience: lerpAmbience(from.ambience, to.ambience, t),
        particles: lerpParticles(from.particles, to.particles, t),
        transitionDurationMs: to.transitionDurationMs,
        transitionInterruptible: to.transitionInterruptible,
      }

      const progressFrom = SCENE_PROGRESS[this.state.currentScene] ?? 0
      const progressTo = SCENE_PROGRESS[scene]
      const interpolatedProgress = lerp(progressFrom, progressTo, t)
      const clockMinute = this.clockFrozen
        ? this.state.clockMinute
        : progressToClockMinute(interpolatedProgress)

      this.state = {
        currentAct: t > 0.5 ? SCENE_ACT[scene] : this.state.currentAct,
        currentScene: t > 0.5 ? scene : this.state.currentScene,
        progress: interpolatedProgress,
        emotionalState: interpolatedProfile.emotionalState,
        timeOfDay: interpolatedProfile.timeOfDay,
        clockMinute,
        weatherState: interpolatedProfile.weather,
        lightingProfile: interpolatedProfile.lighting,
        ambienceProfile: interpolatedProfile.ambience,
        particleProfile: interpolatedProfile.particles,
        isTransitioning: rawT < 1,
        transitionProgress: t,
      }

      this.notify()

      if (rawT < 1) {
        this.animFrame = requestAnimationFrame(tick)
      } else {
        this.animFrame = null
        this.transitionStart = null
        this.fromProfile = null
        this.toProfile = null
        this.toScene = null
      }
    }

    this.animFrame = requestAnimationFrame(tick)
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.state))
  }
}

// Singleton — one TimelineDirector per application
export const timelineDirector = new TimelineDirector()
