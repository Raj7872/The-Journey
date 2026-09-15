'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import type { DebugState } from './DebugManager'
import { debugManager } from './DebugManager'

interface DebugContextValue {
  debugState: DebugState
  setShowInteractionOutlines: (value: boolean) => void
  setAmbientEventsEnabled: (value: boolean) => void
  setTrainMovementPaused: (value: boolean) => void
  setTrainScenerySpeed: (value: number) => void
  setTrainCondensationDisabled: (value: boolean) => void
  triggerTrainArrivalReplay: () => void
}

const DebugContext = createContext<DebugContextValue | null>(null)

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [debugState, setDebugState] = useState<DebugState>(debugManager.getState())

  useEffect(() => {
    const unsubscribe = debugManager.subscribe(setDebugState)
    return () => {
      unsubscribe()
      debugManager.dispose()
    }
  }, [])

  return (
    <DebugContext.Provider
      value={{
        debugState,
        setShowInteractionOutlines: (v) => debugManager.setShowInteractionOutlines(v),
        setAmbientEventsEnabled: (v) => debugManager.setAmbientEventsEnabled(v),
        setTrainMovementPaused: (v) => debugManager.setTrainMovementPaused(v),
        setTrainScenerySpeed: (v) => debugManager.setTrainScenerySpeed(v),
        setTrainCondensationDisabled: (v) => debugManager.setTrainCondensationDisabled(v),
        triggerTrainArrivalReplay: () => debugManager.triggerTrainArrivalReplay(),
      }}
    >
      {children}
    </DebugContext.Provider>
  )
}

export function useDebug(): DebugContextValue {
  const ctx = useContext(DebugContext)
  if (!ctx) throw new Error('useDebug must be used within a DebugProvider')
  return ctx
}
