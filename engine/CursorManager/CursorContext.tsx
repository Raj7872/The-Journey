'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import type { CursorManagerState, CursorState } from '@/types/cursor'
import { cursorManager } from './CursorManager'

interface CursorContextValue {
  cursorState: CursorManagerState
  setCursorState: (state: CursorState) => void
}

const CursorContext = createContext<CursorContextValue | null>(null)

export function CursorProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode
  enabled?: boolean
}) {
  const [cursorState, setCursorStateLocal] = useState<CursorManagerState>(
    cursorManager.getState()
  )

  useEffect(() => {
    cursorManager.init(enabled)
    const unsubscribe = cursorManager.subscribe(setCursorStateLocal)
    return () => {
      unsubscribe()
      cursorManager.dispose()
    }
  }, [enabled])

  const setCursorState = useCallback((state: CursorState) => {
    cursorManager.setCursorState(state)
  }, [])

  return (
    <CursorContext.Provider value={{ cursorState, setCursorState }}>
      {children}
    </CursorContext.Provider>
  )
}

export function useCursor(): CursorContextValue {
  const ctx = useContext(CursorContext)
  if (!ctx) throw new Error('useCursor must be used within a CursorProvider')
  return ctx
}
