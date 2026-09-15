'use client'

import { createContext, useCallback, useContext, useEffect } from 'react'

import type { SceneId } from '@/types/scene'
import { TIMING } from '@/lib/constants/timing'
import type { CameraTransform } from './CameraManager'
import { cameraManager } from './CameraManager'

interface CameraContextValue {
  moveToScene: (scene: SceneId, duration?: number) => void
  moveTo: (transform: CameraTransform, duration?: number) => void
  snapToScene: (scene: SceneId) => void
}

const CameraContext = createContext<CameraContextValue | null>(null)

export function CameraProvider({ children }: { children: React.ReactNode }) {
  // The camera transform updates every animation frame (ambient float, moves).
  // Piping that through React state would re-render the whole subtree at 60fps.
  // Instead, write it straight to a CSS custom property — the same pattern
  // TimelineContext uses for --world-filter — and let WorldContainer read it.
  useEffect(() => {
    cameraManager.init()
    const unsubscribe = cameraManager.subscribe(() => {
      document.documentElement.style.setProperty(
        '--camera-transform',
        cameraManager.getTransformString()
      )
    })
    return () => {
      unsubscribe()
      cameraManager.dispose()
    }
  }, [])

  const moveToScene = useCallback((scene: SceneId, duration?: number) => {
    cameraManager.moveToScene(scene, duration)
  }, [])

  const moveTo = useCallback((transform: CameraTransform, duration?: number) => {
    cameraManager.moveTo(transform, duration ?? TIMING.CAMERA_TRANSITION)
  }, [])

  const snapToScene = useCallback((scene: SceneId) => {
    cameraManager.snapToScene(scene)
  }, [])

  return (
    <CameraContext.Provider value={{ moveToScene, moveTo, snapToScene }}>
      {children}
    </CameraContext.Provider>
  )
}

export function useCamera(): CameraContextValue {
  const ctx = useContext(CameraContext)
  if (!ctx) throw new Error('useCamera must be used within a CameraProvider')
  return ctx
}
