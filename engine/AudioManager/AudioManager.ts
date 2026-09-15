// ─────────────────────────────────────────────────────────────────────────────
// AudioManager
// Wraps Howler.js with the specific needs of the experience:
// — One music track active at a time, crossfaded elegantly
// — Multiple ambient layers stacked independently
// — SFX fire and forget
// — Announcements queued with minimum gap enforcement
// — All audio subscribes to TimelineDirector via AudioContext
//
// Note: Howler.js is imported dynamically (client-only).
// ─────────────────────────────────────────────────────────────────────────────

import type { AudioManagerState, AmbientLayerKey, MusicKey, SfxKey } from '@/types/audio'
import { TIMING } from '@/lib/constants/timing'

// Howler types — imported dynamically at runtime
type HowlInstance = {
  play: () => number
  stop: (id?: number) => void
  fade: (from: number, to: number, duration: number, id?: number) => void
  volume: (vol?: number, id?: number) => number
  loop: (loop?: boolean) => boolean
  unload: () => void
  state: () => 'unloaded' | 'loading' | 'loaded'
  on: (event: string, fn: () => void, id?: number) => void
}

type HowlConstructor = new (options: {
  src: string[]
  loop?: boolean
  volume?: number
  preload?: boolean
  onload?: () => void
  onloaderror?: (id: number, err: unknown) => void
}) => HowlInstance

type StateListener = (state: AudioManagerState) => void

export class AudioManager {
  private Howl: HowlConstructor | null = null
  private howls: Map<string, HowlInstance> = new Map()
  private activeMusicId: number | null = null
  private activeMusicKey: MusicKey | null = null
  private activeAmbient: Map<AmbientLayerKey, number> = new Map()
  private pendingStops = new Set<ReturnType<typeof setTimeout>>()
  private isMuted = false
  private musicVolume = 0.7
  private sfxVolume = 0.8
  private isInitialized = false
  private listeners: Set<StateListener> = new Set()

  // ── Initialization ────────────────────────────────────────────────────────

  async init(options?: { musicVolume?: number; sfxVolume?: number }): Promise<void> {
    if (this.isInitialized) return

    try {
      // Dynamic import — Howler is client-only
      const { Howl } = await import('howler')
      this.Howl = Howl as unknown as HowlConstructor
      this.isInitialized = true

      if (options?.musicVolume !== undefined) this.musicVolume = options.musicVolume
      if (options?.sfxVolume !== undefined) this.sfxVolume = options.sfxVolume

      this.notify()
    } catch (err) {
      console.error('[AudioManager] Failed to initialize Howler:', err)
    }
  }

  // ── Music ─────────────────────────────────────────────────────────────────

  /** Play a music track, crossfading from current if one is active */
  playMusic(
    key: MusicKey,
    options?: { fadeInDuration?: number; fadeOutDuration?: number }
  ): void {
    if (!this.isInitialized || this.isMuted) return
    if (key === this.activeMusicKey) return

    const fadeOut = options?.fadeOutDuration ?? TIMING.MUSIC_FADE_OUT
    const fadeIn = options?.fadeInDuration ?? TIMING.MUSIC_FADE_IN

    // Fade out current track
    if (this.activeMusicKey && this.activeMusicId !== null) {
      const current = this.howls.get(this.activeMusicKey)
      if (current) {
        current.fade(this.musicVolume, 0, fadeOut, this.activeMusicId)
        const currentId = this.activeMusicId
        this.releaseAfterFade(this.activeMusicKey, current, currentId, fadeOut)
      }
    }

    // Load and play new track with fade in
    const howl = this.getOrCreate(key, true)
    const id = howl.play()
    howl.volume(0, id)
    howl.fade(0, this.musicVolume, fadeIn, id)

    this.activeMusicKey = key
    this.activeMusicId = id
    this.notify()
  }

  stopMusic(fadeDuration = TIMING.MUSIC_FADE_OUT): void {
    if (!this.activeMusicKey || this.activeMusicId === null) return
    const howl = this.howls.get(this.activeMusicKey)
    if (howl) {
      howl.fade(this.musicVolume, 0, fadeDuration, this.activeMusicId)
      const id = this.activeMusicId
      this.releaseAfterFade(this.activeMusicKey, howl, id, fadeDuration)
    }
    this.activeMusicKey = null
    this.activeMusicId = null
    this.notify()
  }

