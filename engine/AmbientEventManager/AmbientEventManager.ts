// ─────────────────────────────────────────────────────────────────────────────
// AmbientEventManager
// Random, non-repeating environmental flourishes per scene — a cat walking
// through, leaves drifting, a lamp swaying. Modeled directly on
// AnnouncementManager's pattern (context-aware pool, jittered reschedule,
// no-immediate-repeat selection) so the two systems behave consistently.
//
// Steam rising from a coffee cup and rain-window droplets are deliberately
// NOT modeled as discrete events here — they're continuous ambient details
// owned by the objects themselves (SteamWisp, RainWindow), not one-off
// triggers. PA announcements stay AnnouncementManager's job.
// ─────────────────────────────────────────────────────────────────────────────

import type { SceneId } from '@/types/scene'
import { TIMING } from '@/lib/constants/timing'
import { randomBetween } from '@/lib/utils/math'
import { randomExcluding } from '@/lib/utils/array'
import { timelineDirector } from '../TimelineDirector/TimelineDirector'

export type AmbientEventType =
  | 'lamp-sway'
  | 'cat-walk'
  | 'newspaper-flutter'
  | 'leaves-drift'
  | 'train-horn'
  | 'pigeons-fly'

export interface AmbientEvent {
  type: AmbientEventType
  id: string
}

type AmbientEventListener = (event: AmbientEvent | null) => void

export class AmbientEventManager {
  private pools: Map<SceneId, AmbientEventType[]> = new Map()
  private recentTypes: Map<SceneId, AmbientEventType[]> = new Map()
  private current: AmbientEvent | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private clearTimer: ReturnType<typeof setTimeout> | null = null
  private listeners: Set<AmbientEventListener> = new Set()
  private unsubscribeTimeline: (() => void) | null = null
  private activeScene: SceneId | null = null
  private enabled = true
  private nextId = 0

  registerPool(scene: SceneId, types: AmbientEventType[]): void {
    this.pools.set(scene, types)
    this.recentTypes.set(scene, [])
  }

  init(): void {
    this.unsubscribeTimeline = timelineDirector.subscribe((timeline) => {
      if (timeline.isTransitioning) return
      if (timeline.currentScene !== this.activeScene) {
        this.activeScene = timeline.currentScene
        this.reschedule()
      }
    })
  }

  setEnabled(value: boolean): void {
    this.enabled = value
    if (!value) {
      if (this.timer) clearTimeout(this.timer)
      if (this.clearTimer) clearTimeout(this.clearTimer)
      this.current = null
      this.notify()
    } else {
      this.reschedule()
    }
  }

  isEnabled(): boolean {
    return this.enabled
  }

  getCurrent(): AmbientEvent | null {
    return this.current
  }

  /** Force a specific event now — used by the debug panel. */
  triggerNow(type: AmbientEventType): void {
    this.play(type)
  }

  subscribe(fn: AmbientEventListener): () => void {
    this.listeners.add(fn)
    fn(this.current)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer)
    if (this.clearTimer) clearTimeout(this.clearTimer)
    this.unsubscribeTimeline?.()
    this.listeners.clear()
  }

  private reschedule(): void {
    if (this.timer) clearTimeout(this.timer)
    if (!this.enabled) return

    const pool = this.activeScene ? this.pools.get(this.activeScene) : undefined
    if (!pool?.length) return

    const delay = randomBetween(TIMING.AMBIENT_EVENT_MIN_GAP, TIMING.AMBIENT_EVENT_MAX_GAP)
    this.timer = setTimeout(() => {
      this.triggerFromPool()
      this.reschedule()
    }, delay)
  }

  private triggerFromPool(): void {
    if (!this.activeScene) return
    const pool = this.pools.get(this.activeScene)
    if (!pool?.length) return

    const recent = this.recentTypes.get(this.activeScene) ?? []
    const type = randomExcluding(pool, recent)
    if (!type) return

    const maxRecent = Math.ceil(pool.length / 2)
    this.recentTypes.set(this.activeScene, [...recent, type].slice(-maxRecent))
    this.play(type)
  }

  private play(type: AmbientEventType): void {
    this.nextId++
    this.current = { type, id: `ambient-${this.nextId}` }
    this.notify()

    if (this.clearTimer) clearTimeout(this.clearTimer)
    this.clearTimer = setTimeout(() => {
      this.current = null
      this.notify()
    }, TIMING.AMBIENT_EVENT_DURATION)
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.current))
  }
}

export const ambientEventManager = new AmbientEventManager()
