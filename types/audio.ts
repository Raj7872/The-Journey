// ─────────────────────────────────────────────────────────────────────────────
// Audio System Types
// One music track at a time. Ambient layers stack.
// SFX fire and forget. Announcements have a priority system.
// ─────────────────────────────────────────────────────────────────────────────

export type AudioTrackType = 'music' | 'ambient' | 'sfx' | 'voice' | 'announcement'

export type AudioFormat = 'mp3' | 'ogg' | 'wav'

export interface AudioTrack {
  key: string
  src: string
  type: AudioTrackType
  /** Whether this track loops */
  loop: boolean
  /** Base volume 0–1 */
  volume: number
  /** Fade-in duration in ms */
  fadeIn?: number
  /** Fade-out duration in ms */
  fadeOut?: number
  /** Whether to preload this track */
  preload: boolean
}

export interface MusicFadeConfig {
  /** Duration of fade out on current track */
  fadeOutDuration: number
  /** Duration of fade in on next track */
  fadeInDuration: number
  /** Overlap duration — how long both play simultaneously */
  overlapDuration: number
}

export type AmbientLayerKey =
  | 'rain-exterior'
  | 'rain-interior'
  | 'rain-window'
  | 'wind-platform'
  | 'station-atmosphere'
  | 'cafe-background'
  | 'train-moving'
  | 'birds-morning'
  | 'field-ambient'
  | 'vinyl-crackle'
  | 'fireplace'

export type SfxKey =
  | 'paper-unfold'
  | 'wax-seal-break'
  | 'page-turn'
  | 'notebook-open'
  | 'notebook-close'
  | 'polaroid-develop'
  | 'ticket-stamp'
  | 'cassette-insert'
  | 'tape-hiss'
  | 'box-open'
  | 'box-latch'
  | 'paper-rustle'
  | 'coffee-cup'
  | 'clock-tick'
  | 'lamp-flicker'
  | 'train-whistle'
  | 'train-brake'
  | 'train-door'
  | 'birds-fly'
  | 'memory-collect'
  | 'announcement-static'
  | 'postcard-flip'
  | 'flower-rustle'
  | 'cassette-play'

export type MusicKey =
  | 'piano-entrance'
  | 'strings-main-hall'
  | 'jazz-cafe'
  | 'ambient-tunnel'
  | 'silence-waiting-room'
  | 'piano-train'
  | 'piano-sunrise'
  | 'ending-uplifting'

export interface AudioManagerState {
  currentMusicKey: MusicKey | null
  activeAmbientLayers: Set<AmbientLayerKey>
  isMusicPlaying: boolean
  musicVolume: number
  sfxVolume: number
  isMuted: boolean
  isInitialized: boolean
}
