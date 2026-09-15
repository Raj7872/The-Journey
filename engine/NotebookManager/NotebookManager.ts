// ─────────────────────────────────────────────────────────────────────────────
// NotebookManager
// Tracks collected memories, manages notebook open/close state,
// and drives the notebook UI's page and section navigation.
// The notebook fills itself — players never manage inventory.
// ─────────────────────────────────────────────────────────────────────────────

import type { Memory, MemoryCategory, CollectionState } from '@/types/memory'
import type { NotebookState } from '@/types/notebook'
import { TIMING } from '@/lib/constants/timing'
import { HIDDEN_LETTER_UNLOCK_MAP } from '@/content/memories/hidden/unlockMap'
import { saveManager } from '../SaveManager/SaveManager'

type NotebookListener = (state: NotebookState) => void
type CollectionListener = (state: CollectionState) => void

export class NotebookManager {
  private notebookState: NotebookState = {
    isUnlocked: false,
    isOpen: false,
    isAnimating: false,
    currentSection: 1,
    currentPage: 0,
    isFinalLetterUnlocked: false,
    totalPagesUnlocked: 0,
    isGlowing: false,
  }

  private collectionState: CollectionState = {
    collectedIds: new Set<string>(),
    totalCollected: 0,
    totalAvailable: 0,
    byCategory: {
      letter: 0,
      postcard: 0,
      ticket: 0,
      polaroid: 0,
      receipt: 0,
      flower: 0,
      doodle: 0,
      bookmark: 0,
      cassette: 0,
      'final-letter': 0,
      'hidden-letter': 0,
    },
    isComplete: false,
  }

  private allMemories: Memory[] = []
  private notebookListeners: Set<NotebookListener> = new Set()
  private collectionListeners: Set<CollectionListener> = new Set()
  private glowTimer: ReturnType<typeof setTimeout> | null = null

  // ── Initialization ────────────────────────────────────────────────────────

  /** Register all memories — called at app startup with content data */
  registerMemories(memories: Memory[]): void {
    this.allMemories = memories
    this.collectionState = {
      ...this.collectionState,
      totalAvailable: memories.filter((m) => m.category !== 'final-letter').length,
    }
    this.notifyCollection()
  }

  /** Restore collected state from save */
  hydrate(
    collectedIds: string[],
    notebookUnlocked: boolean,
    currentSection = 1,
    currentPage = 0
  ): void {
    const idSet = new Set(collectedIds)
    const byCategory = { ...this.collectionState.byCategory }

    collectedIds.forEach((id) => {
      const memory = this.allMemories.find((m) => m.id === id)
      if (memory) byCategory[memory.category] = (byCategory[memory.category] ?? 0) + 1
    })

    this.collectionState = {
      collectedIds: idSet,
      totalCollected: collectedIds.length,
      totalAvailable: this.collectionState.totalAvailable,
      byCategory,
      isComplete: this.checkIsComplete(idSet),
    }

    this.notebookState = {
      ...this.notebookState,
      isUnlocked: notebookUnlocked,
      currentSection,
      currentPage,
      totalPagesUnlocked: collectedIds.length,
      isFinalLetterUnlocked: this.checkIsComplete(idSet),
    }

    this.notifyCollection()
    this.notifyNotebook()
  }

  // ── Collection ────────────────────────────────────────────────────────────

  /** Collect a memory — called when player interacts with a collectible */
  collect(memory: Memory): void {
    if (this.collectionState.collectedIds.has(memory.id)) return

    const newIds = new Set(this.collectionState.collectedIds)
    newIds.add(memory.id)

    const newByCategory = { ...this.collectionState.byCategory }
    newByCategory[memory.category] = (newByCategory[memory.category] ?? 0) + 1

    // Every real collectible quietly grants a handful of hidden letters —
    // no reveal popup, no sfx, they just appear in the notebook's Hidden
    // section for her to find on her own.
    const grantedHiddenIds = HIDDEN_LETTER_UNLOCK_MAP[memory.id] ?? []
    for (const hiddenId of grantedHiddenIds) {
      if (newIds.has(hiddenId)) continue
      newIds.add(hiddenId)
      newByCategory['hidden-letter'] = (newByCategory['hidden-letter'] ?? 0) + 1
    }

    const isComplete = this.checkIsComplete(newIds)

    this.collectionState = {
      collectedIds: newIds,
      totalCollected: newIds.size,
      totalAvailable: this.collectionState.totalAvailable,
      byCategory: newByCategory,
      isComplete,
    }

    // Finding the first memory is finding the notebook — nothing else in
    // normal play ever unlocks it otherwise.
    const wasUnlocked = this.notebookState.isUnlocked

    this.notebookState = {
      ...this.notebookState,
      isUnlocked: true,
      totalPagesUnlocked: newIds.size,
      isFinalLetterUnlocked: isComplete,
      isGlowing: true,
    }

    // Clear glow after animation
    if (this.glowTimer !== null) clearTimeout(this.glowTimer)
    this.glowTimer = setTimeout(() => {
      this.notebookState = { ...this.notebookState, isGlowing: false }
      this.notifyNotebook()
    }, TIMING.NOTEBOOK_GLOW)

    saveManager.collectMemory(memory.id)
    grantedHiddenIds.forEach((hiddenId) => saveManager.collectMemory(hiddenId))
    if (!wasUnlocked) saveManager.unlockNotebook()

    this.notifyCollection()
    this.notifyNotebook()
  }

