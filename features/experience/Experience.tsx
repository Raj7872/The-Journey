'use client'

import { Suspense, useEffect, useState } from 'react'

import { ALL_MEMORIES } from '@/content/memories'
import { ANNOUNCEMENT_POOLS } from '@/content/announcements/announcements'
import { ASSET_MANIFEST } from '@/content/assets/assetManifest'
import {
  AppErrorBoundary,
  AudioErrorBoundary,
  SaveProvider,
  SceneProvider,
  TimelineProvider,
  AudioProvider,
  NotebookProvider,
  CursorProvider,
  CameraProvider,
  WeatherProvider,
  LightingProvider,
  AnimationProvider,
  DebugProvider,
  AmbientEventProvider,
  assetPipeline,
  announcementManager,
} from '@/engine'
import { useSave } from '@/engine/SaveManager/SaveContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { Preloader } from '@/components/ui/Preloader'
import { SceneTransition } from '@/components/ui/SceneTransition'
import { AnnouncementDisplay } from '@/components/ui/AnnouncementDisplay'
import { Cursor } from '@/components/ui/Cursor'
import { ScaledStage } from '@/components/world/ScaledStage'
import { WorldContainer } from '@/features/world/WorldContainer'
import { SceneRouter } from '@/features/world/SceneRouter'
import { AtmosphereCanvas } from '@/components/background/AtmosphereCanvas'
import { AmbientEventLayer } from '@/components/world/AmbientEventLayer'
import { MemoryRevealProvider } from '@/features/world/MemoryRevealContext'
import { MemoryReveal } from '@/components/notebook/MemoryReveal'
import { Notebook } from '@/features/notebook/Notebook'
import { NotebookTab } from '@/components/ui/NotebookTab'
import { SettingsPanel } from '@/components/ui/SettingsPanel'
import { DebugPanel } from '@/components/ui/DebugPanel'

// Register singletons once at module level
assetPipeline.registerMany(ASSET_MANIFEST)
Object.entries(ANNOUNCEMENT_POOLS).forEach(([key, pool]) => {
  announcementManager.registerPool(key, pool)
})

// ── PreloaderGate ─────────────────────────────────────────────────────────────
// Separated component so it can call useTimeline() inside the provider tree.

function PreloaderGate({ skip }: { skip: boolean }) {
  const { transitionTo } = useTimeline()
  const [done, setDone] = useState(false)

  // If skip (returning player), mark done immediately after mount
  useEffect(() => {
    if (skip) setDone(true)
  }, [skip])

  function handleComplete() {
    setDone(true)
    transitionTo('outside-station', 2500)
  }

  if (done) return null
  return <Preloader onComplete={handleComplete} />
}

// ── ExperienceInner ───────────────────────────────────────────────────────────
// All client-only logic lives here — SaveProvider has already hydrated above.

function ExperienceInner() {
  const { save } = useSave()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // New journey starts at outside-station.
  // Returning player restores their saved scene.
  const initialScene =
    save.currentScene === 'preloader' ? 'outside-station' : save.currentScene

  return (
    <TimelineProvider initialScene={initialScene}>
      <SceneProvider
        initialScene={initialScene}
        unlockedScenes={save.unlockedSceneIds}
        visitedScenes={save.visitedSceneIds}
      >
        <DebugProvider>
        <AnimationProvider reducedMotionOverride={save.settings.reducedMotion}>
          <LightingProvider>
            <WeatherProvider>
              <CameraProvider>
                <AmbientEventProvider>
                <AudioErrorBoundary>
                  <AudioProvider
                    initialMusicVolume={save.settings.musicVolume}
                    initialSfxVolume={save.settings.sfxVolume}
                  >
                    <NotebookProvider
                      memories={ALL_MEMORIES}
                      initialCollectedIds={save.collectedMemoryIds}
                      initialNotebookUnlocked={save.notebookUnlocked}
                      initialSection={save.notebookCurrentSection}
                      initialPage={save.notebookCurrentPage}
                    >
                      <CursorProvider enabled={save.settings.cursorEnabled}>
                        <MemoryRevealProvider>

                        {/* Every scene is a fixed composition tuned at one
                            reference size — ScaledStage scales that whole
                            canvas to fit the real window instead of letting
                            individual absolute-positioned elements stretch
                            and drift into each other on narrower screens. */}
                        <ScaledStage>
                          {/* R3F atmosphere — behind everything.
                              Mounted only client-side: the Canvas needs a real DOM/WebGL
                              context, and gating with isMounted (rather than
                              next/dynamic ssr:false) avoids the SSR bailout cascading
                              up and swallowing the rest of this tree. */}
                          {isMounted && <AtmosphereCanvas />}

                          {/* Camera-driven world */}
                          <WorldContainer>
                            <SceneRouter />
                          </WorldContainer>

                          {/* Scene cross-fade */}
                          <SceneTransition />

                          {/* Station announcements */}
                          <AnnouncementDisplay />

                          {/* Ambient events — cat, leaves, pigeons, train horn */}
                          <AmbientEventLayer />
                        </ScaledStage>

                        {/* Everything below tracks the real mouse/viewport
                            directly (the custom cursor), needs to sit above
                            literally everything else including the debug
                            panel (the preloader), or already has its own
                            responsive layout (the notebook) — kept outside
                            ScaledStage on purpose: a transform ancestor
                            would both misalign raw clientX/clientY-based
                            positioning and trap z-index:300 inside a new
                            stacking context, no longer able to out-rank the
                            debug panel's z-index:210 the way it needs to. */}

                        {/* Notebook — entry tab and full overlay */}
                        <NotebookTab />
                        <Notebook />

                        {/* Preloader — on top of absolutely everything until player enters */}
                        <PreloaderGate skip={save.journeyCompleted} />

                        {/* A memory just found in the world */}
                        <MemoryReveal />

                        {/* Always-available settings — volume, motion, restart */}
                        <SettingsPanel />

                        {/* Custom cursor */}
                        <Cursor />

                        {/* Dev-only tools — stripped from production builds */}
                        <DebugPanel />

                        </MemoryRevealProvider>
                      </CursorProvider>
                    </NotebookProvider>
                  </AudioProvider>
                </AudioErrorBoundary>
                </AmbientEventProvider>
              </CameraProvider>
            </WeatherProvider>
          </LightingProvider>
        </AnimationProvider>
        </DebugProvider>
      </SceneProvider>
    </TimelineProvider>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function Experience() {
  return (
    <AppErrorBoundary>
      <SaveProvider>
        <Suspense
          fallback={
            <div
              style={{ position: 'fixed', inset: 0, background: '#050608' }}
              aria-label="Loading the station"
            />
          }
        >
          <ExperienceInner />
        </Suspense>
      </SaveProvider>
    </AppErrorBoundary>
  )
}
