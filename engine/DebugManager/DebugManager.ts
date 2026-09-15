// ─────────────────────────────────────────────────────────────────────────────
// DebugManager
// Small shared flags the Debug Panel toggles that other systems need to read
// (interaction outlines, ambient events on/off). Dev-only by convention —
// nothing here is imported by anything that ships behavior to real players.
// ─────────────────────────────────────────────────────────────────────────────

export interface DebugState {
  showInteractionOutlines: boolean
  ambientEventsEnabled: boolean
  /** Train interior — freeze the sway/scenery-scroll animations */
  trainMovementPaused: boolean
  /** Train interior — scenery scroll speed multiplier for QA (1 = normal) */
  trainScenerySpeed: number
  /** Train interior — force the window permanently clear, condensation off */
  trainCondensationDisabled: boolean
  /** Bumped by triggerTrainArrivalReplay() — TrainArrival resets its clock when this changes */
  trainArrivalReplayToken: number
}

type DebugListener = (state: DebugState) => void

export class DebugManager {
  private state: DebugState = {
    showInteractionOutlines: false,
    ambientEventsEnabled: true,
    trainMovementPaused: false,
    trainScenerySpeed: 1,
    trainCondensationDisabled: false,
    trainArrivalReplayToken: 0,
  }

  private listeners: Set<DebugListener> = new Set()

  getState(): Readonly<DebugState> {
    return this.state
  }

  setShowInteractionOutlines(value: boolean): void {
    this.state = { ...this.state, showInteractionOutlines: value }
    this.notify()
  }

  setAmbientEventsEnabled(value: boolean): void {
    this.state = { ...this.state, ambientEventsEnabled: value }
    this.notify()
  }

  setTrainMovementPaused(value: boolean): void {
    this.state = { ...this.state, trainMovementPaused: value }
    this.notify()
  }

  setTrainScenerySpeed(value: number): void {
    this.state = { ...this.state, trainScenerySpeed: value }
    this.notify()
  }

  setTrainCondensationDisabled(value: boolean): void {
    this.state = { ...this.state, trainCondensationDisabled: value }
    this.notify()
  }

  triggerTrainArrivalReplay(): void {
    this.state = { ...this.state, trainArrivalReplayToken: this.state.trainArrivalReplayToken + 1 }
    this.notify()
  }

  subscribe(fn: DebugListener): () => void {
    this.listeners.add(fn)
    fn(this.state)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    this.listeners.clear()
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.state))
  }
}

export const debugManager = new DebugManager()