  isCollected(memoryId: string): boolean {
    return this.collectionState.collectedIds.has(memoryId)
  }

  getCollectionState(): Readonly<CollectionState> {
    return this.collectionState
  }

  getCollectedMemories(): Memory[] {
    return this.allMemories.filter((m) =>
      this.collectionState.collectedIds.has(m.id)
    )
  }

  getMemoriesByCategory(category: MemoryCategory): Memory[] {
    return this.allMemories.filter((m) => m.category === category)
  }

  getCollectedByCategory(category: MemoryCategory): Memory[] {
    return this.allMemories.filter(
      (m) => m.category === category && this.collectionState.collectedIds.has(m.id)
    )
  }

  // ── Notebook UI State ─────────────────────────────────────────────────────

  open(): void {
    if (!this.notebookState.isUnlocked || this.notebookState.isAnimating) return
    this.notebookState = { ...this.notebookState, isOpen: true, isAnimating: true }
    this.notifyNotebook()

    setTimeout(() => {
      this.notebookState = { ...this.notebookState, isAnimating: false }
      this.notifyNotebook()
    }, TIMING.NOTEBOOK_OPEN)
  }

  close(): void {
    if (!this.notebookState.isOpen || this.notebookState.isAnimating) return
    this.notebookState = { ...this.notebookState, isAnimating: true }
    this.notifyNotebook()

    setTimeout(() => {
      this.notebookState = { ...this.notebookState, isOpen: false, isAnimating: false }
      this.notifyNotebook()
    }, TIMING.NOTEBOOK_CLOSE)
  }

  unlock(): void {
    this.notebookState = { ...this.notebookState, isUnlocked: true }
    saveManager.unlockNotebook()
    this.notifyNotebook()
  }

  goToSection(section: number): void {
    this.notebookState = { ...this.notebookState, currentSection: section, currentPage: 0 }
    saveManager.update({ notebookCurrentSection: section, notebookCurrentPage: 0 })
    this.notifyNotebook()
  }

  nextPage(): void {
    const currentPage = this.notebookState.currentPage + 1
    this.notebookState = { ...this.notebookState, currentPage }
    saveManager.update({ notebookCurrentPage: currentPage })
    this.notifyNotebook()
  }

  prevPage(): void {
    if (this.notebookState.currentPage <= 0) return
    const currentPage = this.notebookState.currentPage - 1
    this.notebookState = { ...this.notebookState, currentPage }
    saveManager.update({ notebookCurrentPage: currentPage })
    this.notifyNotebook()
  }

  getNotebookState(): Readonly<NotebookState> {
    return this.notebookState
  }

  /** Jump directly to a section/page — used by the debug panel. */
  jumpTo(section: number, page: number): void {
    this.notebookState = { ...this.notebookState, currentSection: section, currentPage: page }
    saveManager.update({ notebookCurrentSection: section, notebookCurrentPage: page })
    this.notifyNotebook()
  }

  /** Clear all collected memories and notebook position — used by the debug panel. */
  debugReset(): void {
    this.collectionState = {
      collectedIds: new Set<string>(),
      totalCollected: 0,
      totalAvailable: this.collectionState.totalAvailable,
      byCategory: {
        letter: 0, postcard: 0, ticket: 0, polaroid: 0, receipt: 0,
        flower: 0, doodle: 0, bookmark: 0, cassette: 0, 'final-letter': 0,
        'hidden-letter': 0,
      },
      isComplete: false,
    }
    this.notebookState = {
      ...this.notebookState,
      isOpen: false,
      currentSection: 1,
      currentPage: 0,
      totalPagesUnlocked: 0,
      isFinalLetterUnlocked: false,
    }
    saveManager.update({
      collectedMemoryIds: [],
      notebookCurrentSection: 1,
      notebookCurrentPage: 0,
    })
    this.notifyCollection()
    this.notifyNotebook()
  }

  // ── Subscriptions ─────────────────────────────────────────────────────────

  subscribeNotebook(fn: NotebookListener): () => void {
    this.notebookListeners.add(fn)
    fn(this.notebookState)
    return () => this.notebookListeners.delete(fn)
  }

  subscribeCollection(fn: CollectionListener): () => void {
    this.collectionListeners.add(fn)
    fn(this.collectionState)
    return () => this.collectionListeners.delete(fn)
  }

  dispose(): void {
    if (this.glowTimer !== null) clearTimeout(this.glowTimer)
    this.notebookListeners.clear()
    this.collectionListeners.clear()
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private checkIsComplete(ids: Set<string>): boolean {
    const nonFinalMemories = this.allMemories.filter((m) => m.category !== 'final-letter')
    return nonFinalMemories.every((m) => ids.has(m.id))
  }

  private notifyNotebook(): void {
    this.notebookListeners.forEach((fn) => fn(this.notebookState))
  }

  private notifyCollection(): void {
    this.collectionListeners.forEach((fn) => fn(this.collectionState))
  }
}

export const notebookManager = new NotebookManager()
