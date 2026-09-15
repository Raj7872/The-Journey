'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import type { SaveSchema } from '@/types/save'
import { saveManager } from './SaveManager'

interface SaveContextValue {
  save: Readonly<SaveSchema>
  collectMemory: (id: string) => void
  unlockNotebook: () => void
  completeJourney: () => void
  updateSettings: (settings: Partial<SaveSchema['settings']>) => void
  resetJourney: () => void
}

const SaveContext = createContext<SaveContextValue | null>(null)

export function SaveProvider({ children }: { children: React.ReactNode }) {
  const [save, setSave] = useState<Readonly<SaveSchema>>(saveManager.getSave())

  useEffect(() => {
    const hasSave = saveManager.hydrate()
    if (!hasSave) {
      saveManager.persist()
    }
    const unsubscribe = saveManager.subscribe(setSave)
    return () => {
      unsubscribe()
      saveManager.persist()
    }
  }, [])

  return (
    <SaveContext.Provider
      value={{
        save,
        collectMemory: (id) => saveManager.collectMemory(id),
        unlockNotebook: () => saveManager.unlockNotebook(),
        completeJourney: () => saveManager.completeJourney(),
        updateSettings: (settings) =>
          saveManager.update({ settings: { ...save.settings, ...settings } }),
        resetJourney: () => saveManager.reset(),
      }}
    >
      {children}
    </SaveContext.Provider>
  )
}

export function useSave(): SaveContextValue {
  const ctx = useContext(SaveContext)
  if (!ctx) throw new Error('useSave must be used within a SaveProvider')
  return ctx
}
