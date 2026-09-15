// ─────────────────────────────────────────────────────────────────────────────
// WeatherManager
// Subscribes to TimelineDirector and exposes weatherState to React.
// Does not compute anything — all values come from TimelineDirector.
// ─────────────────────────────────────────────────────────────────────────────

import type { WeatherState } from '@/types/timeline'
import { timelineDirector } from '../TimelineDirector/TimelineDirector'

export type { WeatherState }

type WeatherListener = (state: WeatherState) => void

export class WeatherManager {
  private state: WeatherState = timelineDirector.getState().weatherState
  private listeners: Set<WeatherListener> = new Set()
  private unsubscribe: (() => void) | null = null

  init(): void {
    this.unsubscribe = timelineDirector.subscribe((timeline) => {
      this.state = timeline.weatherState
      this.notify()
    })
  }

  getState(): Readonly<WeatherState> {
    return this.state
  }

  subscribe(fn: WeatherListener): () => void {
    this.listeners.add(fn)
    fn(this.state)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    this.unsubscribe?.()
    this.listeners.clear()
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.state))
  }
}

export const weatherManager = new WeatherManager()
