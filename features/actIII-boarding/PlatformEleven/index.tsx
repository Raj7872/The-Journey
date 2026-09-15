'use client'

import { useEffect, useState } from 'react'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useAmbientEvent } from '@/engine/AmbientEventManager/AmbientEventContext'
import { AmbientLight } from '@/components/station/AmbientLight'
import { StationObject } from '@/components/station/StationObject'
import { WorldObject } from '@/components/world/WorldObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { useParallax } from '@/hooks/useParallax'
import { groundShadow, faceGradient } from '@/lib/utils/shading'
import { TIMING } from '@/lib/constants/timing'

/**
 * PlatformEleven
 *
 * The last platform. Quieter than everywhere else — the rain has almost
 * stopped, the announcements have gone long silent, and the light is
 * turning warm for the first time all night. Nothing here rushes the
 * player; the platform has been waiting, and it can keep waiting.
 */
export function PlatformEleven() {
  const { transitionTo } = useScene()
  const { timeline } = useTimeline()
  const { currentEvent } = useAmbientEvent()
  const parallaxRef = useParallax<HTMLDivElement>({ strength: 0.015 })
  const [distantHorn, setDistantHorn] = useState(false)

  useEffect(() => {
    if (currentEvent?.type !== 'train-horn') return
    setDistantHorn(true)
    const t = setTimeout(() => setDistantHorn(false), TIMING.AMBIENT_EVENT_DURATION)
    return () => clearTimeout(t)
  }, [currentEvent])

  const b = timeline.lightingProfile.brightness
  const w = timeline.lightingProfile.warmth
  const rain = timeline.weatherState.rainIntensity

  return (
    <div
      ref={parallaxRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="Platform Eleven — the last platform"
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${Math.round(8+w*5)},${Math.round(9+w*3)},${Math.round(18-w*4)},1) 0%,
          rgba(${Math.round(10+w*6)},${Math.round(10+w*4)},${Math.round(16-w*3)},1) 100%)`,
        transition: 'background 4s ease',
      }} aria-hidden="true" />

      {/* Platform floor */}
      <PerspectiveFloor
        height="28%"
        colorNear={`rgba(${Math.round(16+w*7)},${Math.round(14+w*4)},${Math.round(11+w*2)},1)`}
        colorFar={`rgba(${Math.round(7+w*4)},${Math.round(8+w*3)},${Math.round(14-w*3)},1)`}
        lineColor={`rgba(255,255,255,${0.1 + b * 0.08})`}
        style={{ transform: `translateX(calc(var(--parallax-x, 0px) * 0.25))` }}
      />

      {/* A last, sparse rain — most of the storm has already passed here */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
        {Array.from({ length: Math.max(1, Math.round(rain * 16)) }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + i * 21}%`,
            top: 0,
            width: 1,
            height: `${10 + (i % 3) * 6}%`,
            background: `rgba(160,185,220,${rain * (0.1 + (i % 4) * 0.03)})`,
            animation: `platform-rain-fall ${1.1 + (i % 3) * 0.3}s linear ${i * 0.6}s infinite`,
          }} />
        ))}
      </div>

      {/* Drifting fog along the far tracks — slow, constant, "still waiting" movement */}
      <div style={{
        position: 'absolute', bottom: '28%', left: 0, right: 0, height: '20%',
        overflow: 'hidden',
      }} aria-hidden="true">
        <div style={{
          position: 'absolute', bottom: 0, left: '-20%', width: '140%', height: '100%',
          background: `linear-gradient(0deg,
            rgba(150,170,200,${timeline.weatherState.fogDensity * 0.09}) 0%,
            transparent 100%)`,
          animation: 'platform-fog-drift 26s ease-in-out infinite',
          transition: 'background 4s ease',
        }} />
      </div>

      {/* Track / horizon line — the direction the train will come from */}
      <div style={{
        position: 'absolute', bottom: '28%', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, rgba(210,155,72,${0.15+b*0.2}), transparent)`,
        transition: 'background 4s ease',
      }} aria-hidden="true" />

      {/* Two ceiling lamps — warmer, steadier than the rest of the station */}
      <div style={{ position: 'absolute', top: 0, left: '30%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <AmbientLight size="large" flickerOffset={0.8} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: '72%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <AmbientLight size="medium" flickerOffset={2.1} />
      </div>

      {/* An empty bench — waiting, same as everything else here */}
      <WorldObject
        label="An empty bench on the platform"
        hint="Waiting, same as you"
        interactSfx="paper-rustle"
        style={{
          position: 'absolute', bottom: '28%', left: '20%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.5))`,
          opacity: 0.6 + b * 0.2,
        }}
      >
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={groundShadow(100, 0.35)} />
          <div style={{
            width: 110, height: 14,
            background: faceGradient(46+Math.round(w*10), 34+Math.round(w*7), 20+Math.round(w*4), 0.9, 10),
            borderRadius: 2,
            borderTop: `1px solid rgba(210,155,72,${0.14 + b * 0.1})`,
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 6, height: 22, borderRadius: '0 0 2px 2px',
                background: 'linear-gradient(180deg, rgba(46,34,20,0.9), rgba(26,18,10,0.9))',
              }} />
            ))}
          </div>
        </div>
      </WorldObject>

      {/* Platform sign */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono,"Special Elite",monospace)',
        fontSize: 15, letterSpacing: '3px',
        color: `rgba(210,155,72,${0.35+b*0.35})`,
        textTransform: 'uppercase',
        textAlign: 'center',
        transition: 'color 4s ease',
      }}>
        Platform 11:59
        <div style={{ fontSize: 12, letterSpacing: '1.5px', marginTop: 8, opacity: 0.6 }}>
          The last train arrives shortly.
        </div>
        {distantHorn && (
          <div style={{
            fontSize: 8, letterSpacing: '2px', marginTop: 10, opacity: 0.5,
            fontStyle: 'italic', animation: 'hint-fade-in 1.5s ease',
          }}>
            — a distant horn, somewhere down the line —
          </div>
        )}
      </div>

      {/* ── NAVIGATION ── */}
      <button
        onClick={() => transitionTo('waiting-room', 'camera-move', 2000)}
        style={{
          position: 'absolute', bottom: '10%', left: 28,
          background: `rgba(212,132,58,${0.08 + b * 0.06})`,
          border: `1px solid rgba(212,132,58,${0.35 + b * 0.15})`,
          borderRadius: 3,
          cursor: 'none',
          fontFamily: 'var(--font-mono,"Special Elite",monospace)',
          fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase',
          color: `rgba(212,132,58,${0.6 + b * 0.3})`, padding: '10px 16px',
          boxShadow: `0 0 16px 4px rgba(212,132,58,${0.14 + b * 0.1})`,
          transition: 'all 0.3s ease',
        }}
        aria-label="Return to waiting room"
      >
        ← Waiting Room
      </button>

      <StationObject
        label="Wait for the train"
        hint="Wait"
        onClick={() => transitionTo('train-arrival', 'camera-move')}
        style={{ position: 'absolute', bottom: '10%', right: 28 }}
      >
        <div style={{
          background: `rgba(212,132,58,${0.1 + b * 0.08})`,
          border: `1px solid rgba(212,132,58,${0.4 + b * 0.2})`,
          borderRadius: 3,
          fontFamily: 'var(--font-mono,"Special Elite",monospace)',
          fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase',
          color: `rgba(212,132,58,${0.65 + b * 0.3})`, padding: '10px 16px',
        }}>
          Wait for the Train →
        </div>
      </StationObject>

      <style>{`
        @keyframes platform-rain-fall {
          from { transform: translateY(-10%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          to { transform: translateY(110%); opacity: 0; }
        }
        @keyframes platform-fog-drift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6%); }
        }
        @keyframes hint-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
