// ─────────────────────────────────────────────────────────────────────────────
// Scene & Act Types
// The structural backbone of the experience — every location has an ID,
// every transition has a target, every camera has a preset.
// ─────────────────────────────────────────────────────────────────────────────

export type ActId =
  | 'preloader'
  | 'act-arrival'
  | 'act-exploration'
  | 'act-boarding'
  | 'act-journey'
  | 'act-sunrise'
  | 'proposal'
  | 'ending'

export type SceneId =
  | 'preloader'
  | 'outside-station'
  | 'entrance-hall'
  | 'main-hall'
  | 'platform-one'
  | 'platform-cafe'
  | 'memory-tunnel'
  | 'waiting-room'
  | 'platform-eleven'
  | 'train-arrival'
  | 'train-interior'
  | 'final-carriage'
  | 'the-field'
  | 'the-bench'
  | 'the-gift'
  | 'the-silence'
  | 'the-question'
  | 'world-changes'
  | 'credits'
  | 'secret-ending'

export type TransitionType =
  | 'walk-through-door'
  | 'camera-move'
  | 'train-board'
  | 'notebook-open'
  | 'window-look'
  | 'train-exit'
  | 'fade' // Fallback only — prefer spatial transitions

export interface CameraPreset {
  /** CSS transform representation of position */
  translateX: number
  translateY: number
  /** Scale simulates depth/FOV changes */
  scale: number
  /** Rotation in degrees — very subtle only */
  rotateZ: number
  /** Float animation amplitude in px */
  floatAmplitude: number
  /** Float animation period in ms */
  floatPeriod: number
  /** Duration of transition INTO this preset in ms */
  transitionDuration: number
  /** Easing for this transition */
  transitionEasing: string
}

export interface SceneAudioConfig {
  /** Music track key from AudioManager manifest */
  music?: string
  /** Ambient loop keys — can have multiple active simultaneously */
  ambient: string[]
  /** Announcement pool key for context-aware announcements */
  announcementPool: string
}

export interface SceneUnlockCondition {
  type: 'free' | 'milestone' | 'act-reached'
  milestoneId?: string
  actId?: ActId
}

export interface SceneConfig {
  id: SceneId
  actId: ActId
  label: string
  camera: CameraPreset
  audio: SceneAudioConfig
  unlockCondition: SceneUnlockCondition
  /** Whether this scene allows the notebook to be opened */
  notebookAccessible: boolean
  /** Whether this scene is a cinematic (non-interactive) sequence */
  isCinematic: boolean
}

export interface SceneTransition {
  from: SceneId
  to: SceneId
  type: TransitionType
  duration: number
}

export interface SceneState {
  currentAct: ActId
  currentScene: SceneId
  previousScene: SceneId | null
  isTransitioning: boolean
  transitionType: TransitionType | null
  unlockedScenes: Set<SceneId>
}
