'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import type { SceneId } from '@/types/scene'
import type { AmbientEvent, AmbientEventType } from './AmbientEventManager'
import { ambientEventManager } from './AmbientEventManager'
import { AMBIENT_EVENT_POOLS } from './ambientEventPools'

interface AmbientEventContextValue {
  currentEvent: AmbientEvent | null
  triggerNow: (type: AmbientEventType) => void
}

const AmbientEventContext = createContext<AmbientEventContextValue | null>(null)

export function AmbientEventProvider({ children }: { children: React.ReactNode }) {
  const [currentEvent, setCurrentEvent] = useState<AmbientEvent | null>(
    ambientEventManager.getCurrent()
  )

  useEffect(() => {
    Object.entries(AMBIENT_EVENT_POOLS).forEach(([scene, types]) => {
      if (types) ambientEventManager.registerPool(scene as SceneId, types)
    })
    ambientEventManager.init()
    const unsubscribe = ambientEventManager.subscribe(setCurrentEvent)
    return () => {
      unsubscribe()
      ambientEventManager.dispose()
    }
  }, [])

  return (
    <AmbientEventContext.Provider
      value={{
        currentEvent,
        triggerNow: (type) => ambientEventManager.triggerNow(type),
      }}
    >
      {children}
    </AmbientEventContext.Provider>
  )
}

export function useAmbientEvent(): AmbientEventContextValue {
  const ctx = useContext(AmbientEventContext)
  if (!ctx) throw new Error('useAmbientEvent must be used within an AmbientEventProvider')
  return ctx
}
