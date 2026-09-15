'use client'

import { useState } from 'react'

import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useAnimationManager } from '@/engine/AnimationManager/AnimationContext'
import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useDebug } from '@/engine/DebugManager/DebugContext'
import { useAmbientEvent } from '@/engine/AmbientEventManager/AmbientEventContext'
import type { AmbientEventType } from '@/engine/AmbientEventManager/AmbientEventManager'
import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { ALL_MEMORIES } from '@/content/memories'
import { NOTEBOOK_SECTIONS } from '@/content/notebook/sections'
import { Z_INDEX } from '@/lib/constants/zIndex'
import type { SceneId } from '@/types/scene'
import type { TimeOfDay } from '@/types/timeline'

const PLACEHOLDER_MEMORIES = ALL_MEMORIES.filter((m) => m.category !== 'final-letter')

const STATION_AREAS: { id: SceneId; label: string }[] = [
  { id: 'outside-station', label: 'Outside Station' },
  { id: 'entrance-hall', label: 'Entrance Hall' },
  { id: 'main-hall', label: 'Main Hall' },
  { id: 'platform-one', label: 'Platform One' },
  { id: 'platform-cafe', label: 'Station Café' },
  { id: 'memory-tunnel', label: 'Memory Tunnel' },
  { id: 'waiting-room', label: 'Waiting Room' },
  { id: 'platform-eleven', label: 'Platform Eleven' },
]

const TRAIN_AREAS: { id: SceneId; label: string }[] = [
  { id: 'train-arrival', label: 'Train Arrival' },
  { id: 'train-interior', label: 'Train Interior' },
  { id: 'final-carriage', label: 'Final Carriage' },
]

// The real pacing here is a ~5.5min ride and a protected 30s silence —
// impractical to sit through on every test pass, hence these shortcuts.
const SUNRISE_AREAS: { id: SceneId; label: string }[] = [
  { id: 'the-field', label: 'The Field' },
  { id: 'the-bench', label: 'The Bench' },
  { id: 'the-gift', label: 'The Gift' },
  { id: 'the-silence', label: 'The Silence' },
  { id: 'the-question', label: 'The Question' },
  { id: 'world-changes', label: 'World Changes' },
  { id: 'credits', label: 'Credits' },
]

const AMBIENT_EVENT_TYPES: AmbientEventType[] = [
  'lamp-sway', 'cat-walk', 'newspaper-flutter', 'leaves-drift', 'train-horn', 'pigeons-fly',
]

const WEATHER_PRESETS: { label: string; rainIntensity: number; fogDensity: number; windStrength: number; hasThunder: boolean }[] = [
  { label: 'Clear', rainIntensity: 0, fogDensity: 0.08, windStrength: 0.15, hasThunder: false },
  { label: 'Light Rain', rainIntensity: 0.3, fogDensity: 0.3, windStrength: 0.25, hasThunder: false },
  { label: 'Heavy Rain', rainIntensity: 0.9, fogDensity: 0.5, windStrength: 0.6, hasThunder: true },
  { label: 'Foggy', rainIntensity: 0.1, fogDensity: 0.85, windStrength: 0.2, hasThunder: false },
]

const TIME_PRESETS: { label: string; timeOfDay: TimeOfDay; brightness: number; warmth: number }[] = [
  { label: 'Late Night', timeOfDay: 'LATE_NIGHT', brightness: 0.4, warmth: 0.2 },
  { label: 'Near Midnight', timeOfDay: 'NEAR_MIDNIGHT', brightness: 0.65, warmth: 0.5 },
  { label: 'Early Dawn', timeOfDay: 'EARLY_DAWN', brightness: 0.85, warmth: 0.75 },
  { label: 'Sunrise', timeOfDay: 'SUNRISE', brightness: 1.0, warmth: 1.0 },
]

const panelButtonStyle: React.CSSProperties = {
  all: 'unset',
  cursor: 'pointer',
  background: 'rgba(212,132,58,0.15)',
  border: '1px solid rgba(212,132,58,0.4)',
  borderRadius: 3,
  padding: '4px 8px',
  fontSize: 10,
  color: '#f2e8d5',
  fontFamily: 'monospace',
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ opacity: 0.6, marginBottom: 6, letterSpacing: '1px' }}>{children}</div>
}

