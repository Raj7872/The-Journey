// ─────────────────────────────────────────────────────────────────────────────
// EmotionDirector
// The central nervous system of the atmospheric experience.
// All weather, lighting, audio, particle, and announcement systems
// subscribe to this — they never set their own state.
//
// Scene progression drives emotion transitions.
// Emotion drives everything else.
// ─────────────────────────────────────────────────────────────────────────────

import type { AtmosphereConfig, EmotionDirectorState, EmotionState, EmotionTransition } from '@/types/emotion'
import type { SceneId } from '@/types/scene'
import { TIMING } from '@/lib/constants/timing'
import { lerp } from '@/lib/utils/math'
import { ATMOSPHERE_MAP } from './atmosphereMap'

// Defines which emotion is active for each scene
const SCENE_EMOTION_MAP: Record<SceneId, EmotionState> = {
  preloader: 'LONELY',
  'outside-station': 'LONELY',
  'entrance-hall': 'CURIOUS',
  'main-hall': 'CURIOUS',
  'platform-one': 'CURIOUS',
  'platform-cafe': 'COMFORTABLE',
  'memory-tunnel': 'NOSTALGIC',
  'waiting-room': 'NOSTALGIC',
  'platform-eleven': 'HOPEFUL',
  'train-arrival': 'HOPEFUL',
  'train-interior': 'HOPEFUL',
  'final-carriage': 'HOPEFUL',
  'the-field': 'LOVED',
  'the-bench': 'LOVED',
  'the-gift': 'LOVED',
  'the-silence': 'LOVED',
  'the-question': 'LOVED',
  'world-changes': 'BEGINNING',
  credits: 'BEGINNING',
  'secret-ending': 'BEGINNING',
}

// Transition durations between emotion states (ms)
const EMOTION_TRANSITIONS: Partial<Record<`${EmotionState}→${EmotionState}`, EmotionTransition>> = {
  'LONELY→CURIOUS': { from: 'LONELY', to: 'CURIOUS', duration: 4000, interruptible: true },
  'CURIOUS→COMFORTABLE': { from: 'CURIOUS', to: 'COMFORTABLE', duration: 6000, interruptible: true },
  'COMFORTABLE→NOSTALGIC': { from: 'COMFORTABLE', to: 'NOSTALGIC', duration: 5000, interruptible: true },
  'NOSTALGIC→HOPEFUL': { from: 'NOSTALGIC', to: 'HOPEFUL', duration: 8000, interruptible: true },
  'HOPEFUL→LOVED': { from: 'HOPEFUL', to: 'LOVED', duration: 10000, interruptible: false },
  'LOVED→BEGINNING': { from: 'LOVED', to: 'BEGINNING', duration: 6000, interruptible: false },
}

type Subscriber = (state: EmotionDirectorState) => void

export class EmotionDirector {
  private state: EmotionDirectorState
  private subscribers: Set<Subscriber> = new Set()
  private transitionFrame: number | null = null
  private transitionStart: number | null = null
  private transitionDuration: number = 3000

