'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import type { AudioManagerState, AmbientLayerKey, MusicKey, SfxKey } from '@/types/audio'
import { timelineDirector } from '../TimelineDirector/TimelineDirector'
import { audioManager } from './AudioManager'

interface AudioContextValue {
  audioState: AudioManagerState
  playMusic: (key: MusicKey) => void
  stopMusic: () => void
  startAmbient: (key: AmbientLayerKey) => void
  stopAmbient: (key: AmbientLayerKey) => void
  playSfx: (key: SfxKey) => void
  setMusicVolume: (vol: number) => void
  setSfxVolume: (vol: number) => void
  mute: () => void
  unmute: () => void
}

const AudioContext = createContext<AudioContextValue | null>(null)

interface AudioProviderProps {
  children: React.ReactNode
  initialMusicVolume?: number
  initialSfxVolume?: number
}

export function AudioProvider({
  children,
  initialMusicVolume = 0.7,
  initialSfxVolume = 0.8,
}: AudioProviderProps) {
  const [audioState, setAudioState] = useState<AudioManagerState>(audioManager.getState())
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    // Applies the current scene's music/ambient — pulled into its own
    // function because it needs to run from two places: once per timeline
    // update via the subscription below, and once more right after init()
    // resolves (see the comment on that call for why).
    const syncAudioToTimeline = () => {
      if (!audioManager.getState().isInitialized) return
      const { ambienceProfile } = timelineDirector.getState()

      if (ambienceProfile.musicTrack) {
        audioManager.playMusic(ambienceProfile.musicTrack as MusicKey)
      } else {
        // Silence scenes — fade out music
        audioManager.stopMusic()
      }

      audioManager.syncAmbientLayers(ambienceProfile.ambientLayers)

      // Apply per-scene volume multiplier
      const base = audioManager.getState().musicVolume
      audioManager.setMusicVolume(base * ambienceProfile.musicVolume)
    }

    audioManager
      .init({ musicVolume: initialMusicVolume, sfxVolume: initialSfxVolume })
      // `subscribe` below fires once immediately with the CURRENT scene's
      // profile, but Howler's dynamic import (inside init()) hasn't
      // resolved yet at that point, so `syncAudioToTimeline`'s isInitialized
      // guard silently drops it — meaning the very first scene's music and
      // ambience never started, and nothing else was going to retry it
      // until the next scene transition. Re-running the sync here, once
      // init is actually confirmed ready, is what makes the first scene
      // audible at all.
      .then(syncAudioToTimeline)
      .catch((err) => console.error('[AudioProvider] Init failed:', err))

    // Subscribe to TimelineDirector — sync music and ambient from ambienceProfile
    const unsubTimeline = timelineDirector.subscribe(syncAudioToTimeline)

    const unsubAudio = audioManager.subscribe(setAudioState)

    return () => {
      unsubTimeline()
      unsubAudio()
      audioManager.dispose()
    }
    // Mount-only. initialMusicVolume/initialSfxVolume only seed the engine
    // once — they come from live save state, so including them here would
    // re-run this effect (and its cleanup, which disposes every Howl) on
    // every volume-slider drag. Live volume changes go through
    // setMusicVolume/setSfxVolume below instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playMusic = useCallback((key: MusicKey) => audioManager.playMusic(key), [])
  const stopMusic = useCallback(() => audioManager.stopMusic(), [])
  const startAmbient = useCallback((key: AmbientLayerKey) => audioManager.startAmbient(key), [])
  const stopAmbient = useCallback((key: AmbientLayerKey) => audioManager.stopAmbient(key), [])
  const playSfx = useCallback((key: SfxKey) => audioManager.playSfx(key), [])
  const setMusicVolume = useCallback((vol: number) => audioManager.setMusicVolume(vol), [])
  const setSfxVolume = useCallback((vol: number) => audioManager.setSfxVolume(vol), [])
  const mute = useCallback(() => audioManager.mute(), [])
  const unmute = useCallback(() => audioManager.unmute(), [])

  return (
    <AudioContext.Provider
      value={{
        audioState,
        playMusic,
        stopMusic,
        startAmbient,
        stopAmbient,
        playSfx,
        setMusicVolume,
        setSfxVolume,
        mute,
        unmute,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider')
  return ctx
}
