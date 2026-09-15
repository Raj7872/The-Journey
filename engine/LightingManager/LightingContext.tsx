'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import type { LightingState } from './LightingManager'
import { lightingManager } from './LightingManager'

const LightingContext = createContext<LightingState | null>(null)

export function LightingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LightingState>(lightingManager.getState())

  useEffect(() => {
    lightingManager.init()
    const unsubscribe = lightingManager.subscribe(setState)
    return () => {
      unsubscribe()
      lightingManager.dispose()
    }
  }, [])

  return <LightingContext.Provider value={state}>{children}</LightingContext.Provider>
}

export function useLighting(): LightingState {
  const ctx = useContext(LightingContext)
  if (!ctx) throw new Error('useLighting must be used within a LightingProvider')
  return ctx
}
