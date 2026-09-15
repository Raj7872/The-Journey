'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { SceneErrorBoundary } from '@/engine/ErrorBoundaries/SceneErrorBoundary'
import type { SceneId } from '@/types/scene'
import { SceneDepth } from '@/components/world/SceneDepth'

// ── Lazy-load every scene — each is independently code-split ─────────────────

const OutsideStation = dynamic(
  () => import('@/features/actI-arrival/OutsideStation').then(m => ({ default: m.OutsideStation })),
  { ssr: false }
)
const EntranceHall = dynamic(
  () => import('@/features/actI-arrival/EntranceHall').then(m => ({ default: m.EntranceHall })),
  { ssr: false }
)
const MainHall = dynamic(
  () => import('@/features/actII-exploration/MainHall').then(m => ({ default: m.MainHall })),
  { ssr: false }
)
const PlatformOne = dynamic(
  () => import('@/features/actII-exploration/PlatformOne').then(m => ({ default: m.PlatformOne })),
  { ssr: false }
)
const PlatformCafe = dynamic(
  () => import('@/features/actII-exploration/PlatformCafe').then(m => ({ default: m.PlatformCafe })),
  { ssr: false }
)
const MemoryTunnel = dynamic(
  () => import('@/features/actII-exploration/MemoryTunnel').then(m => ({ default: m.MemoryTunnel })),
  { ssr: false }
)
const WaitingRoom = dynamic(
  () => import('@/features/actII-exploration/WaitingRoom').then(m => ({ default: m.WaitingRoom })),
  { ssr: false }
)
const PlatformEleven = dynamic(
  () => import('@/features/actIII-boarding/PlatformEleven').then(m => ({ default: m.PlatformEleven })),
  { ssr: false }
)
const TrainArrival = dynamic(
  () => import('@/features/actIII-boarding/TrainArrival').then(m => ({ default: m.TrainArrival })),
  { ssr: false }
)
const TrainInterior = dynamic(
  () => import('@/features/actIV-journey/TrainInterior').then(m => ({ default: m.TrainInterior })),
  { ssr: false }
)
const TheField = dynamic(
  () => import('@/features/actV-sunrise/TheField').then(m => ({ default: m.TheField })),
  { ssr: false }
)
const TheBench = dynamic(
  () => import('@/features/actV-sunrise/TheBench').then(m => ({ default: m.TheBench })),
  { ssr: false }
)
const TheGift = dynamic(
  () => import('@/features/actV-sunrise/TheGift').then(m => ({ default: m.TheGift })),
  { ssr: false }
)
const TheSilence = dynamic(
  () => import('@/features/actV-sunrise/TheSilence').then(m => ({ default: m.TheSilence })),
  { ssr: false }
)
const TheQuestion = dynamic(
  () => import('@/features/actV-sunrise/TheQuestion').then(m => ({ default: m.TheQuestion })),
  { ssr: false }
)
const WorldChanges = dynamic(
  () => import('@/features/actVI-ending/WorldChanges').then(m => ({ default: m.WorldChanges })),
  { ssr: false }
)
const Credits = dynamic(
  () => import('@/features/actVI-ending/Credits').then(m => ({ default: m.Credits })),
  { ssr: false }
)

// ── Scene component map ───────────────────────────────────────────────────────

const SCENE_MAP: Partial<Record<SceneId, React.ComponentType>> = {
  'outside-station':  OutsideStation,
  'entrance-hall':    EntranceHall,
  'main-hall':        MainHall,
  'platform-one':     PlatformOne,
  'platform-cafe':    PlatformCafe,
  'memory-tunnel':    MemoryTunnel,
  'waiting-room':     WaitingRoom,
  'platform-eleven':  PlatformEleven,
  'train-arrival':    TrainArrival,
  'train-interior':   TrainInterior,
  'final-carriage':   TrainInterior,
  'the-field':        TheField,
  'the-bench':        TheBench,
  'the-gift':         TheGift,
  'the-silence':      TheSilence,
  'the-question':     TheQuestion,
  'world-changes':    WorldChanges,
  credits:            Credits,
  // 'secret-ending' deliberately left unmapped — out of scope for this pass.
}

// ── Loading fallback — a dim atmospheric black ────────────────────────────────

function SceneLoadingFallback() {
  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,10,0.98)' }}
      aria-hidden="true"
    />
  )
}

// ── SceneRenderer — renders previous + current with opacity cross-fade ────────

interface SceneLayerProps {
  sceneId: SceneId
  opacity: number
  zIndex: number
}

function SceneLayer({ sceneId, opacity, zIndex }: SceneLayerProps) {
  const SceneComponent = SCENE_MAP[sceneId]
  if (!SceneComponent) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        zIndex,
        transition: 'opacity 0.1s linear',
        pointerEvents: opacity > 0.5 ? 'all' : 'none',
      }}
    >
      <SceneErrorBoundary sceneName={sceneId}>
        <SceneComponent />
        <SceneDepth sceneId={sceneId} />
      </SceneErrorBoundary>
    </div>
  )
}

// ── SceneRouter ───────────────────────────────────────────────────────────────

/**
 * SceneRouter
 *
 * Reads the current and previous scene from TimelineDirector.
 * During a transition, renders both scenes and cross-fades between them.
 * Each scene is independently lazy-loaded and error-bounded.
 *
 * isMounted gate prevents hydration mismatch — scenes are client-only.
 */
export function SceneRouter() {
  const { timeline } = useTimeline()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { currentScene, isTransitioning, transitionProgress } = timeline
  const currentOpacity = isTransitioning ? transitionProgress : 1

  // During SSR and first paint: render nothing (avoids hydration mismatch)
  if (!isMounted) {
    return (
      <div
        style={{ position: 'absolute', inset: 0, background: '#050608' }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      style={{ position: 'absolute', inset: 0 }}
      aria-live="polite"
      aria-atomic="false"
    >
      <SceneLoadingFallback />
      <SceneLayer
        sceneId={currentScene}
        opacity={currentOpacity}
        zIndex={2}
      />
    </div>
  )
}
