'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import type { Memory, MemoryCategory, CollectionState } from '@/types/memory'
import type { NotebookState } from '@/types/notebook'
import { notebookManager } from './NotebookManager'

interface NotebookContextValue {
  notebookState: NotebookState
  collectionState: CollectionState
  collect: (memory: Memory) => void
  openNotebook: () => void
  closeNotebook: () => void
  unlockNotebook: () => void
  goToSection: (section: number) => void
  nextPage: () => void
  prevPage: () => void
  jumpTo: (section: number, page: number) => void
  debugReset: () => void
  isCollected: (id: string) => boolean
  getCollectedByCategory: (category: MemoryCategory) => Memory[]
}

const NotebookContext = createContext<NotebookContextValue | null>(null)

interface NotebookProviderProps {
  children: React.ReactNode
  memories: Memory[]
  initialCollectedIds?: string[]
  initialNotebookUnlocked?: boolean
  initialSection?: number
  initialPage?: number
}

export function NotebookProvider({
  children,
  memories,
  initialCollectedIds = [],
  initialNotebookUnlocked = false,
  initialSection = 1,
  initialPage = 0,
}: NotebookProviderProps) {
  const [notebookState, setNotebookState] = useState<NotebookState>(
    notebookManager.getNotebookState()
  )
  const [collectionState, setCollectionState] = useState<CollectionState>(
    notebookManager.getCollectionState()
  )

  useEffect(() => {
    notebookManager.registerMemories(memories)
    notebookManager.hydrate(initialCollectedIds, initialNotebookUnlocked, initialSection, initialPage)

    const unsubNotebook = notebookManager.subscribeNotebook(setNotebookState)
    const unsubCollection = notebookManager.subscribeCollection(setCollectionState)

    return () => {
      unsubNotebook()
      unsubCollection()
      notebookManager.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount — memories list is stable

  const collect = useCallback((memory: Memory) => notebookManager.collect(memory), [])
  const openNotebook = useCallback(() => notebookManager.open(), [])
  const closeNotebook = useCallback(() => notebookManager.close(), [])
  const unlockNotebook = useCallback(() => notebookManager.unlock(), [])
  const goToSection = useCallback((s: number) => notebookManager.goToSection(s), [])
  const nextPage = useCallback(() => notebookManager.nextPage(), [])
  const prevPage = useCallback(() => notebookManager.prevPage(), [])
  const jumpTo = useCallback((section: number, page: number) => notebookManager.jumpTo(section, page), [])
  const debugReset = useCallback(() => notebookManager.debugReset(), [])
  const isCollected = useCallback((id: string) => notebookManager.isCollected(id), [])
  const getCollectedByCategory = useCallback(
    (cat: MemoryCategory) => notebookManager.getCollectedByCategory(cat),
    []
  )

  return (
    <NotebookContext.Provider
      value={{
        notebookState,
        collectionState,
        collect,
        openNotebook,
        closeNotebook,
        unlockNotebook,
        goToSection,
        nextPage,
        prevPage,
        jumpTo,
        debugReset,
        isCollected,
        getCollectedByCategory,
      }}
    >
      {children}
    </NotebookContext.Provider>
  )
}

export function useNotebook(): NotebookContextValue {
  const ctx = useContext(NotebookContext)
  if (!ctx) throw new Error('useNotebook must be used within a NotebookProvider')
  return ctx
}