  // ── Ambient ───────────────────────────────────────────────────────────────

  startAmbient(key: AmbientLayerKey, volume = 0.4): void {
    if (!this.isInitialized || this.activeAmbient.has(key)) return
    const howl = this.getOrCreate(key, true)
    const id = howl.play()
    howl.volume(0, id)
    howl.fade(0, volume, TIMING.AMBIENT_FADE, id)
    this.activeAmbient.set(key, id)
    this.notify()
  }

  stopAmbient(key: AmbientLayerKey): void {
    const id = this.activeAmbient.get(key)
    if (id === undefined) return
    const howl = this.howls.get(key)
    if (howl) {
      howl.fade(0.4, 0, TIMING.AMBIENT_FADE, id)
      this.releaseAfterFade(key, howl, id, TIMING.AMBIENT_FADE)
    }
    this.activeAmbient.delete(key)
    this.notify()
  }

  stopAllAmbient(): void {
    this.activeAmbient.forEach((_, key) => this.stopAmbient(key))
  }

  /** Sync ambient layers to a desired set — starts missing, stops extras */
  syncAmbientLayers(desiredKeys: string[]): void {
    const desired = new Set(desiredKeys as AmbientLayerKey[])

    // Stop layers not in desired set
    this.activeAmbient.forEach((_, key) => {
      if (!desired.has(key)) this.stopAmbient(key)
    })

    // Start layers not yet active
    desired.forEach((key) => {
      if (!this.activeAmbient.has(key)) this.startAmbient(key)
    })
  }

  // ── SFX ──────────────────────────────────────────────────────────────────

  playSfx(key: SfxKey, volume?: number): void {
    if (!this.isInitialized || this.isMuted) return
    const howl = this.getOrCreate(key, false)
    const id = howl.play()
    howl.volume(volume ?? this.sfxVolume, id)
  }

