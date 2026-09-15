// ─────────────────────────────────────────────────────────────────────────────
// Save Schema — Versioned
// Version field allows migration when schema evolves.
// The player should never lose progress due to a schema update.
// ─────────────────────────────────────────────────────────────────────────────

import type { ActId, SceneId } from './scene'
import type { EmotionState } from './emotion'

export type SaveSchemaVersion = '1.0'

export const CURRENT_SAVE_VERSION: SaveSchemaVersion = '1.0'

export interface UserSettings {
  musicVolume: number       // 0–1
  sfxVolume: number         // 0–1
  reducedMotion: boolean
  webglEnabled: boolean
  cursorEnabled: boolean
}

export interface SaveSchema {
  /** Schema version — used for migration */
  version: SaveSchemaVersion

  /** ISO timestamp of last save */
  savedAt: number

  // ── Journey State ─────────────────────────────────────────────
  currentAct: ActId
  currentScene: SceneId
  currentEmotion: EmotionState

  /** 0–1 overall journey progress */
  progress: number

  /** Whether the proposal has been reached and completed */
  journeyCompleted: boolean
  completedAt?: number

  // ── Collection State ─────────────────────────────────────────
  collectedMemoryIds: string[]

  /** Memories that have been seen but not collected (hover interactions) */
  discoveredMemoryIds: string[]

  // ── Scene State ───────────────────────────────────────────────
  unlockedSceneIds: SceneId[]
  visitedSceneIds: SceneId[]

  // ── Notebook State ────────────────────────────────────────────
  notebookUnlocked: boolean
  notebookCurrentSection: number
  notebookCurrentPage: number

  // ── Settings ─────────────────────────────────────────────────
  settings: UserSettings
}

/** Default save state for a new journey */
export const DEFAULT_SAVE: SaveSchema = {
  version: '1.0',
  savedAt: 0,
  currentAct: 'preloader',
  currentScene: 'preloader',
  currentEmotion: 'LONELY',
  progress: 0,
  journeyCompleted: false,
  collectedMemoryIds: [],
  discoveredMemoryIds: [],
  unlockedSceneIds: ['preloader', 'outside-station'],
  visitedSceneIds: [],
  notebookUnlocked: false,
  notebookCurrentSection: 1,
  notebookCurrentPage: 0,
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    reducedMotion: false,
    webglEnabled: true,
    cursorEnabled: true,
  },
}

/** The localStorage key where the save is stored */
export const SAVE_STORAGE_KEY = 'lth_save_v1'