  constructor() {
    this.state = {
      current: 'LONELY',
      previous: null,
      isTransitioning: false,
      transitionProgress: 1,
      atmosphereConfig: ATMOSPHERE_MAP['LONELY'],
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Called by SceneManager when the scene changes */
  onSceneChange(sceneId: SceneId): void {
    const targetEmotion = SCENE_EMOTION_MAP[sceneId]
    if (targetEmotion === this.state.current) return
    this.transitionTo(targetEmotion)
  }

  /** Force an immediate emotion (no transition) — used for save restore */
  setImmediate(emotion: EmotionState): void {
    if (this.transitionFrame !== null) {
      cancelAnimationFrame(this.transitionFrame)
      this.transitionFrame = null
    }
    this.state = {
      current: emotion,
      previous: this.state.current,
      isTransitioning: false,
      transitionProgress: 1,
      atmosphereConfig: ATMOSPHERE_MAP[emotion],
    }
    this.notify()
  }

  getState(): EmotionDirectorState {
    return this.state
  }

  getCurrentAtmosphere(): AtmosphereConfig {
    return this.state.atmosphereConfig
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn)
    fn(this.state) // Immediately notify with current state
    return () => this.subscribers.delete(fn)
  }

  dispose(): void {
    if (this.transitionFrame !== null) {
      cancelAnimationFrame(this.transitionFrame)
    }
    this.subscribers.clear()
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private transitionTo(target: EmotionState): void {
    const key = `${this.state.current}→${target}` as `${EmotionState}→${EmotionState}`
    const transition = EMOTION_TRANSITIONS[key]
    const duration = transition?.duration ?? TIMING.SCENE_CROSSFADE

    // If already transitioning and not interruptible, queue but don't override
    if (this.state.isTransitioning && transition && !transition.interruptible) return

    if (this.transitionFrame !== null) {
      cancelAnimationFrame(this.transitionFrame)
    }

    const fromConfig = this.state.atmosphereConfig
    const toConfig = ATMOSPHERE_MAP[target]

    this.transitionDuration = duration
    this.transitionStart = null

    this.state = {
      ...this.state,
      previous: this.state.current,
      current: target,
      isTransitioning: true,
      transitionProgress: 0,
    }

    this.animateTransition(fromConfig, toConfig)
  }

  private animateTransition(from: AtmosphereConfig, to: AtmosphereConfig): void {
    const tick = (timestamp: number) => {
      if (this.transitionStart === null) this.transitionStart = timestamp
      const elapsed = timestamp - this.transitionStart
      const rawProgress = Math.min(elapsed / this.transitionDuration, 1)

      // Smooth ease — no sudden jumps
      const progress = rawProgress < 0.5
        ? 2 * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2

      const interpolated = this.interpolateAtmosphere(from, to, progress)

      this.state = {
        ...this.state,
        isTransitioning: progress < 1,
        transitionProgress: progress,
        atmosphereConfig: interpolated,
      }

      this.notify()

      if (progress < 1) {
        this.transitionFrame = requestAnimationFrame(tick)
      } else {
        this.transitionFrame = null
        this.transitionStart = null
      }
    }

    this.transitionFrame = requestAnimationFrame(tick)
  }

  private interpolateAtmosphere(
    from: AtmosphereConfig,
    to: AtmosphereConfig,
    t: number
  ): AtmosphereConfig {
    return {
      rainIntensity: lerp(from.rainIntensity, to.rainIntensity, t),
      fogDensity: lerp(from.fogDensity, to.fogDensity, t),
      windStrength: lerp(from.windStrength, to.windStrength, t),
      hasThunder: t > 0.5 ? to.hasThunder : from.hasThunder,
      lightWarmth: lerp(from.lightWarmth, to.lightWarmth, t),
      lightBrightness: lerp(from.lightBrightness, to.lightBrightness, t),
      bloomIntensity: lerp(from.bloomIntensity, to.bloomIntensity, t),
      hasSunrays: t > 0.5 ? to.hasSunrays : from.hasSunrays,
      ambientColor: t > 0.5 ? to.ambientColor : from.ambientColor,
      lightSourceColor: t > 0.5 ? to.lightSourceColor : from.lightSourceColor,
      worldFilter: t > 0.5 ? to.worldFilter : from.worldFilter,
      musicTrack: t > 0.5 ? to.musicTrack : from.musicTrack,
      ambientLayers: t > 0.5 ? to.ambientLayers : from.ambientLayers,
      musicVolumeMultiplier: lerp(from.musicVolumeMultiplier, to.musicVolumeMultiplier, t),
      dustDensity: lerp(from.dustDensity, to.dustDensity, t),
      steamDensity: lerp(from.steamDensity, to.steamDensity, t),
      fireflyDensity: lerp(from.fireflyDensity, to.fireflyDensity, t),
      petalDensity: lerp(from.petalDensity, to.petalDensity, t),
      announcementFrequency: lerp(from.announcementFrequency, to.announcementFrequency, t),
      announcementPool: t > 0.5 ? to.announcementPool : from.announcementPool,
    }
  }

  private notify(): void {
    this.subscribers.forEach((fn) => fn(this.state))
  }
}

// Singleton export — one EmotionDirector per application
export const emotionDirector = new EmotionDirector()
