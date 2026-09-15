'use client'

import { createContext, useCallback, useContext, useState } from 'react'

import type { Memory } from '@/types/memory'

interface MemoryRevealContextValue {
  revealedMemory: Memory | null
  reveal: (memory: Memory) => void
  dismiss: () => void
}

const MemoryRevealContext = createContext<MemoryRevealContextValue | null>(null)

/**
 * Ephemeral UI-only state for "a memory was just found in the world."
 * Deliberately separate from NotebookManager's collection state — collecting
 * (persisted, engine-level) and revealing (transient, this session's UI)
 * are different concerns. Debug-panel "simulate collection" calls collect()
 * directly without going through this, so it doesn't pop up a reveal per item.
 */
export function MemoryRevealProvider({ children }: { children: React.ReactNode }) {
  const [revealedMemory, setRevealedMemory] = useState<Memory | null>(null)

  const reveal = useCallback((memory: Memory) => setRevealedMemory(memory), [])
  const dismiss = useCallback(() => setRevealedMemory(null), [])

  return (
    <MemoryRevealContext.Provider value={{ revealedMemory, reveal, dismiss }}>
      {children}
    </MemoryRevealContext.Provider>
  )
}

export function useMemoryReveal(): MemoryRevealContextValue {
  const ctx = useContext(MemoryRevealContext)
  if (!ctx) throw new Error('useMemoryReveal must be used within a MemoryRevealProvider')
  return ctx
}
