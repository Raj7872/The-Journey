'use client'

import { useEffect, useRef, useState } from 'react'

import { useAudio } from '@/engine/AudioManager/AudioContext'
import { Z_INDEX } from '@/lib/constants/zIndex'
import { TRAIN_PLAYLIST } from '@/content/train/playlist'

type HowlInstance = {
  play: () => number
  pause: () => void
  stop: () => void
  volume: (vol?: number) => number
  playing: () => boolean
  unload: () => void
}

type HowlConstructor = new (options: {
  src: string[]
  volume?: number
  onend?: () => void
  onloaderror?: (id: number, err: unknown) => void
}) => HowlInstance

const panelButtonStyle: React.CSSProperties = {
  all: 'unset',
  cursor: 'pointer',
  padding: '3px 9px',
  fontSize: 13,
  color: '#f2e8d5',
  fontFamily: 'var(--font-mono,"Special Elite",monospace)',
}

/**
 * TrainMusicPlayer
 *
 * A small, player-controlled music player, only present while riding the
 * train — separate from the automatic scene ambience (which keeps playing
 * underneath until this is actually pressed play). Tracks are whatever's
 * listed in `content/train/playlist.ts`; nothing here is hardcoded to a
 * specific song, so new tracks just need to be dropped into
 * public/audio/train-player/ and added to that list.
 *
 * Deliberately its own small Howl instance rather than routed through
 * AudioManager's key-based system — that system resolves a fixed, curated
 * set of asset keys to fixed paths, and player-supplied tracks don't fit
 * that model. Pressing play pauses the automatic scene music so the two
 * don't overlap; pausing hands it back.
 */
interface TrainMusicPlayerProps {
  /** Position override — defaults to bottom-center of the screen if omitted */
  style?: React.CSSProperties
}

export function TrainMusicPlayer({ style }: TrainMusicPlayerProps) {
  const { stopMusic, playMusic } = useAudio()
  const HowlRef = useRef<HowlConstructor | null>(null)
  const soundRef = useRef<HowlInstance | null>(null)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    import('howler').then(({ Howl }) => {
      if (!cancelled) HowlRef.current = Howl as unknown as HowlConstructor
    })
    return () => { cancelled = true }
  }, [])

  // Leaving the train — stop the player and hand music back to the scene.
  useEffect(() => {
    return () => {
      soundRef.current?.stop()
      soundRef.current?.unload()
      soundRef.current = null
    }
  }, [])

  function loadTrack(index: number): HowlInstance | null {
    soundRef.current?.stop()
    soundRef.current?.unload()
    soundRef.current = null
    setLoadError(false)

    const Howl = HowlRef.current
    const track = TRAIN_PLAYLIST[index]
    if (!Howl || !track) return null

    const sound = new Howl({
      src: [track.src],
      volume: 0.55,
      onend: () => goTo((trackIndex + 1) % TRAIN_PLAYLIST.length, true),
      onloaderror: () => setLoadError(true),
    })
    soundRef.current = sound
    return sound
  }

  function goTo(index: number, autoplay: boolean) {
    setTrackIndex(index)
    const sound = loadTrack(index)
    if (autoplay && sound) {
      sound.play()
      setIsPlaying(true)
    }
  }

  function handlePlayPause() {
    if (!HowlRef.current || TRAIN_PLAYLIST.length === 0) return

    if (isPlaying) {
      soundRef.current?.pause()
      setIsPlaying(false)
      playMusic('piano-train')
      return
    }

    stopMusic()
    const sound = soundRef.current ?? loadTrack(trackIndex)
    sound?.play()
    setIsPlaying(true)
  }

  function handleNext() {
    goTo((trackIndex + 1) % TRAIN_PLAYLIST.length, isPlaying)
    if (isPlaying) stopMusic()
  }

  function handlePrev() {
    goTo((trackIndex - 1 + TRAIN_PLAYLIST.length) % TRAIN_PLAYLIST.length, isPlaying)
    if (isPlaying) stopMusic()
  }

  if (TRAIN_PLAYLIST.length === 0) return null

  const track = TRAIN_PLAYLIST[trackIndex]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: Z_INDEX.SETTINGS,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 10px',
        background: 'rgba(20,15,10,0.72)',
        border: '1px solid rgba(184,146,42,0.4)',
        borderRadius: 4,
        backdropFilter: 'blur(2px)',
        ...style,
      }}
      role="group"
      aria-label="Train music player"
    >
      <button style={panelButtonStyle} onClick={handlePrev} aria-label="Previous track">⏮</button>
      <button style={panelButtonStyle} onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button style={panelButtonStyle} onClick={handleNext} aria-label="Next track">⏭</button>
      <span style={{
        marginLeft: 4,
        fontFamily: 'var(--font-mono,"Special Elite",monospace)',
        fontSize: 11,
        letterSpacing: '1px',
        color: loadError ? 'rgba(212,132,58,0.75)' : 'rgba(242,232,213,0.75)',
        whiteSpace: 'nowrap',
      }}>
        {loadError ? 'Track not found — add it to public/audio/train-player/' : track?.title}
      </span>
    </div>
  )
}
