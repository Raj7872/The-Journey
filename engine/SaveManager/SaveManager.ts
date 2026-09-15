// ─────────────────────────────────────────────────────────────────────────────
// SaveManager
// Reads and writes the player's journey state to localStorage.
// Handles schema versioning so future updates never corrupt existing saves.
// Auto-saves after every significant action.
// ─────────────────────────────────────────────────────────────────────────────

import type { SaveSchema, SaveSchemaVersion } from '@/types/save'
import { CURRENT_SAVE_VERSION, DEFAULT_SAVE, SAVE_STORAGE_KEY } from '@/types/save'
import { readStorage, removeStorage, writeStorage } from '@/lib/utils/storage'

type SaveListener = (save: SaveSchema) => void

// Migration functions — add new ones when schema version bumps
const MIGRATIONS: Record<string, (old: unknown) => SaveSchema> = {
  // Example: '0.9→1.0': (old) => ({ ...DEFAULT_SAVE, ...migratedFields })
}

export class SaveManager {
  private currentSave: SaveSchema = { ...DEFAULT_SAVE }
  private listeners: Set<SaveListener> = new Set()
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private readonly DEBOUNCE_MS = 500

  // ── Initialization ────────────────────────────────────────────────────────

  /** Load save from storage. Returns whether an existing save was found. */
  hydrate(): boolean {
    const raw = readStorage<SaveSchema>(SAVE_STORAGE_KEY)
    if (!raw) {
      this.currentSave = { ...DEFAULT_SAVE, savedAt: Date.now() }
      return false
    }

    const migrated = this.migrate(raw)
    this.currentSave = migrated
    return true
  }

  // ── Read ─────────────────────────────────────────────────────────────────

  getSave(): Readonly<SaveSchema> {
    return this.currentSave
  }

  isJourneyCompleted(): boolean {
    return this.currentSave.journeyCompleted
  }

  isNewJourney(): boolean {
    return this.currentSave.savedAt === 0
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  /** Update the save with a partial patch and persist */
  update(patch: Partial<SaveSchema>): void {
    this.currentSave = {
      ...this.currentSave,
      ...patch,
      savedAt: Date.now(),
    }
    this.debouncedPersist()
    this.notify()
  }

  /** Collect a memory — adds to the collected IDs list */
  collectMemory(memoryId: string): void {
    if (this.currentSave.collectedMemoryIds.includes(memoryId)) return
    this.update({
      collectedMemoryIds: [...this.currentSave.collectedMemoryIds, memoryId],
    })
  }

  /** Mark a memory as discovered (seen but not collected) */
  discoverMemory(memoryId: string): void {
    if (this.currentSave.discoveredMemoryIds.includes(memoryId)) return
    this.update({
      discoveredMemoryIds: [...this.currentSave.discoveredMemoryIds, memoryId],
    })
  }

  /** Unlock the notebook */
  unlockNotebook(): void {
    if (this.currentSave.notebookUnlocked) return
    this.update({ notebookUnlocked: true })
  }

  /** Mark the journey as completed */
  completeJourney(): void {
    this.update({
      journeyCompleted: true,
      completedAt: Date.now(),
    })
  }

  /** Reset all progress — for "restart journey" in settings */
  reset(): void {
    removeStorage(SAVE_STORAGE_KEY)
    this.currentSave = { ...DEFAULT_SAVE, savedAt: Date.now() }
    this.notify()
  }

  /** Force immediate persist (bypass debounce) */
  persist(): boolean {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
    return writeStorage(SAVE_STORAGE_KEY, this.currentSave)
  }

  // ── Subscriptions ─────────────────────────────────────────────────────────

  subscribe(fn: SaveListener): () => void {
    this.listeners.add(fn)
    fn(this.currentSave)
    return () => this.listeners.delete(fn)
  }

  dispose(): void {
    if (this.saveTimeout !== null) clearTimeout(this.saveTimeout)
    this.listeners.clear()
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private debouncedPersist(): void {
    if (this.saveTimeout !== null) clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      writeStorage(SAVE_STORAGE_KEY, this.currentSave)
      this.saveTimeout = null
    }, this.DEBOUNCE_MS)
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.currentSave))
  }

  private migrate(raw: unknown): SaveSchema {
    const rawObj = raw as { version?: SaveSchemaVersion }
    const version = rawObj?.version

    // Already current version — no migration needed
    if (version === CURRENT_SAVE_VERSION) {
      return raw as SaveSchema
    }

    // Attempt migration
    const migrationKey = `${version ?? 'unknown'}→${CURRENT_SAVE_VERSION}`
    const migrator = MIGRATIONS[migrationKey]

    if (migrator) {
      console.warn(`[SaveManager] Migrating save: ${migrationKey}`)
      return migrator(raw)
    }

    // Unknown version — reset to defaults but preserve settings if possible
    console.warn(`[SaveManager] Unknown save version "${version}" — resetting to defaults`)
    const rawWithSettings = raw as { settings?: SaveSchema['settings'] }
    return {
      ...DEFAULT_SAVE,
      savedAt: Date.now(),
      settings: rawWithSettings?.settings ?? DEFAULT_SAVE.settings,
    }
  }
}

// Singleton
export const saveManager = new SaveManager()
