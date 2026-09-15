// ─────────────────────────────────────────────────────────────────────────────
// SceneManager
// Manages unlock state and scene access control.
// Scene transitions are delegated to TimelineDirector which owns all state.
// This manager only tracks which scenes are available to the player.
// ─────────────────────────────────────────────────────────────────────────────

import type { ActId, SceneId } from '@/types/scene'
import { timelineDirector } from '../TimelineDirector/TimelineDirector'

export interface SceneAccessState {
  unlockedScenes: Set<SceneId>
  visitedScenes: Set<SceneId>
}

type SceneAccessListener = (state: SceneAccessState) => void

export class SceneManager {
  private accessState: SceneAccessState = {
    unlockedScenes: new Set<SceneId>(['preloader', 'outside-station']),
    visitedScenes: new Set<SceneId>(),
  }

  private listeners: Set<SceneAccessListener> = new Set()
  private unsubscribeTimeline: (() => void) | null = null

  init(): void {
    // Track visited scenes as TimelineDirector transitions
    this.unsubscribeTimeline = timelineDirector.subscribe((timeline) => {
      if (!timeline.isTransitioning) {
        const visited = new Set(this.accessState.visitedScenes)
        visited.add(timeline.currentScene)
        this.accessState = { ...this.accessState, visitedScenes: visited }
        this.notify()
      }
    })
  }

  // ── Scene access ──────────────────────────────────────────────────────────

  isUnlocked(sceneId: SceneId): boolean {
    return this.accessState.unlockedScenes.has(sceneId)
  }

  isVisited(sceneId: SceneId): boolean {
    return this.accessState.visitedScenes.has(sceneId)
  }

  unlockScene(sceneId: SceneId): void {
    if (this.accessState.unlockedScenes.has(sceneId)) return
    const updated = new Set(this.accessState.unlockedScenes)
    updated.add(sceneId)
    this.accessState = { ...this.accessState, unlockedScenes: updated }
    this.notify()
  }

  restoreUnlockedScenes(sceneIds: SceneId[]): void {
    const updated = new Set(this.accessState.unlockedScenes)
    sceneIds.forEach((id) => updated.add(id))
    this.accessState = { ...this.accessState, unlockedScenes: updated }
    this.notify()
  }

  restoreVisitedScenes(sceneIds: SceneId[]): void {
    const updated = new Set(this.accessState.visitedScenes)
    sceneIds.forEach((id) => updated.add(id))
    this.accessState = { ...this.accessState, visitedScenes: updated }
    this.notify()
  }

  // ── Transition delegation ─────────────────────────────────────────────────

  /**
   * Transition to a scene, unlocking it first.
   * Scenes are only ever offered via the hand-authored adjacency graph in each
   * scene's own UI (doors/corridors), so reaching for a transition is itself
   * the signal that the destination should become accessible.
   */
  transitionTo(sceneId: SceneId, durationMs?: number): void {
    this.unlockScene(sceneId)
    timelineDirector.transitionTo(sceneId, durationMs)
  }

  /** Snap immediately — used for save restore */
  restoreScene(sceneId: SceneId): void {
    timelineDirector.snapTo(sceneId)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getCurrentScene(): SceneId {
    return timelineDirector.getState().currentScene
  }

  getCurrentAct(): ActId {
    return timelineDirector.getState().currentAct
  }

  getAccessState(): Readonly<SceneAccessState> {
    return this.accessState
  }

  subscribe(fn: SceneAccessListener): () => void {
    this.listeners.add(fn)
    fn(this.accessState)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    this.unsubscribeTimeline?.()
    this.listeners.clear()
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.accessState))
  }
}

export const sceneManager = new SceneManager()
