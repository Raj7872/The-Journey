'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'

import type { SceneId } from '@/types/scene'
import type { SceneAccessState } from './SceneManager'
import { sceneManager } from './SceneManager'

interface SceneContextValue {
  accessState: SceneAccessState
  transitionTo: (scene: SceneId, typeOrDuration?: string | number, durationMs?: number) => void
  unlockScene: (scene: SceneId) => void
  isUnlocked: (scene: SceneId) => boolean
  isVisited: (scene: SceneId) => boolean
}

const SceneContext = createContext<SceneContextValue | null>(null)

interface SceneProviderProps {
  children: React.ReactNode
  initialScene?: SceneId
  unlockedScenes?: SceneId[]
  visitedScenes?: SceneId[]
}

export function SceneProvider({
  children,
  initialScene,
  unlockedScenes,
  visitedScenes,
}: SceneProviderProps) {
  const [accessState, setAccessState] = useState<SceneAccessState>(() =>
    sceneManager.getAccessState()
  )

  // useLayoutEffect: runs after render commit, before paint.
  // Safe to mutate singletons and subscribe here — React has already
  // finished rendering this component, so no "setState during render" risk.
  useLayoutEffect(() => {
    if (unlockedScenes?.length) sceneManager.restoreUnlockedScenes(unlockedScenes)
    if (visitedScenes?.length) sceneManager.restoreVisitedScenes(visitedScenes)
    if (initialScene) sceneManager.restoreScene(initialScene)
    sceneManager.init()
    const unsubscribe = sceneManager.subscribe(setAccessState)
    return () => {
      unsubscribe()
      sceneManager.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount-only — all args are stable save-derived values

  const transitionTo = useCallback(
    (scene: SceneId, typeOrDuration?: string | number, durationMs?: number) => {
      const duration = typeof typeOrDuration === 'number' ? typeOrDuration : durationMs
      sceneManager.transitionTo(scene, duration)
    },
    []
  )

  const unlockScene = useCallback((scene: SceneId) => sceneManager.unlockScene(scene), [])

  const isUnlocked = useCallback(
    (scene: SceneId) => sceneManager.isUnlocked(scene),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessState]
  )

  const isVisited = useCallback(
    (scene: SceneId) => sceneManager.isVisited(scene),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessState]
  )

  return (
    <SceneContext.Provider
      value={{ accessState, transitionTo, unlockScene, isUnlocked, isVisited }}
    >
      {children}
    </SceneContext.Provider>
  )
}

export function useScene(): SceneContextValue {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error('useScene must be used within a SceneProvider')
  return ctx
}
