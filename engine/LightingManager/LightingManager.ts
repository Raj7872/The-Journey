// ─────────────────────────────────────────────────────────────────────────────
// LightingManager
// Subscribes to TimelineDirector and writes CSS variables to :root.
// Does not compute lighting values — all values come from TimelineDirector.
// ─────────────────────────────────────────────────────────────────────────────

import type { LightingProfile } from '@/types/timeline'
import { lerp } from '@/lib/utils/math'
import { timelineDirector } from '../TimelineDirector/TimelineDirector'

export type { LightingProfile }

export interface LightingState extends LightingProfile {
  lampColor: string   // Computed warm/cold interpolated lamp color
}

// Cold blue → warm gold
const COLD = { r: 130, g: 155, b: 210 }
const WARM = { r: 212, g: 132, b: 58 }

function computeLampColor(warmth: number): string {
  const r = Math.round(lerp(COLD.r, WARM.r, warmth))
  const g = Math.round(lerp(COLD.g, WARM.g, warmth))
  const b = Math.round(lerp(COLD.b, WARM.b, warmth))
  return `rgb(${r},${g},${b})`
}

type LightingListener = (state: LightingState) => void

export class LightingManager {
  private state: LightingState
  private listeners: Set<LightingListener> = new Set()
  private unsubscribe: (() => void) | null = null

  constructor() {
    const initial = timelineDirector.getState().lightingProfile
    this.state = { ...initial, lampColor: computeLampColor(initial.warmth) }
  }

  init(): void {
    this.unsubscribe = timelineDirector.subscribe((timeline) => {
      const lp = timeline.lightingProfile
      this.state = { ...lp, lampColor: computeLampColor(lp.warmth) }
      this.applyCSSVars()
      this.notify()
    })
    this.applyCSSVars()
  }

  getState(): Readonly<LightingState> {
    return this.state
  }

  subscribe(fn: LightingListener): () => void {
    this.listeners.add(fn)
    fn(this.state)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    this.unsubscribe?.()
    this.listeners.clear()
  }

  private applyCSSVars(): void {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.style.setProperty('--light-warmth', this.state.warmth.toString())
    root.style.setProperty('--light-brightness', this.state.brightness.toString())
    root.style.setProperty('--light-bloom', this.state.bloomIntensity.toString())
    root.style.setProperty('--light-lamp-color', this.state.lampColor)
    root.style.setProperty('--light-ambient', this.state.ambientColor)
    root.style.setProperty('--light-source', this.state.lightSourceColor)
    root.style.setProperty('--world-filter', this.state.worldFilter)
    root.style.setProperty('--light-has-sunrays', this.state.hasSunrays ? '1' : '0')
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.state))
  }
}

export const lightingManager = new LightingManager()
