// ─────────────────────────────────────────────────────────────────────────────
// AnimationManager
// Central registry for animation state across the experience.
// Provides respects prefers-reduced-motion.
// Components query this before running animations.
// ─────────────────────────────────────────────────────────────────────────────

export interface AnimationManagerState {
  reducedMotion: boolean
  /** Global animation multiplier — 0 disables all, 1 is full */
  globalSpeedMultiplier: number
}

type AnimationListener = (state: AnimationManagerState) => void

export class AnimationManager {
  private state: AnimationManagerState = {
    reducedMotion: false,
    globalSpeedMultiplier: 1,
  }

  private listeners: Set<AnimationListener> = new Set()
  private motionQuery: MediaQueryList | null = null
  private motionHandler: ((e: MediaQueryListEvent) => void) | null = null

  init(reducedMotionOverride?: boolean): void {
    if (typeof window === 'undefined') return

    if (reducedMotionOverride !== undefined) {
      this.state = { ...this.state, reducedMotion: reducedMotionOverride }
      this.notify()
      return
    }

    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.state = { ...this.state, reducedMotion: this.motionQuery.matches }

    this.motionHandler = (e: MediaQueryListEvent) => {
      this.state = { ...this.state, reducedMotion: e.matches }
      this.notify()
    }

    this.motionQuery.addEventListener('change', this.motionHandler)
    this.notify()
  }

  /** Get a duration, respecting reduced motion preference */
  duration(ms: number): number {
    if (this.state.reducedMotion) return 0
    return ms * this.state.globalSpeedMultiplier
  }

  /** Check if animations should run */
  shouldAnimate(): boolean {
    return !this.state.reducedMotion && this.state.globalSpeedMultiplier > 0
  }

  setReducedMotion(value: boolean): void {
    this.state = { ...this.state, reducedMotion: value }
    this.notify()
  }

  getState(): Readonly<AnimationManagerState> {
    return this.state
  }

  subscribe(fn: AnimationListener): () => void {
    this.listeners.add(fn)
    fn(this.state)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    if (this.motionQuery && this.motionHandler) {
      this.motionQuery.removeEventListener('change', this.motionHandler)
    }
    this.listeners.clear()
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.state))
  }
}

export const animationManager = new AnimationManager()
