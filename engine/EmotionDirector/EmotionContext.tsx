'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import type { AtmosphereConfig, EmotionDirectorState, EmotionState } from '@/types/emotion'
import type { SceneId } from '@/types/scene'
import { emotionDirector } from './EmotionDirector'

interface EmotionContextValue {
  emotionState: EmotionDirectorState
  currentAtmosphere: AtmosphereConfig
  notifySceneChange: (sceneId: SceneId) => void
  setEmotionImmediate: (emotion: EmotionState) => void
}

const EmotionContext = createContext<EmotionContextValue | null>(null)

interface EmotionProviderProps {
  children: React.ReactNode
  initialEmotion?: EmotionState
}

export function EmotionProvider({ children, initialEmotion = 'LONELY' }: EmotionProviderProps) {
  const [emotionState, setEmotionState] = useState<EmotionDirectorState>(
    emotionDirector.getState()
  )
  const isInitialized = useRef(false)

  // Apply initial emotion from save state (no transition)
  useEffect(() => {
    if (!isInitialized.current) {
      emotionDirector.setImmediate(initialEmotion)
      isInitialized.current = true
    }

    const unsubscribe = emotionDirector.subscribe(setEmotionState)
    return unsubscribe
  }, [initialEmotion])

  // Apply CSS variables whenever atmosphere changes
  useEffect(() => {
    const { atmosphereConfig } = emotionState
    const root = document.documentElement

    root.style.setProperty('--atm-light-warmth', atmosphereConfig.lightWarmth.toString())
    root.style.setProperty('--atm-brightness', atmosphereConfig.lightBrightness.toString())
    root.style.setProperty('--atm-rain-intensity', atmosphereConfig.rainIntensity.toString())
    root.style.setProperty('--atm-fog-density', atmosphereConfig.fogDensity.toString())
    root.style.setProperty('--atm-ambient-color', atmosphereConfig.ambientColor)
    root.style.setProperty('--atm-light-source', atmosphereConfig.lightSourceColor)
    root.style.setProperty('--atm-world-filter', atmosphereConfig.worldFilter)
    root.style.setProperty('--atm-bloom', atmosphereConfig.bloomIntensity.toString())
    root.style.setProperty('--atm-dust-density', atmosphereConfig.dustDensity.toString())
    root.style.setProperty('--atm-steam-density', atmosphereConfig.steamDensity.toString())
    root.style.setProperty('--atm-firefly-density', atmosphereConfig.fireflyDensity.toString())
    root.style.setProperty('--atm-petal-density', atmosphereConfig.petalDensity.toString())
  }, [emotionState])

  const notifySceneChange = useCallback((sceneId: SceneId) => {
    emotionDirector.onSceneChange(sceneId)
  }, [])

  const setEmotionImmediate = useCallback((emotion: EmotionState) => {
    emotionDirector.setImmediate(emotion)
  }, [])

  return (
    <EmotionContext.Provider
      value={{
        emotionState,
        currentAtmosphere: emotionState.atmosphereConfig,
        notifySceneChange,
        setEmotionImmediate,
      }}
    >
      {children}
    </EmotionContext.Provider>
  )
}

export function useEmotion(): EmotionContextValue {
  const ctx = useContext(EmotionContext)
  if (!ctx) {
    throw new Error('useEmotion must be used within an EmotionProvider')
  }
  return ctx
}
