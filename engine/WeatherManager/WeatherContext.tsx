'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import type { WeatherState } from '@/types/timeline'
import { weatherManager } from './WeatherManager'

const WeatherContext = createContext<WeatherState | null>(null)

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WeatherState>(weatherManager.getState())

  useEffect(() => {
    weatherManager.init()
    const unsubscribe = weatherManager.subscribe(setState)
    return () => {
      unsubscribe()
      weatherManager.dispose()
    }
  }, [])

  return <WeatherContext.Provider value={state}>{children}</WeatherContext.Provider>
}

export function useWeather(): WeatherState {
  const ctx = useContext(WeatherContext)
  if (!ctx) throw new Error('useWeather must be used within a WeatherProvider')
  return ctx
}