  // ── Volume ────────────────────────────────────────────────────────────────

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.activeMusicKey && this.activeMusicId !== null) {
      this.howls.get(this.activeMusicKey)?.volume(this.musicVolume, this.activeMusicId)
    }
    this.notify()
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    this.notify()
  }

  mute(): void {
    this.isMuted = true
    this.howls.forEach((howl) => howl.volume(0))
    this.notify()
  }

  unmute(): void {
    this.isMuted = false
    if (this.activeMusicKey && this.activeMusicId !== null) {
      this.howls.get(this.activeMusicKey)?.volume(this.musicVolume, this.activeMusicId)
    }
    this.notify()
  }

  // ── State ─────────────────────────────────────────────────────────────────

  getState(): AudioManagerState {
    return {
      currentMusicKey: this.activeMusicKey,
      activeAmbientLayers: new Set(this.activeAmbient.keys()),
      isMusicPlaying: this.activeMusicKey !== null,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMuted: this.isMuted,
      isInitialized: this.isInitialized,
    }
  }

  subscribe(fn: StateListener): () => void {
    this.listeners.add(fn)
    fn(this.getState())
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    this.pendingStops.forEach(clearTimeout)
    this.pendingStops.clear()
    this.activeMusicKey = null
    this.activeMusicId = null
    this.howls.forEach((howl) => howl.unload())
    this.howls.clear()
    this.activeAmbient.clear()
    this.listeners.clear()
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private releaseAfterFade(key: string, howl: HowlInstance, id: number, delay: number): void {
    const timer = setTimeout(() => {
      this.pendingStops.delete(timer)
      howl.stop(id)
      // A rapid revisit may already be playing another instance of this track.
      if (this.activeMusicKey === key || this.activeAmbient.has(key as AmbientLayerKey)) return
      if (this.howls.get(key) !== howl) return
      howl.unload()
      this.howls.delete(key)
    }, delay)
    this.pendingStops.add(timer)
  }

  private getOrCreate(key: string, loop: boolean): HowlInstance {
    const existing = this.howls.get(key)
    if (existing) return existing

    if (!this.Howl) throw new Error('[AudioManager] Not initialized')

    const src = this.resolveAudioPath(key)
    const howl = new this.Howl({
      src: [src],
      loop,
      volume: this.musicVolume,
      preload: true,
      onloaderror: (_id, err) => {
        console.warn(`[AudioManager] Failed to load audio "${key}":`, err)
      },
    })

    this.howls.set(key, howl)
    return howl
  }

  private resolveAudioPath(key: string): string {
    // Map keys to public asset paths
    const base = process.env['NEXT_PUBLIC_ASSET_BASE_URL'] ?? ''
    const paths: Record<string, string> = {
      // Music
      'piano-entrance': `${base}/audio/music/piano-entrance.mp3`,
      'strings-main-hall': `${base}/audio/music/strings-main-hall.mp3`,
      'jazz-cafe': `${base}/audio/music/jazz-cafe.mp3`,
      'ambient-tunnel': `${base}/audio/music/ambient-tunnel.mp3`,
      'silence-waiting-room': `${base}/audio/music/silence-waiting-room.mp3`,
      'piano-train': `${base}/audio/music/piano-train.mp3`,
      'piano-sunrise': `${base}/audio/music/piano-sunrise.mp3`,
      'ending-uplifting': `${base}/audio/music/ending-uplifting.mp3`,
      // Ambient
      'rain-exterior': `${base}/audio/ambient/rain-exterior.mp3`,
      'rain-interior': `${base}/audio/ambient/rain-interior.mp3`,
      'rain-window': `${base}/audio/ambient/rain-window.mp3`,
      'wind-platform': `${base}/audio/ambient/wind-platform.mp3`,
      'station-atmosphere': `${base}/audio/ambient/station-atmosphere.mp3`,
      'cafe-background': `${base}/audio/ambient/cafe-background.mp3`,
      'train-moving': `${base}/audio/ambient/train-moving.mp3`,
      'birds-morning': `${base}/audio/ambient/birds-morning.mp3`,
      'field-ambient': `${base}/audio/ambient/field-ambient.mp3`,
      'vinyl-crackle': `${base}/audio/ambient/vinyl-crackle.mp3`,
      fireplace: `${base}/audio/ambient/fireplace.mp3`,
      // SFX
      'paper-unfold': `${base}/audio/sfx/paper-unfold.mp3`,
      'wax-seal-break': `${base}/audio/sfx/wax-seal-break.mp3`,
      'page-turn': `${base}/audio/sfx/page-turn.mp3`,
      'notebook-open': `${base}/audio/sfx/notebook-open.mp3`,
      'notebook-close': `${base}/audio/sfx/notebook-close.mp3`,
      'polaroid-develop': `${base}/audio/sfx/polaroid-develop.mp3`,
      'ticket-stamp': `${base}/audio/sfx/ticket-stamp.mp3`,
      'cassette-insert': `${base}/audio/sfx/cassette-insert.mp3`,
      'tape-hiss': `${base}/audio/sfx/tape-hiss.mp3`,
      'box-open': `${base}/audio/sfx/box-open.mp3`,
      'box-latch': `${base}/audio/sfx/box-latch.mp3`,
      'paper-rustle': `${base}/audio/sfx/paper-rustle.mp3`,
      'coffee-cup': `${base}/audio/sfx/coffee-cup.mp3`,
      'clock-tick': `${base}/audio/sfx/clock-tick.mp3`,
      'lamp-flicker': `${base}/audio/sfx/lamp-flicker.mp3`,
      'train-whistle': `${base}/audio/sfx/train-whistle.mp3`,
      'train-brake': `${base}/audio/sfx/train-brake.mp3`,
      'train-door': `${base}/audio/sfx/train-door.mp3`,
      'birds-fly': `${base}/audio/sfx/birds-fly.mp3`,
      'memory-collect': `${base}/audio/sfx/memory-collect.mp3`,
      'announcement-static': `${base}/audio/sfx/announcement-static.mp3`,
      'postcard-flip': `${base}/audio/sfx/postcard-flip.mp3`,
      'flower-rustle': `${base}/audio/sfx/flower-rustle.mp3`,
      'cassette-play': `${base}/audio/sfx/cassette-play.mp3`,
    }
    return paths[key] ?? `${base}/audio/sfx/${key}.mp3`
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.getState()))
  }
}

export const audioManager = new AudioManager()
