'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import type { AnimationManagerState } from './AnimationManager'
import { animationManager } from './AnimationManager'

interface AnimationContextValue {
  animationState: AnimationManagerState
  duration: (ms: number) => number
  shouldAnimate: () => boolean
  setReducedMotion: (value: boolean) => void
}

const AnimationContext = createContext<AnimationContextValue | null>(null)

export function AnimationProvider({
  children,
  reducedMotionOverride,
}: {
  children: React.ReactNode
  reducedMotionOverride?: boolean
}) {
  const [animationState, setAnimationState] = useState<AnimationManagerState>(
    animationManager.getState()
  )

  useEffect(() => {
    animationManager.init(reducedMotionOverride)
    const unsubscribe = animationManager.subscribe(setAnimationState)
    return () => {
      unsubscribe()
      animationManager.dispose()
    }
  }, [reducedMotionOverride])

  return (
    <AnimationContext.Provider
      value={{
        animationState,
        duration: (ms) => animationManager.duration(ms),
        shouldAnimate: () => animationManager.shouldAnimate(),
        setReducedMotion: (value) => animationManager.setReducedMotion(value),
      }}
    >
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimationManager(): AnimationContextValue {
  const ctx = useContext(AnimationContext)
  if (!ctx) throw new Error('useAnimationManager must be used within an AnimationProvider')
  return ctx
}
