// ─────────────────────────────────────────────────────────────────────────────
// CameraManager
// Drives the CSS-transform-based camera system.
// The "camera" is a div wrapper that transforms to simulate movement.
// Movement is always eased — never robotic, never instant.
// Includes a subtle ambient float that makes the world feel alive.
// ─────────────────────────────────────────────────────────────────────────────

import type { SceneId } from '@/types/scene'
import { TIMING } from '@/lib/constants/timing'
import { easeInOutCubic } from '@/lib/utils/math'

export interface CameraTransform {
  translateX: number   // px
  translateY: number   // px
  scale: number
  rotateZ: number      // degrees — very subtle only
}

export interface CameraState {
  current: CameraTransform
  target: CameraTransform
  isMoving: boolean
  floatOffset: number  // Current ambient float offset in px
}

// Per-scene camera presets
const CAMERA_PRESETS: Record<SceneId, CameraTransform> = {
  preloader:          { translateX: 0,    translateY: 0,   scale: 1.0,  rotateZ: 0 },
  'outside-station':  { translateX: 0,    translateY: 0,   scale: 1.0,  rotateZ: 0 },
  credits:            { translateX: 0,    translateY: -120, scale: 0.85, rotateZ: 0 },
  'entrance-hall':    { translateX: 0,    translateY: -20, scale: 1.02, rotateZ: 0 },
  'main-hall':        { translateX: 0,    translateY: -40, scale: 1.0,  rotateZ: 0 },
  'platform-one':     { translateX: -60,  translateY: 20,  scale: 1.05, rotateZ: 0.2 },
  'platform-cafe':    { translateX: 80,   translateY: 30,  scale: 1.08, rotateZ: -0.1 },
  'memory-tunnel':    { translateX: 0,    translateY: 10,  scale: 1.0,  rotateZ: 0 },
  'waiting-room':     { translateX: 40,   translateY: -10, scale: 1.03, rotateZ: 0 },
  'platform-eleven':  { translateX: -30,  translateY: 50,  scale: 1.0,  rotateZ: 0 },
  'train-arrival':    { translateX: 0,    translateY: 60,  scale: 0.98, rotateZ: 0 },
  'train-interior':   { translateX: 0,    translateY: -30, scale: 1.1,  rotateZ: 0 },
  'final-carriage':   { translateX: 0,    translateY: -20, scale: 1.12, rotateZ: 0 },
  'the-field':        { translateX: 0,    translateY: 0,   scale: 0.95, rotateZ: 0 },
  'the-bench':        { translateX: 0,    translateY: 20,  scale: 1.05, rotateZ: 0 },
  'the-gift':         { translateX: 0,    translateY: 30,  scale: 1.15, rotateZ: 0 },
  'the-silence':      { translateX: 0,    translateY: 0,   scale: 0.95, rotateZ: 0 },
  'the-question':     { translateX: 0,    translateY: 0,   scale: 1.0,  rotateZ: 0 },
  'world-changes':    { translateX: 0,    translateY: -80, scale: 0.9,  rotateZ: 0 },
  'secret-ending':    { translateX: 0,    translateY: 20,  scale: 1.05, rotateZ: 0 },
}

type CameraListener = (state: CameraState) => void

export class CameraManager {
  private state: CameraState = {
    current: { translateX: 0, translateY: 0, scale: 1, rotateZ: 0 },
    target: { translateX: 0, translateY: 0, scale: 1, rotateZ: 0 },
    isMoving: false,
    floatOffset: 0,
  }

  private listeners: Set<CameraListener> = new Set()
  private animFrame: number | null = null
  private moveStart: number | null = null
  private moveDuration: number = TIMING.CAMERA_TRANSITION
  private fromTransform: CameraTransform = { translateX: 0, translateY: 0, scale: 1, rotateZ: 0 }
  private floatStart: number = 0

  init(): void {
    this.startFloatAnimation()
  }

  /** Move camera to a scene preset */
  moveToScene(sceneId: SceneId, duration?: number): void {
    const preset = CAMERA_PRESETS[sceneId]
    if (!preset) return
    const ms: number = duration ?? TIMING.CAMERA_TRANSITION
    this.moveTo(preset, ms)
  }

  /** Move camera to an arbitrary transform */
  moveTo(target: CameraTransform, duration: number = TIMING.CAMERA_TRANSITION): void {
    this.fromTransform = { ...this.state.current }
    this.state = { ...this.state, target, isMoving: true }
    this.moveDuration = duration
    this.moveStart = null

    if (this.animFrame !== null) cancelAnimationFrame(this.animFrame)
    this.animateMove()
  }

  /** Instantly snap camera (save restore, no transition) */
  snapToScene(sceneId: SceneId): void {
    const preset = CAMERA_PRESETS[sceneId]
    if (!preset) return
    this.state = {
      ...this.state,
      current: { ...preset },
      target: { ...preset },
      isMoving: false,
    }
    this.notify()
  }

  getState(): Readonly<CameraState> {
    return this.state
  }

  /** Get CSS transform string for the world container */
  getTransformString(): string {
    const { current, floatOffset } = this.state
    return [
      `translateX(${current.translateX}px)`,
      `translateY(${current.translateY + floatOffset}px)`,
      `scale(${current.scale})`,
      `rotateZ(${current.rotateZ}deg)`,
    ].join(' ')
  }

  subscribe(fn: CameraListener): () => void {
    this.listeners.add(fn)
    fn(this.state)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    if (this.animFrame !== null) cancelAnimationFrame(this.animFrame)
    this.listeners.clear()
  }

  private animateMove(): void {
    const tick = (timestamp: number) => {
      if (this.moveStart === null) this.moveStart = timestamp
      const elapsed = timestamp - this.moveStart
      const rawT = Math.min(elapsed / this.moveDuration, 1)
      const t = easeInOutCubic(rawT)

      this.state = {
        ...this.state,
        current: {
          translateX: this.fromTransform.translateX + (this.state.target.translateX - this.fromTransform.translateX) * t,
          translateY: this.fromTransform.translateY + (this.state.target.translateY - this.fromTransform.translateY) * t,
          scale: this.fromTransform.scale + (this.state.target.scale - this.fromTransform.scale) * t,
          rotateZ: this.fromTransform.rotateZ + (this.state.target.rotateZ - this.fromTransform.rotateZ) * t,
        },
        isMoving: rawT < 1,
      }

      this.notify()

      if (rawT < 1) {
        this.animFrame = requestAnimationFrame(tick)
      } else {
        this.animFrame = null
        this.moveStart = null
        this.startFloatAnimation()
      }
    }

    this.animFrame = requestAnimationFrame(tick)
  }

  private startFloatAnimation(): void {
    this.floatStart = performance.now()
    const floatTick = (timestamp: number) => {
      if (this.state.isMoving) return
      const elapsed = (timestamp - this.floatStart) / TIMING.CAMERA_FLOAT_PERIOD
      const floatOffset = Math.sin(elapsed * Math.PI * 2) * TIMING.CAMERA_FLOAT_AMPLITUDE
      this.state = { ...this.state, floatOffset }
      this.notify()
      this.animFrame = requestAnimationFrame(floatTick)
    }
    this.animFrame = requestAnimationFrame(floatTick)
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.state))
  }
}

export const cameraManager = new CameraManager()
