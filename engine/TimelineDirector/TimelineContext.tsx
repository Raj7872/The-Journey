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
import type { LightingProfile, TimelineState, TimeOfDay, WeatherState } from '@/types/timeline'
import { timelineDirector } from './TimelineDirector'

interface TimelineContextValue {
  timeline: TimelineState
  transitionTo: (scene: SceneId, durationMs?: number) => void
  snapTo: (scene: SceneId) => void
  freezeClock: () => void
  advanceToMidnight: () => void
  debugSetWeather: (overrides: Partial<WeatherState>) => void
  debugSetTimeOfDay: (timeOfDay: TimeOfDay, lightingOverrides?: Partial<LightingProfile>) => void
}

const TimelineContext = createContext<TimelineContextValue | null>(null)

interface TimelineProviderProps {
  children: React.ReactNode
  initialScene?: SceneId
}

export function TimelineProvider({ children, initialScene }: TimelineProviderProps) {
  const [timeline, setTimeline] = useState<TimelineState>(() =>
    timelineDirector.getState()
  )

  // useLayoutEffect runs synchronously after DOM paint but before the browser
  // draws — safe to call setState on other providers here because React has
  // already committed this render. This avoids the "setState during render" error.
  useLayoutEffect(() => {
    if (initialScene) {
      timelineDirector.snapTo(initialScene)
    }
    // Subscribe after snap so the first emission has the correct state
    const unsubscribe = timelineDirector.subscribe(setTimeline)
    return () => {
      unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount-only

  // Write CSS variables whenever state changes
  useEffect(() => {
    const root = document.documentElement
    const { lightingProfile, weatherState, particleProfile, progress, clockMinute } = timeline

    root.style.setProperty('--light-warmth', lightingProfile.warmth.toString())
    root.style.setProperty('--light-brightness', lightingProfile.brightness.toString())
    root.style.setProperty('--light-bloom', lightingProfile.bloomIntensity.toString())
    root.style.setProperty('--light-ambient', lightingProfile.ambientColor)
    root.style.setProperty('--light-source', lightingProfile.lightSourceColor)
    root.style.setProperty('--world-filter', lightingProfile.worldFilter)
    root.style.setProperty('--light-has-sunrays', lightingProfile.hasSunrays ? '1' : '0')
    root.style.setProperty('--weather-rain', weatherState.rainIntensity.toString())
    root.style.setProperty('--weather-fog', weatherState.fogDensity.toString())
    root.style.setProperty('--weather-wind', weatherState.windStrength.toString())
    root.style.setProperty('--weather-rain-drops', weatherState.rainDropCount.toString())
    root.style.setProperty('--particle-dust', particleProfile.dustDensity.toString())
    root.style.setProperty('--particle-steam', particleProfile.steamDensity.toString())
    root.style.setProperty('--particle-firefly', particleProfile.fireflyDensity.toString())
    root.style.setProperty('--particle-petal', particleProfile.petalDensity.toString())
    root.style.setProperty('--timeline-progress', progress.toString())
    root.style.setProperty('--clock-minute', clockMinute.toString())
  }, [timeline])

  const transitionTo = useCallback(
    (scene: SceneId, durationMs?: number) => timelineDirector.transitionTo(scene, durationMs),
    []
  )
  const snapTo = useCallback(
    (scene: SceneId) => timelineDirector.snapTo(scene),
    []
  )
  const freezeClock = useCallback(() => timelineDirector.freezeClock(), [])
  const advanceToMidnight = useCallback(() => timelineDirector.advanceToMidnight(), [])
  const debugSetWeather = useCallback(
    (overrides: Partial<WeatherState>) => timelineDirector.debugSetWeather(overrides),
    []
  )
  const debugSetTimeOfDay = useCallback(
    (timeOfDay: TimeOfDay, lightingOverrides?: Partial<LightingProfile>) =>
      timelineDirector.debugSetTimeOfDay(timeOfDay, lightingOverrides),
    []
  )

  return (
    <TimelineContext.Provider
      value={{
        timeline,
        transitionTo,
        snapTo,
        freezeClock,
        advanceToMidnight,
        debugSetWeather,
        debugSetTimeOfDay,
      }}
    >
      {children}
    </TimelineContext.Provider>
  )
}

export function useTimeline(): TimelineContextValue {
  const ctx = useContext(TimelineContext)
  if (!ctx) throw new Error('useTimeline must be used within a TimelineProvider')
  return ctx
}