/**
 * DebugPanel
 *
 * Development-only tools for exercising the station and collectible engine
 * without playing through the whole game. Tree-shaken out of production
 * builds via the NODE_ENV check below.
 */
export function DebugPanel() {
  const {
    notebookState,
    collectionState,
    collect,
    openNotebook,
    unlockNotebook,
    jumpTo,
    debugReset,
    isCollected,
  } = useNotebook()
  const { animationState, setReducedMotion } = useAnimationManager()
  const { transitionTo } = useScene()
  const { debugSetWeather, debugSetTimeOfDay } = useTimeline()
  const {
    debugState,
    setShowInteractionOutlines,
    setAmbientEventsEnabled,
    setTrainMovementPaused,
    setTrainScenerySpeed,
    setTrainCondensationDisabled,
    triggerTrainArrivalReplay,
  } = useDebug()
  const { triggerNow } = useAmbientEvent()
  const { reveal } = useMemoryReveal()
  const [expanded, setExpanded] = useState(false)
  const [jumpSection, setJumpSection] = useState(1)
  const [jumpPage, setJumpPage] = useState(0)

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div
      style={{
        position: 'fixed',
        left: 8,
        bottom: 8,
        zIndex: Z_INDEX.DEBUG_PANEL,
        fontFamily: 'monospace',
        pointerEvents: 'all',
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          ...panelButtonStyle,
          background: 'rgba(0,0,0,0.75)',
          border: '1px solid rgba(212,132,58,0.6)',
        }}
      >
        {expanded ? 'DEBUG ▾' : 'DEBUG ▸'}
      </button>

      {expanded && (
        <div
          style={{
            marginTop: 6,
            background: 'rgba(8,9,14,0.95)',
            border: '1px solid rgba(212,132,58,0.4)',
            borderRadius: 4,
            padding: 12,
            width: 340,
            maxHeight: '78vh',
            overflowY: 'auto',
            color: '#f2e8d5',
            fontSize: 11,
          }}
        >
          {/* Station teleport */}
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>STATION — TELEPORT</SectionLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATION_AREAS.map((area) => (
                <button key={area.id} style={panelButtonStyle} onClick={() => transitionTo(area.id, 100)}>
                  {area.label}
                </button>
              ))}
            </div>
          </div>

          {/* Train controls */}
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>TRAIN — TELEPORT</SectionLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {TRAIN_AREAS.map((area) => (
                <button key={area.id} style={panelButtonStyle} onClick={() => transitionTo(area.id, 100)}>
                  {area.label}
                </button>
              ))}
            </div>
            <SectionLabel>TRAIN — CONTROLS</SectionLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <button style={panelButtonStyle} onClick={triggerTrainArrivalReplay}>
                Replay arrival
              </button>
              <button style={panelButtonStyle} onClick={() => setTrainMovementPaused(!debugState.trainMovementPaused)}>
                {debugState.trainMovementPaused ? 'Resume movement' : 'Pause movement'}
              </button>
              <button style={panelButtonStyle} onClick={() => setTrainCondensationDisabled(!debugState.trainCondensationDisabled)}>
                {debugState.trainCondensationDisabled ? 'Condensation: off' : 'Condensation: on'}
              </button>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Scenery speed
              <input
                type="range"
                min={0.25} max={3} step={0.25}
                value={debugState.trainScenerySpeed}
                onChange={(e) => setTrainScenerySpeed(Number(e.target.value))}
              />
              <span style={{ opacity: 0.7 }}>{debugState.trainScenerySpeed}×</span>
            </label>
          </div>

          {/* Sunrise / proposal teleport */}
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>SUNRISE — TELEPORT</SectionLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SUNRISE_AREAS.map((area) => (
                <button key={area.id} style={panelButtonStyle} onClick={() => transitionTo(area.id, 100)}>
                  {area.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interaction / ambient toggles */}
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>DISCOVERY & AMBIENCE</SectionLabel>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={debugState.showInteractionOutlines}
                onChange={(e) => setShowInteractionOutlines(e.target.checked)}
              />
              Show interaction outlines
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={debugState.ambientEventsEnabled}
                onChange={(e) => setAmbientEventsEnabled(e.target.checked)}
              />
              Ambient events enabled
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {AMBIENT_EVENT_TYPES.map((type) => (
                <button key={type} style={panelButtonStyle} onClick={() => triggerNow(type)}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Weather / time of day */}
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>WEATHER</SectionLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {WEATHER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  style={panelButtonStyle}
                  onClick={() =>
                    debugSetWeather({
                      rainIntensity: preset.rainIntensity,
                      fogDensity: preset.fogDensity,
                      windStrength: preset.windStrength,
                      hasThunder: preset.hasThunder,
                      rainDropCount: Math.floor(preset.rainIntensity * 300),
                      puddlesVisible: preset.rainIntensity > 0.2,
                    })
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <SectionLabel>TIME OF DAY</SectionLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  style={panelButtonStyle}
                  onClick={() =>
                    debugSetTimeOfDay(preset.timeOfDay, {
                      brightness: preset.brightness,
                      warmth: preset.warmth,
                    })
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notebook controls */}
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>NOTEBOOK</SectionLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={panelButtonStyle} onClick={unlockNotebook}>
                Unlock
              </button>
              <button
                style={panelButtonStyle}
                onClick={() => {
                  unlockNotebook()
                  openNotebook()
                }}
              >
                Open Instantly
              </button>
              <button style={panelButtonStyle} onClick={debugReset}>
                Reset Notebook
              </button>
            </div>
            <div style={{ marginTop: 6, opacity: 0.7 }}>
              unlocked: {String(notebookState.isUnlocked)} · open: {String(notebookState.isOpen)} · collected:{' '}
              {collectionState.totalCollected}/{collectionState.totalAvailable} · final letter:{' '}
              {String(collectionState.isComplete)}
            </div>
          </div>

          {/* Jump to page */}
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>JUMP TO NOTEBOOK PAGE</SectionLabel>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={jumpSection}
                onChange={(e) => setJumpSection(Number(e.target.value))}
                style={{ background: '#111', color: '#f2e8d5', border: '1px solid rgba(212,132,58,0.4)', fontSize: 10 }}
              >
                {NOTEBOOK_SECTIONS.map((s) => (
                  <option key={s.sectionNumber} value={s.sectionNumber}>
                    {s.sectionNumber}. {s.title}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={jumpPage}
                onChange={(e) => setJumpPage(Number(e.target.value))}
                style={{ width: 40, background: '#111', color: '#f2e8d5', border: '1px solid rgba(212,132,58,0.4)', fontSize: 10 }}
              />
              <button style={panelButtonStyle} onClick={() => jumpTo(jumpSection, jumpPage)}>
                Go
              </button>
            </div>
          </div>

          {/* Animation */}
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>ANIMATION</SectionLabel>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!animationState.reducedMotion}
                onChange={(e) => setReducedMotion(!e.target.checked)}
              />
              Handwriting / motion animation enabled
            </label>
            <div style={{ opacity: 0.5, marginTop: 4, fontSize: 9 }}>
              (reuses the global reduced-motion toggle — affects all animated UI, not only ink writing)
            </div>
          </div>

          {/* Simulate collection */}
          <div>
            <SectionLabel>SPAWN / SIMULATE COLLECTION ({PLACEHOLDER_MEMORIES.length})</SectionLabel>
            <button
              style={{ ...panelButtonStyle, marginBottom: 6 }}
              onClick={() => PLACEHOLDER_MEMORIES.forEach((m) => collect(m))}
            >
              Collect All Placeholders
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PLACEHOLDER_MEMORIES.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                  <span style={{ opacity: isCollected(m.id) ? 1 : 0.5 }}>
                    [{m.category}] {m.title}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={panelButtonStyle} onClick={() => reveal(m)}>
                      Preview
                    </button>
                    <button
                      style={{ ...panelButtonStyle, opacity: isCollected(m.id) ? 0.4 : 1 }}
                      disabled={isCollected(m.id)}
                      onClick={() => collect(m)}
                    >
                      {isCollected(m.id) ? '✓' : 'Collect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
