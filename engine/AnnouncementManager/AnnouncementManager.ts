// ─────────────────────────────────────────────────────────────────────────────
// AnnouncementManager
// Subscribes to TimelineDirector for pool selection and frequency.
// Context-aware, non-repeating, never plays during protected scenes.
// ─────────────────────────────────────────────────────────────────────────────

import { randomExcluding } from '@/lib/utils/array'
import { TIMING } from '@/lib/constants/timing'
import { timelineDirector } from '../TimelineDirector/TimelineDirector'

export interface Announcement {
  id: string
  text: string
  pool: string
}

type AnnouncementListener = (announcement: Announcement | null) => void

export class AnnouncementManager {
  private pools: Map<string, Announcement[]> = new Map()
  private recentIds: Map<string, string[]> = new Map()
  private current: Announcement | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private clearTimer: ReturnType<typeof setTimeout> | null = null
  private listeners: Set<AnnouncementListener> = new Set()
  private unsubscribeTimeline: (() => void) | null = null
  private activePool = 'none'
  private activeIntervalMs = 0
  private isActive = false

  registerPool(poolKey: string, announcements: Announcement[]): void {
    this.pools.set(poolKey, announcements)
    this.recentIds.set(poolKey, [])
  }

  init(): void {
    this.isActive = true
    this.unsubscribeTimeline = timelineDirector.subscribe((timeline) => {
      const { announcementPool, announcementIntervalMs } = timeline.ambienceProfile
      if (announcementPool !== this.activePool || announcementIntervalMs !== this.activeIntervalMs) {
        this.activePool = announcementPool
        this.activeIntervalMs = announcementIntervalMs
        this.reschedule()
      }
    })
  }

  triggerImmediate(poolKey: string): void {
    const ann = this.pickFrom(poolKey)
    if (ann) this.play(ann)
  }

  getCurrent(): Announcement | null {
    return this.current
  }

  subscribe(fn: AnnouncementListener): () => void {
    this.listeners.add(fn)
    fn(this.current)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    this.isActive = false
    if (this.timer) clearTimeout(this.timer)
    if (this.clearTimer) clearTimeout(this.clearTimer)
    this.unsubscribeTimeline?.()
    this.listeners.clear()
  }

  private reschedule(): void {
    if (this.timer) clearTimeout(this.timer)
    if (this.activeIntervalMs <= 0 || this.activePool === 'none') return

    const jitter = (Math.random() - 0.5) * 15_000
    const delay = Math.max(TIMING.ANNOUNCEMENT_MIN_GAP, this.activeIntervalMs + jitter)

    this.timer = setTimeout(() => {
      if (!this.isActive) return
      const ann = this.pickFrom(this.activePool)
      if (ann) this.play(ann)
      this.reschedule()
    }, delay)
  }

  private pickFrom(poolKey: string): Announcement | null {
    const pool = this.pools.get(poolKey)
    if (!pool?.length) return null

    const recent = this.recentIds.get(poolKey) ?? []
    const recentItems = recent
      .map((id) => pool.find((a) => a.id === id))
      .filter((a): a is Announcement => a !== undefined)

    const picked = randomExcluding(pool, recentItems)
    if (!picked) return null

    const maxRecent = Math.ceil(pool.length / 2)
    this.recentIds.set(poolKey, [...recent, picked.id].slice(-maxRecent))
    return picked
  }

  private play(ann: Announcement): void {
    this.current = ann
    this.notify()
    if (this.clearTimer) clearTimeout(this.clearTimer)
    this.clearTimer = setTimeout(() => {
      this.current = null
      this.notify()
    }, 8000)
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.current))
  }
}

export const announcementManager = new AnnouncementManager()
