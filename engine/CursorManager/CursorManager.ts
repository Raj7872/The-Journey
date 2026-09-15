// ─────────────────────────────────────────────────────────────────────────────
// CursorManager
// Manages the custom lantern cursor state machine.
// The cursor never draws attention to itself — it responds subtly.
// ─────────────────────────────────────────────────────────────────────────────

import type { CursorManagerState, CursorPosition, CursorState } from '@/types/cursor'

type CursorListener = (state: CursorManagerState) => void

export class CursorManager {
  private state: CursorManagerState = {
    state: 'default',
    position: { x: 0, y: 0 },
    isVisible: false,
    isEnabled: true,
  }

  private listeners: Set<CursorListener> = new Set()
  private moveHandler: ((e: MouseEvent) => void) | null = null
  private enterHandler: (() => void) | null = null
  private leaveHandler: (() => void) | null = null

  init(enabled: boolean): void {
    this.state = { ...this.state, isEnabled: enabled }

    if (!enabled || typeof window === 'undefined') return

    // Native cursor stays visible until we actually know where the mouse is —
    // otherwise there's a gap right on load where neither the native cursor
    // (hidden) nor the custom one (no position yet) is visible.

    this.moveHandler = (e: MouseEvent) => {
      document.documentElement.style.cursor = 'none'
      this.updatePosition({ x: e.clientX, y: e.clientY })
    }

    this.enterHandler = () => {
      this.state = { ...this.state, isVisible: true }
      this.notify()
    }

    this.leaveHandler = () => {
      this.state = { ...this.state, isVisible: false }
      document.documentElement.style.cursor = ''
      this.notify()
    }

    window.addEventListener('mousemove', this.moveHandler, { passive: true })
    document.addEventListener('mouseenter', this.enterHandler)
    document.addEventListener('mouseleave', this.leaveHandler)

    this.notify()
  }

  setCursorState(cursorState: CursorState): void {
    if (this.state.state === cursorState) return
    this.state = { ...this.state, state: cursorState }
    this.notify()
  }

  getState(): Readonly<CursorManagerState> {
    return this.state
  }

  subscribe(fn: CursorListener): () => void {
    this.listeners.add(fn)
    fn(this.state)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    if (typeof window === 'undefined') return
    document.documentElement.style.cursor = ''

    if (this.moveHandler) window.removeEventListener('mousemove', this.moveHandler)
    if (this.enterHandler) document.removeEventListener('mouseenter', this.enterHandler)
    if (this.leaveHandler) document.removeEventListener('mouseleave', this.leaveHandler)

    this.listeners.clear()
  }

  private updatePosition(position: CursorPosition): void {
    this.state = { ...this.state, position, isVisible: true }
    this.notify()
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.state))
  }
}

export const cursorManager = new CursorManager()
